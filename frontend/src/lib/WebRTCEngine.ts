import { useTransferStore } from '../store/useTransferStore';
import JSZip from 'jszip';
import { db, auth } from './firebase';
import { ref, onValue, push, set, onChildAdded, onDisconnect, remove, off, DataSnapshot } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';

const CHUNK_SIZE = 16 * 1024; // 16 KB for better stability on slow connections
const BUFFER_THRESHOLD = 1024 * 1024 * 2; // 2 MB

export class WebRTCEngine {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  
  private receivedBuffers: ArrayBuffer[] = [];
  private receivedSize = 0;
  private expectedSize = 0;
  private incomingMetadata: any = null;
  private currentTransferId: string | null = null;

  // Track transfer speed
  private lastUpdateBytes = 0;
  private lastUpdateTime = 0;
  private speedInterval: any = null;

  private iceCandidateBuffer: any[] = [];
  
  // Pending transfer state
  private pendingFile: Blob | null = null;
  private pendingFileName: string = '';
  private pendingIsZip: boolean = false;
  private pendingTransferId: string = '';

  private myId: string | null = null;
  private roomId: string | null = null;

  constructor() {
    // Auth anonymously to get a unique ID
    signInAnonymously(auth).then((user) => {
      this.myId = user.user.uid;
      console.log('Authenticated as:', this.myId);
    }).catch(err => console.error('Auth error:', err));
  }

  public async connect() {
    // Handled by specific actions (create/join)
  }

  public disconnect() {
    this.cleanup();
    if (this.roomId && this.myId) {
      const userRef = ref(db, `rooms/${this.roomId}/users/${this.myId}`);
      remove(userRef);
    }
  }

  private processIceBuffer() {
    if (this.peerConnection && this.peerConnection.remoteDescription) {
      while (this.iceCandidateBuffer.length > 0) {
        const candidate = this.iceCandidateBuffer.shift();
        this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(err => {
          console.error("Failed to add buffered ICE candidate", err);
        });
      }
    }
  }

  private setupSignalingListeners(roomId: string) {
    if (!this.myId) return;

    const signalRef = ref(db, `rooms/${roomId}/signals/${this.myId}`);
    onChildAdded(signalRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const { signalData, senderId } = data;
      console.log('Received signal from:', senderId, 'type:', signalData.type || (signalData.candidate ? 'candidate' : 'unknown'));

      if (!this.peerConnection) {
        this.initiatePeerConnection(false, roomId, senderId);
      }

      try {
        if (signalData.type === 'offer') {
          await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(signalData));
          this.processIceBuffer();
          const answer = await this.peerConnection!.createAnswer();
          await this.peerConnection!.setLocalDescription(answer);
          this.sendSignal(senderId, answer);
        } else if (signalData.type === 'answer') {
          await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(signalData));
          this.processIceBuffer();
        } else if (signalData.candidate) {
          if (this.peerConnection!.remoteDescription) {
            await this.peerConnection!.addIceCandidate(new RTCIceCandidate(signalData));
          } else {
            this.iceCandidateBuffer.push(signalData);
          }
        }
      } catch (err) {
        console.error('Signal error', err);
      }

