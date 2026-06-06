import { useTransferStore } from '../store/useTransferStore';
import JSZip from 'jszip';
import { db, auth } from './firebase';
import { ref, onValue, push, set, onChildAdded, onDisconnect, remove, off, get } from 'firebase/database';
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

  // Use a unique session ID per tab instead of Firebase UID so multiple tabs in the same browser can connect
  private mySessionId: string = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  private roomId: string | null = null;
  private connectionTimeout: any = null;

  constructor() {
    // Fire-and-forget auth initialization
    if (typeof window !== 'undefined') {
      this.ensureAuth().catch(() => {});
    }
  }

  private async ensureAuth() {
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
        console.log('Authenticated for signaling session:', this.mySessionId);
      } catch (error: any) {
        console.error("Firebase Auth Error:", error);
        throw new Error(`Authentication failed. Ensure 'Anonymous' Sign-in is enabled in Firebase Console. Details: ${error.message}`);
      }
    }
  }

  public async connect() {
    // Handled by specific actions (create/join)
  }

  public disconnect() {
    this.cleanup();
    if (this.roomId) {
      const userRef = ref(db, `rooms/${this.roomId}/users/${this.mySessionId}`);
      remove(userRef).catch(() => {});
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
    const signalRef = ref(db, `rooms/${roomId}/signals/${this.mySessionId}`);
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
      remove(ref(db, `rooms/${roomId}/signals/${this.mySessionId}/${snapshot.key}`)).catch(() => {});
    });

    // Listen for peer-joined (for sender)
    const usersRef = ref(db, `rooms/${roomId}/users`);
    onChildAdded(usersRef, (snapshot) => {
      const peerId = snapshot.key;
      if (peerId !== this.mySessionId) {
        console.log('Peer joined:', peerId);
        if (useTransferStore.getState().role === 'sender') {
          this.initiatePeerConnection(true, roomId, peerId!);
        }
      }
    });

    // Listen for peer-left
    onValue(usersRef, (snapshot) => {
      const users = snapshot.val() || {};
      const peerIds = Object.keys(users).filter(id => id !== this.mySessionId);
      if (peerIds.length === 0 && useTransferStore.getState().connectionState === 'connected') {
        useTransferStore.getState().setError('Peer disconnected');
        this.cleanup();
      }
    });
  }

  private sendSignal(recipientId: string, signalData: any) {
    if (!this.roomId) return;
    const signalRef = ref(db, `rooms/${this.roomId}/signals/${recipientId}`);
    
    // Firebase Realtime DB will silently fail or reject if it receives an RTCSessionDescription
    // or RTCIceCandidate object directly because they have prototypes. We MUST serialize them.
    const serializedSignal = JSON.parse(JSON.stringify(signalData));
    
    push(signalRef, { senderId: this.mySessionId, signalData: serializedSignal })
      .catch((err) => console.error("Firebase signal push error:", err));
  }

  public async createRoom() {
    try {
      await this.ensureAuth();
      const roomId = Math.floor(100000 + Math.random() * 900000).toString();
      this.roomId = roomId;
      
      useTransferStore.getState().setConnectionState('waiting');
      useTransferStore.getState().setRoomId(roomId);

      const userRef = ref(db, `rooms/${roomId}/users/${this.mySessionId}`);
      await set(userRef, { joinedAt: Date.now() });
      onDisconnect(userRef).remove();

      this.setupSignalingListeners(roomId);
      return roomId;
    } catch (error: any) {
      useTransferStore.getState().setError(error.message || 'Failed to create room.');
    }
  }

  public async joinRoom(roomId: string) {
    try {
      await this.ensureAuth();
      this.roomId = roomId;

      // Check if room exists BEFORE joining
      const usersRef = ref(db, `rooms/${roomId}/users`);
      const snapshot = await get(usersRef);
      if (!snapshot.exists() || Object.keys(snapshot.val()).length === 0) {
          useTransferStore.getState().setError('Room not found or sender disconnected.');
          return;
      }

      const userRef = ref(db, `rooms/${roomId}/users/${this.mySessionId}`);
      await set(userRef, { joinedAt: Date.now() });
      onDisconnect(userRef).remove();

      this.setupSignalingListeners(roomId);
      useTransferStore.getState().setRoomId(roomId);
    } catch (error: any) {
      useTransferStore.getState().setError(error.message || 'Failed to join room.');
    }
  }

  private initiatePeerConnection(isInitiator: boolean, roomId: string, peerId: string) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
    });

    useTransferStore.getState().setConnectionState('connecting');

    // Add a timeout to prevent infinite "Connecting..." hangs
    if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
    this.connectionTimeout = setTimeout(() => {
      if (useTransferStore.getState().connectionState === 'connecting') {
        useTransferStore.getState().setError('Connection timeout: Strict network or firewall blocking P2P.');
        this.cleanup();
      }
    }, 20000);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(peerId, event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
      if (this.peerConnection?.connectionState === 'connected') {
        if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
        useTransferStore.getState().setConnectionState('connected');
      } else if (this.peerConnection?.connectionState === 'failed' || this.peerConnection?.connectionState === 'disconnected') {
        useTransferStore.getState().setError('Connection lost');
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      const state = (this.peerConnection as any)?.iceConnectionState;
      if (state === 'connected' || state === 'completed') {
        if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
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
    if (this.roomId) {
        const signalRef = ref(db, `rooms/${this.roomId}/signals/${this.mySessionId}`);
        off(signalRef);
        const usersRef = ref(db, `rooms/${this.roomId}/users`);
        off(usersRef);
    }
  }
}

export const webrtcEngine = new WebRTCEngine();
