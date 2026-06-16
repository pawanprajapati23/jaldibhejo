import { useTransferStore } from '../store/useTransferStore';
import JSZip from 'jszip';
import { db, auth } from './firebase';
import { ref, onValue, push, set, onChildAdded, onDisconnect, remove, off, get } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';

let CHUNK_SIZE = 16 * 1024; // Starts at 16 KB, will be adaptive
const MAX_CHUNK_SIZE = 256 * 1024; // Max 256 KB for high-speed networks
const MIN_CHUNK_SIZE = 8 * 1024; // Min 8 KB for very unstable networks
const BUFFER_THRESHOLD = 1024 * 1024 * 2; // 2 MB

export class WebRTCEngine {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  
  private receivedBuffers: ArrayBuffer[] = [];
  private receivedSize = 0;
  private expectedSize = 0;
  private incomingMetadata: any = null;
  private currentTransferId: string | null = null;

  // Track transfer speed and health
  private lastUpdateBytes = 0;
  private lastUpdateTime = 0;
  private speedInterval: any = null;
  private pingInterval: any = null;
  private lastPingTime = 0;

  private iceCandidateBuffer: any[] = [];
  
  // Pending transfer state for auto-healing
  private pendingFile: Blob | null = null;
  private pendingFileName: string = '';
  private pendingIsZip: boolean = false;
  private pendingTransferId: string = '';