      // Remove signal after processing
      remove(ref(db, `rooms/${roomId}/signals/${this.myId}/${snapshot.key}`));
    });

    // Listen for peer-joined (for sender)
    const usersRef = ref(db, `rooms/${roomId}/users`);
    onChildAdded(usersRef, (snapshot) => {
      const peerId = snapshot.key;
      if (peerId !== this.myId) {
        console.log('Peer joined:', peerId);
        if (useTransferStore.getState().role === 'sender') {
          this.initiatePeerConnection(true, roomId, peerId!);
        }
      }
    });

    // Listen for peer-left
    onValue(usersRef, (snapshot) => {
      const users = snapshot.val() || {};
      const peerIds = Object.keys(users).filter(id => id !== this.myId);
      if (peerIds.length === 0 && useTransferStore.getState().connectionState === 'connected') {
        useTransferStore.getState().setError('Peer disconnected');
        this.cleanup();
      }
    });
  }

  private sendSignal(recipientId: string, signalData: any) {
    if (!this.roomId || !this.myId) return;
    const signalRef = ref(db, `rooms/${this.roomId}/signals/${recipientId}`);
    push(signalRef, { senderId: this.myId, signalData });
  }

  public async createRoom() {
    if (!this.myId) {
        await signInAnonymously(auth);
        this.myId = auth.currentUser?.uid || null;
    }
    const roomId = Math.floor(100000 + Math.random() * 900000).toString();
    this.roomId = roomId;
    
    useTransferStore.getState().setConnectionState('waiting');
    useTransferStore.getState().setRoomId(roomId);

    const userRef = ref(db, `rooms/${roomId}/users/${this.myId}`);
    await set(userRef, { joinedAt: Date.now() });
    onDisconnect(userRef).remove();

    this.setupSignalingListeners(roomId);
    return roomId;
  }

  public async joinRoom(roomId: string) {
    if (!this.myId) {
        await signInAnonymously(auth);
        this.myId = auth.currentUser?.uid || null;
    }
    this.roomId = roomId;

    const roomRef = ref(db, `rooms/${roomId}`);
    onValue(roomRef, (snapshot) => {
        if (!snapshot.exists()) {
            useTransferStore.getState().setError('Room not found');
            return;
        }
    }, { onlyOnce: true });

    const userRef = ref(db, `rooms/${roomId}/users/${this.myId}`);
    await set(userRef, { joinedAt: Date.now() });
    onDisconnect(userRef).remove();

    this.setupSignalingListeners(roomId);
    useTransferStore.getState().setRoomId(roomId);
  }

  private initiatePeerConnection(isInitiator: boolean, roomId: string, peerId: string) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:stun.services.mozilla.com' },
        { urls: 'stun:global.stun.twilio.com:3478' },
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
    });

    useTransferStore.getState().setConnectionState('connecting');

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(peerId, event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
      if (this.peerConnection?.connectionState === 'connected') {
        useTransferStore.getState().setConnectionState('connected');
      } else if (this.peerConnection?.connectionState === 'failed' || this.peerConnection?.connectionState === 'disconnected') {
        useTransferStore.getState().setError('Connection lost');
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      const state = (this.peerConnection as any)?.iceConnectionState;
      if (state === 'connected' || state === 'completed') {
        useTransferStore.getState().setConnectionState('connected');
      } else if (state === 'failed' || state === 'disconnected') {
        useTransferStore.getState().setError('Connection lost');
      }
    };

    if (isInitiator) {
      this.dataChannel = this.peerConnection.createDataChannel('fileTransfer', { ordered: true });
      this.setupDataChannel();

      this.peerConnection.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      }).then((offer) => {
        return this.peerConnection!.setLocalDescription(offer);
      }).then(() => {
        this.sendSignal(peerId, this.peerConnection!.localDescription);
      }).catch(err => {
        console.error('Error creating offer', err);
        useTransferStore.getState().setError('Failed to initiate connection');
      });
    } else {
      this.peerConnection.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setupDataChannel();
      };
    }
  }

  private setupDataChannel() {
    if (!this.dataChannel) return;

    this.dataChannel.binaryType = 'arraybuffer';
    this.dataChannel.bufferedAmountLowThreshold = BUFFER_THRESHOLD / 2;

    this.dataChannel.onopen = () => {
      console.log('Data channel open');
      if (useTransferStore.getState().role === 'sender') {
        this.startFileTransfer();
      }
    };

    this.dataChannel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        const msg = JSON.parse(event.data);
        if (msg.type === 'metadata') {
          if (this.currentTransferId !== msg.transferId) {
            this.receivedBuffers = [];
            this.receivedSize = 0;
            this.currentTransferId = msg.transferId;
            this.incomingMetadata = msg;
            this.expectedSize = msg.size;
          }
          useTransferStore.getState().setIncomingFile({ name: msg.name, size: msg.size, type: msg.fileType, isZip: msg.isZip });
          useTransferStore.getState().setConnectionState('transferring');
          this.startSpeedCalculation();
          if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({ type: 'resume-request', offset: this.receivedSize, transferId: msg.transferId }));
          }
        } else if (msg.type === 'resume-request') {
          this.continueTransfer(msg.offset);
        } else if (msg.type === 'eof') {
          void this.finishDownload();
        } else if (msg.type === 'text') {
          useTransferStore.getState().setIncomingText(msg.content);
          useTransferStore.getState().setConnectionState('completed');
        }
      } else if (event.data instanceof ArrayBuffer) {
        this.receivedBuffers.push(event.data);
        this.receivedSize += event.data.byteLength;
        const progress = Math.min(100, Math.round((this.receivedSize / this.expectedSize) * 100));
        useTransferStore.getState().setProgress(progress);
      }
    };
  }

  public async startFileTransfer() {
    const state = useTransferStore.getState();
    const { textPayload, files } = state;
    if (!this.dataChannel) return;

    if (textPayload) {
      state.setConnectionState('transferring');
      this.dataChannel.send(JSON.stringify({ type: 'text', content: textPayload }));
      state.setConnectionState('completed');
      return;
    }

    if (files.length === 0) return;
    state.setConnectionState('transferring');

    let fileToTransfer: Blob | File;
    let fileName = '';
    let isZip = false;

    if (files.length === 1) {
      fileToTransfer = files[0];
      fileName = files[0].name;
    } else {
      isZip = true;
      fileName = 'JaldiBhejo_Files.zip';
      const zip = new JSZip();
      files.forEach(f => zip.file(f.name, f));
      fileToTransfer = await zip.generateAsync({ type: 'blob' });
    }

    const transferId = `${fileName}-${fileToTransfer.size}`;
    this.pendingFile = fileToTransfer;
    this.pendingFileName = fileName;
    this.pendingIsZip = isZip;
    this.pendingTransferId = transferId;

    this.dataChannel.send(JSON.stringify({
      type: 'metadata',
      transferId,
      name: fileName,
      size: fileToTransfer.size,
      fileType: isZip ? 'application/zip' : fileToTransfer.type,
      isZip
    }));
  }

  private async continueTransfer(offset: number) {
    if (!this.dataChannel || !this.pendingFile) return;
    this.startSpeedCalculation();
    let currentOffset = offset;
    const fileToTransfer = this.pendingFile;

    const readSlice = (o: number): Promise<ArrayBuffer> => {
      return new Promise((resolve, reject) => {
        const slice = fileToTransfer.slice(o, o + CHUNK_SIZE);
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target!.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(slice);
      });
    };

    while (currentOffset < fileToTransfer.size) {
      if (this.dataChannel.readyState !== 'open') break;
      if (this.dataChannel.bufferedAmount > BUFFER_THRESHOLD) {
        await new Promise<void>((resolve) => {
          if (!this.dataChannel) return resolve();
          this.dataChannel.onbufferedamountlow = () => {
            if (this.dataChannel) this.dataChannel.onbufferedamountlow = null;
            resolve();
          };
        });
        if (!this.dataChannel || this.dataChannel.readyState !== 'open') break;
      }
      const chunk = await readSlice(currentOffset);
      this.dataChannel.send(chunk);
      currentOffset += chunk.byteLength;
      this.receivedSize = currentOffset;
      const progress = Math.min(100, Math.round((currentOffset / fileToTransfer.size) * 100));
      useTransferStore.getState().setProgress(progress);
    }

    if (this.dataChannel && this.dataChannel.readyState === 'open' && currentOffset >= fileToTransfer.size) {
      this.dataChannel.send(JSON.stringify({ type: 'eof' }));
      this.stopSpeedCalculation();
      useTransferStore.getState().setConnectionState('completed');
      this.pendingFile = null;
    }
  }

  private async finishDownload() {
    this.stopSpeedCalculation();
    const blob = new Blob(this.receivedBuffers, { type: this.incomingMetadata?.fileType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    useTransferStore.getState().setDownloadedFileUrl(url);
    useTransferStore.getState().setConnectionState('completed');
    this.receivedBuffers = [];
  }

  private startSpeedCalculation() {
    this.lastUpdateBytes = this.receivedSize;
    this.lastUpdateTime = Date.now();
    this.speedInterval = setInterval(() => {
      const now = Date.now();
      const timeDiff = (now - this.lastUpdateTime) / 1000;
      const bytesDiff = this.receivedSize - this.lastUpdateBytes;
      if (timeDiff > 0) {
        let speed = bytesDiff / timeDiff;
        let unit = 'B/s';
        if (speed > 1024 * 1024) { speed /= (1024 * 1024); unit = 'MB/s'; }
        else if (speed > 1024) { speed /= 1024; unit = 'KB/s'; }
        useTransferStore.getState().setTransferSpeed(`${speed.toFixed(2)} ${unit}`);
      }
      this.lastUpdateBytes = this.receivedSize;
      this.lastUpdateTime = now;
    }, 1000);
  }

  private stopSpeedCalculation() {
    if (this.speedInterval) { clearInterval(this.speedInterval); this.speedInterval = null; }
  }

  private cleanup() {
    this.stopSpeedCalculation();
    if (this.dataChannel) { this.dataChannel.close(); this.dataChannel = null; }
    if (this.peerConnection) { this.peerConnection.close(); this.peerConnection = null; }
    if (this.roomId && this.myId) {
        const signalRef = ref(db, `rooms/${this.roomId}/signals/${this.myId}`);
        off(signalRef);
        const usersRef = ref(db, `rooms/${this.roomId}/users`);
        off(usersRef);
    }
  }
}

export const webrtcEngine = new WebRTCEngine();
