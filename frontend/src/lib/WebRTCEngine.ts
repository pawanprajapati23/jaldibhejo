import { io, Socket } from 'socket.io-client';
import { useTransferStore } from '../store/useTransferStore';
import JSZip from 'jszip';

const CHUNK_SIZE = 64 * 1024; // 64 KB
const BUFFER_THRESHOLD = 1024 * 1024 * 5; // 5 MB

export class WebRTCEngine {
  private socket: Socket;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  
  private receivedBuffers: ArrayBuffer[] = [];
  private receivedSize = 0;
  private expectedSize = 0;
  private incomingMetadata: any = null;

  // Track transfer speed
  private lastUpdateBytes = 0;
  private lastUpdateTime = 0;
  private speedInterval: any = null;

  private iceCandidateBuffer: any[] = [];

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
      useTransferStore.getState().setConnectionState('waiting');
      useTransferStore.getState().setRoomId(roomId);
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
      ],
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

    if (isInitiator) {
      this.dataChannel = this.peerConnection.createDataChannel('fileTransfer', {
        ordered: true,
      });
      this.setupDataChannel();

      this.peerConnection.createOffer().then((offer) => {
        return this.peerConnection!.setLocalDescription(offer);
      }).then(() => {
        this.socket.emit('signal', { roomId, signalData: this.peerConnection!.localDescription });
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
          this.incomingMetadata = msg;
          this.expectedSize = msg.size;
          this.receivedSize = 0;
          this.receivedBuffers = [];
          useTransferStore.getState().setIncomingFile({ name: msg.name, size: msg.size, type: msg.fileType, isZip: msg.isZip });
          useTransferStore.getState().setConnectionState('transferring');
          this.startSpeedCalculation();
        } else if (msg.type === 'eof') {
          this.finishDownload();
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

  private async startFileTransfer() {
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
    this.startSpeedCalculation();

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

    // Send metadata
    this.dataChannel.send(JSON.stringify({
      type: 'metadata',
      name: fileName,
      size: fileToTransfer.size,
      fileType: isZip ? 'application/zip' : fileToTransfer.type,
      isZip
    }));

    let offset = 0;

    const readSlice = (o: number): Promise<ArrayBuffer> => {
      return new Promise((resolve, reject) => {
        const slice = fileToTransfer.slice(o, o + CHUNK_SIZE);
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target!.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(slice);
      });
    };

    while (offset < fileToTransfer.size) {
      if (this.dataChannel.readyState !== 'open') {
        useTransferStore.getState().setError('Data channel closed unexpectedly');
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
      }

      const chunk = await readSlice(offset);
      this.dataChannel.send(chunk);
      offset += chunk.byteLength;
      this.receivedSize = offset;

      const progress = Math.min(100, Math.round((offset / fileToTransfer.size) * 100));
      useTransferStore.getState().setProgress(progress);
    }

    this.dataChannel.send(JSON.stringify({ type: 'eof' }));
    this.stopSpeedCalculation();
    useTransferStore.getState().setConnectionState('completed');
  }

  private finishDownload() {
    this.stopSpeedCalculation();
    const blob = new Blob(this.receivedBuffers, { type: this.incomingMetadata?.fileType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = this.incomingMetadata?.name || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    useTransferStore.getState().setConnectionState('completed');
    
    // Clear memory
    this.receivedBuffers = [];
  }

  private startSpeedCalculation() {
    this.lastUpdateBytes = 0;
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
