import { io, Socket } from 'socket.io-client';
import { useTransferStore } from '../store/useTransferStore';
import JSZip from 'jszip';

const CHUNK_SIZE = 16 * 1024; // 16 KB for better stability on slow connections
const BUFFER_THRESHOLD = 1024 * 1024 * 2; // 2 MB

export class WebRTCEngine {
  private socket: Socket;
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

  constructor(private signalingUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') {
    this.socket = io(this.signalingUrl, { autoConnect: false });
    this.setupSocketListeners();
  }

  public connect() {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  public disconnect() {
    this.cleanup();
    this.socket.disconnect();
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

  private setupSocketListeners() {
    const store = useTransferStore.getState();

    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
    });

    this.socket.on('room-created', (roomId: string) => {
      console.log('Room created:', roomId);
    });

    this.socket.on('room-joined', (roomId: string) => {
      console.log('Joined room:', roomId);
      useTransferStore.getState().setRoomId(roomId);
      this.initiatePeerConnection(false, roomId);
    });

    this.socket.on('peer-joined', (peerId: string) => {
      console.log('Peer joined:', peerId);
      const state = useTransferStore.getState();
      if (state.role === 'sender') {
        this.initiatePeerConnection(true, state.roomId!);
      }
    });

    this.socket.on('signal', async (data: { senderId: string, signalData: any }) => {
      const { signalData } = data;
      
      if (!this.peerConnection) {
        this.initiatePeerConnection(false, useTransferStore.getState().roomId!);
      }

      try {
        if (signalData.type === 'offer') {
          console.log('Received Offer');
          await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(signalData));
          this.processIceBuffer();
          
          const answer = await this.peerConnection!.createAnswer();
          await this.peerConnection!.setLocalDescription(answer);
          this.socket.emit('signal', { roomId: useTransferStore.getState().roomId, signalData: answer });
        } else if (signalData.type === 'answer') {
          console.log('Received Answer');
          await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(signalData));
          this.processIceBuffer();
        } else if (signalData.candidate) {
          if (this.peerConnection!.remoteDescription) {
            await this.peerConnection!.addIceCandidate(new RTCIceCandidate(signalData));
          } else {
            console.log('Buffering ICE candidate');
            this.iceCandidateBuffer.push(signalData);
          }
        }
      } catch (err) {
        console.error('Signal error', err);
      }
    });

    this.socket.on('error', (msg: string) => {
      useTransferStore.getState().setError(msg);
    });

    this.socket.on('peer-left', () => {
      useTransferStore.getState().setError('Peer disconnected');
      this.cleanup();
    });
  }

  public createRoom() {
    const roomId = Math.floor(100000 + Math.random() * 900000).toString();
    useTransferStore.getState().setConnectionState('waiting');
    useTransferStore.getState().setRoomId(roomId);
    this.socket.emit('create-room', roomId);
    return roomId;
  }

  public joinRoom(roomId: string) {
    this.socket.emit('join-room', roomId);
  }

  private initiatePeerConnection(isInitiator: boolean, roomId: string) {
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
        this.socket.emit('signal', { roomId, signalData: event.candidate });
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
      console.log('ICE Connection state:', this.peerConnection?.iceConnectionState);
      if (this.peerConnection?.iceConnectionState === 'connected' || this.peerConnection?.iceConnectionState === 'completed') {
        useTransferStore.getState().setConnectionState('connected');
      } else if (this.peerConnection?.iceConnectionState === 'failed' || this.peerConnection?.iceConnectionState === 'disconnected') {
        useTransferStore.getState().setError('Connection lost');
      }
    };

    if (isInitiator) {
      this.dataChannel = this.peerConnection.createDataChannel('fileTransfer', {
        ordered: true,
      });
      this.setupDataChannel();

      this.peerConnection.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      }).then((offer) => {
        return this.peerConnection!.setLocalDescription(offer);
      }).then(() => {
        this.socket.emit('signal', { roomId, signalData: this.peerConnection!.localDescription });
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
          // If it's a new transfer or different file, reset
          if (this.currentTransferId !== msg.transferId) {
            console.log('New transfer started:', msg.name);
            this.receivedBuffers = [];
            this.receivedSize = 0;
            this.currentTransferId = msg.transferId;
            this.incomingMetadata = msg;
            this.expectedSize = msg.size;
          } else {
            console.log('Resuming transfer:', msg.name, 'at', this.receivedSize);
          }

          useTransferStore.getState().setIncomingFile({ name: msg.name, size: msg.size, type: msg.fileType, isZip: msg.isZip });
          useTransferStore.getState().setConnectionState('transferring');
          this.startSpeedCalculation();
          
          // Acknowledge metadata and request resume from current offset
          if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({ type: 'resume-request', offset: this.receivedSize, transferId: msg.transferId }));
          }

        } else if (msg.type === 'resume-request') {
          console.log('Received resume-request at offset:', msg.offset);
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
    
    // Save to pending state
    this.pendingFile = fileToTransfer;
    this.pendingFileName = fileName;
    this.pendingIsZip = isZip;
    this.pendingTransferId = transferId;

    // Send metadata
    this.dataChannel.send(JSON.stringify({
      type: 'metadata',
      transferId: transferId,
      name: fileName,
      size: fileToTransfer.size,
      fileType: isZip ? 'application/zip' : fileToTransfer.type,
      isZip
    }));
    
    console.log('Metadata sent, waiting for resume-request...');
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
      if (this.dataChannel.readyState !== 'open') {
        console.log('Data channel closed during transfer');
        break;
      }

      if (this.dataChannel.bufferedAmount > BUFFER_THRESHOLD) {
        await new Promise<void>((resolve) => {
          if (!this.dataChannel) return resolve();
          this.dataChannel.onbufferedamountlow = () => {
            if (this.dataChannel) this.dataChannel.onbufferedamountlow = null;
            resolve();
          };
        });
        // Check state again after waiting
        if (!this.dataChannel || this.dataChannel.readyState !== 'open') break;
      }

      const chunk = await readSlice(currentOffset);
      this.dataChannel.send(chunk);
      currentOffset += chunk.byteLength;
      this.receivedSize = currentOffset; // For speed calculation

      const progress = Math.min(100, Math.round((currentOffset / fileToTransfer.size) * 100));
      useTransferStore.getState().setProgress(progress);
    }

    if (this.dataChannel && this.dataChannel.readyState === 'open' && currentOffset >= fileToTransfer.size) {
      this.dataChannel.send(JSON.stringify({ type: 'eof' }));
      this.stopSpeedCalculation();
      useTransferStore.getState().setConnectionState('completed');
      this.pendingFile = null; // Clear after completion
    }
  }

  private async finishDownload() {
    this.stopSpeedCalculation();
    const blob = new Blob(this.receivedBuffers, { type: this.incomingMetadata?.fileType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    const state = useTransferStore.getState();
    state.setDownloadedFileUrl(url);

    state.setConnectionState('completed');
    
    // Clear memory
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
        if (speed > 1024 * 1024) {
          speed /= (1024 * 1024);
          unit = 'MB/s';
        } else if (speed > 1024) {
          speed /= 1024;
          unit = 'KB/s';
        }
        useTransferStore.getState().setTransferSpeed(`${speed.toFixed(2)} ${unit}`);
      }

      this.lastUpdateBytes = this.receivedSize;
      this.lastUpdateTime = now;
    }, 1000);
  }

  private stopSpeedCalculation() {
    if (this.speedInterval) {
      clearInterval(this.speedInterval);
      this.speedInterval = null;
    }
  }

  private cleanup() {
    this.stopSpeedCalculation();
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}

// Singleton instance
export const webrtcEngine = new WebRTCEngine();