  private mySessionId: string = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  private roomId: string | null = null;
  private currentPeerId: string | null = null;
  private connectionTimeout: any = null;
  private isRestartingIce = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.ensureAuth().catch(() => {});
      // Listen for network changes
      window.addEventListener('online', () => this.handleNetworkChange());
      window.addEventListener('offline', () => {
        useTransferStore.getState().setError('You are offline. Waiting for connection...');
      });
    }
  }

  private async ensureAuth() {
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch (error: any) {
        console.error("Firebase Auth Error:", error);
      }
    }
  }

  private handleNetworkChange() {
    console.log('Network back online, attempting ICE restart...');
    this.restartIce();
  }

  public async connect() {
    await this.ensureAuth();
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
        this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
    }
  }

  private setupSignalingListeners(roomId: string) {
    const signalRef = ref(db, `rooms/${roomId}/signals/${this.mySessionId}`);
    onChildAdded(signalRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const { signalData, senderId } = data;
      this.currentPeerId = senderId;

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
          this.isRestartingIce = false;
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
      remove(ref(db, `rooms/${roomId}/signals/${this.mySessionId}/${snapshot.key}`)).catch(() => {});
    });

    const usersRef = ref(db, `rooms/${roomId}/users`);
    onChildAdded(usersRef, (snapshot) => {
      const peerId = snapshot.key;
      if (peerId !== this.mySessionId) {
        if (useTransferStore.getState().role === 'sender') {
          this.initiatePeerConnection(true, roomId, peerId!);
        }
      }
    });

    onValue(usersRef, (snapshot) => {
      const users = snapshot.val() || {};
      const peerIds = Object.keys(users).filter(id => id !== this.mySessionId);
      if (peerIds.length === 0 && useTransferStore.getState().connectionState === 'connected') {
        useTransferStore.getState().setError('Peer disconnected. Waiting for them to return...');
        // Don't cleanup fully, allow for re-connection if they refresh
      }
    });
  }

  private sendSignal(recipientId: string, signalData: any) {
    if (!this.roomId) return;
    const signalRef = ref(db, `rooms/${this.roomId}/signals/${recipientId}`);
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

  private async restartIce() {
    if (!this.peerConnection || !this.currentPeerId || this.isRestartingIce) return;
    this.isRestartingIce = true;
    console.log("Initiating ICE Restart...");
    try {
      const offer = await this.peerConnection.createOffer({ iceRestart: true });
      await this.peerConnection.setLocalDescription(offer);
      this.sendSignal(this.currentPeerId, offer);
    } catch (e) {
      this.isRestartingIce = false;
      console.error("ICE Restart failed", e);
    }
  }

  private initiatePeerConnection(isInitiator: boolean, roomId: string, peerId: string) {
    this.currentPeerId = peerId;
    if (this.peerConnection) {
        this.peerConnection.onicecandidate = null;
        this.peerConnection.onconnectionstatechange = null;
        this.peerConnection.oniceconnectionstatechange = null;
        this.peerConnection.close();
    }

    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
        { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }
      ],
      iceCandidatePoolSize: 10,
    });

    useTransferStore.getState().setConnectionState('connecting');

    if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
    this.connectionTimeout = setTimeout(() => {
      if (useTransferStore.getState().connectionState === 'connecting') {
        useTransferStore.getState().setError('Connection timeout. Please check your network.');
        this.restartIce();
      }
    }, 25000);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(peerId, event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('WebRTC Connection State:', state);
      if (state === 'connected') {
        if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
        useTransferStore.getState().setConnectionState('connected');
        useTransferStore.getState().setError(null);
      } else if (state === 'failed' || state === 'disconnected') {
        this.restartIce();
      }
    };

    if (isInitiator) {
      this.dataChannel = this.peerConnection.createDataChannel('fileTransfer', { ordered: true });
      this.setupDataChannel();
      this.peerConnection.createOffer().then((offer) => {
        return this.peerConnection!.setLocalDescription(offer);
      }).then(() => {
        this.sendSignal(peerId, this.peerConnection!.localDescription);
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
      this.startPing();
      const state = useTransferStore.getState();
      if (state.role === 'sender' && (state.files.length > 0 || !!state.textPayload)) {
        this.startFileTransfer();
      }
    };

    this.dataChannel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        const msg = JSON.parse(event.data);
        if (msg.type === 'ping') {
          if (this.dataChannel?.readyState === 'open') this.dataChannel.send(JSON.stringify({ type: 'pong' }));
          return;
        }
        if (msg.type === 'pong') {
          const latency = Date.now() - this.lastPingTime;
          useTransferStore.getState().setLatency(latency);
          return;
        }
        
        if (msg.type === 'metadata') {
          if (this.currentTransferId !== msg.transferId) {
            this.receivedBuffers = [];
            this.receivedSize = 0;
            this.currentTransferId = msg.transferId;
            this.incomingMetadata = msg;
            this.expectedSize = msg.size;
          }
          useTransferStore.getState().setIncomingFile({ name: msg.name, size: msg.size, type: msg.fileType, isZip: msg.isZip });
          useTransferStore.getState().setIncomingThumbnail(msg.thumbnail || null);
          useTransferStore.getState().setConnectionState('transferring');
          this.startSpeedCalculation();
          if (this.dataChannel?.readyState === 'open') {
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

  private startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.dataChannel?.readyState === 'open') {
        this.lastPingTime = Date.now();
        this.dataChannel.send(JSON.stringify({ type: 'ping' }));
      }
    }, 4000);
  }

  private stopPing() {
    if (this.pingInterval) clearInterval(this.pingInterval);
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

    if (this.pendingFile && this.pendingTransferId) {
      this.dataChannel.send(JSON.stringify({
        type: 'metadata', transferId: this.pendingTransferId, name: this.pendingFileName,
        size: this.pendingFile.size, fileType: this.pendingIsZip ? 'application/zip' : this.pendingFile.type,
        isZip: this.pendingIsZip
      }));
      return;
    }

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

    this.pendingFile = fileToTransfer;
    this.pendingFileName = fileName;
    this.pendingIsZip = isZip;
    this.pendingTransferId = `${fileName}-${fileToTransfer.size}`;

    let thumbnail: string | null = null;
    if (files.length === 1 && files[0].type.startsWith('image/')) {
      try {
        const img = new Image();
        const url = URL.createObjectURL(files[0]);
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 150;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX_SIZE) { h *= MAX_SIZE / w; w = MAX_SIZE; } }
        else { if (h > MAX_SIZE) { w *= MAX_SIZE / h; h = MAX_SIZE; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        thumbnail = canvas.toDataURL('image/jpeg', 0.5);
        URL.revokeObjectURL(url);
      } catch (e) {}
    }

    this.dataChannel.send(JSON.stringify({
      type: 'metadata', transferId: this.pendingTransferId, name: fileName,
      size: fileToTransfer.size, fileType: isZip ? 'application/zip' : fileToTransfer.type,
      isZip, thumbnail
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
          this.dataChannel!.onbufferedamountlow = () => {
            this.dataChannel!.onbufferedamountlow = null;
            resolve();
          };
        });
        if (!this.dataChannel || this.dataChannel.readyState !== 'open') break;
      }
      const chunk = await readSlice(currentOffset);
      this.dataChannel.send(chunk);
      currentOffset += chunk.byteLength;
      this.receivedSize = currentOffset;
      useTransferStore.getState().setProgress(Math.min(100, Math.round((currentOffset / fileToTransfer.size) * 100)));
      
      // Adaptive chunking based on instantaneous speed
      if (currentOffset % (CHUNK_SIZE * 20) === 0) {
        const speed = parseFloat(useTransferStore.getState().transferSpeed);
        if (speed > 5) CHUNK_SIZE = Math.min(MAX_CHUNK_SIZE, CHUNK_SIZE * 2);
        else if (speed < 1) CHUNK_SIZE = Math.max(MIN_CHUNK_SIZE, CHUNK_SIZE / 2);
      }
    }

    if (this.dataChannel?.readyState === 'open' && currentOffset >= fileToTransfer.size) {
      this.dataChannel.send(JSON.stringify({ type: 'eof' }));
      this.stopSpeedCalculation();
      useTransferStore.getState().setConnectionState('completed');
      this.pendingFile = null;
    }
  }

  private async finishDownload() {
    this.stopSpeedCalculation();
    const blob = new Blob(this.receivedBuffers, { type: this.incomingMetadata?.fileType || 'application/octet-stream' });
    useTransferStore.getState().setDownloadedFileUrl(URL.createObjectURL(blob));
    useTransferStore.getState().setConnectionState('completed');
    this.receivedBuffers = [];
  }

  private startSpeedCalculation() {
    this.lastUpdateBytes = this.receivedSize;
    this.lastUpdateTime = Date.now();
    if (this.speedInterval) clearInterval(this.speedInterval);
    this.speedInterval = setInterval(() => {
      const now = Date.now();
      const timeDiff = (now - this.lastUpdateTime) / 1000;
      const bytesDiff = Math.abs(this.receivedSize - this.lastUpdateBytes);
      if (timeDiff > 0) {
        let speedBytes = bytesDiff / timeDiff;
        let speed = speedBytes;
        let unit = 'B/s';
        if (speed > 1024 * 1024) { speed /= (1024 * 1024); unit = 'MB/s'; }
        else if (speed > 1024) { speed /= 1024; unit = 'KB/s'; }
        useTransferStore.getState().setTransferSpeed(`${speed.toFixed(2)} ${unit}`);
        useTransferStore.getState().appendSpeedHistory(speedBytes);

        // Time remaining calculation
        const remainingBytes = this.expectedSize - this.receivedSize;
        if (speedBytes > 0 && remainingBytes > 0) {
          const seconds = Math.ceil(remainingBytes / speedBytes);
          if (seconds > 3600) {
            useTransferStore.getState().setTimeRemaining(`${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m left`);
          } else if (seconds > 60) {
            useTransferStore.getState().setTimeRemaining(`${Math.floor(seconds / 60)}m ${seconds % 60}s left`);
          } else {
            useTransferStore.getState().setTimeRemaining(`${seconds}s left`);
          }
        } else {
          useTransferStore.getState().setTimeRemaining(null);
        }
      }
      this.lastUpdateBytes = this.receivedSize;
      this.lastUpdateTime = now;
    }, 1000);
  }

  private stopSpeedCalculation() {
    if (this.speedInterval) clearInterval(this.speedInterval);
  }

  private cleanup() {
    this.stopPing();
    this.stopSpeedCalculation();
    if (this.dataChannel) { this.dataChannel.close(); this.dataChannel = null; }
    if (this.peerConnection) { this.peerConnection.close(); this.peerConnection = null; }
  }
}

export const webrtcEngine = new WebRTCEngine();
