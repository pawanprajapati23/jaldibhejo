import { create } from 'zustand';

export type ConnectionState = 'disconnected' | 'waiting' | 'connecting' | 'connected' | 'transferring' | 'completed' | 'error';
export type AppMode = 'idle' | 'send' | 'receive';
export type Role = 'sender' | 'receiver' | null;

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  isZip?: boolean;
}

interface TransferState {
  mode: AppMode;
  role: Role;
  connectionState: ConnectionState;
  roomId: string | null;
  files: File[];
  textPayload: string | null;
  incomingFile: FileMetadata | null;
  incomingText: string | null;
  incomingThumbnail: string | null;
  downloadedFileUrl: string | null;
  progress: number;
  transferSpeed: string;
  timeRemaining: string | null;
  latency: number | null;
  error: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  setMode: (mode: AppMode) => void;
  setRole: (role: Role) => void;
  setConnectionState: (state: ConnectionState) => void;
  setRoomId: (id: string | null) => void;
  setFiles: (files: File[]) => void;
  setTextPayload: (text: string | null) => void;
  setIncomingFile: (file: FileMetadata | null) => void;
  setIncomingText: (text: string | null) => void;
  setIncomingThumbnail: (thumbnail: string | null) => void;
  setDownloadedFileUrl: (url: string | null) => void;
  setProgress: (progress: number) => void;
  setTransferSpeed: (speed: string) => void;
  setTimeRemaining: (time: string | null) => void;
  setLatency: (ms: number | null) => void;
  setError: (error: string | null) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  prepareNextTransfer: () => void;
  reset: () => void;
}

export const useTransferStore = create<TransferState>((set, get) => ({
  mode: 'idle',
  role: null,
  connectionState: 'disconnected',
  roomId: null,
  files: [],
  textPayload: null,
  incomingFile: null,
  incomingText: null,
  incomingThumbnail: null,
  downloadedFileUrl: null,
  progress: 0,
  transferSpeed: '0 B/s',
  timeRemaining: null,
  latency: null,
  error: null,
  localStream: null,
  remoteStream: null,

  setMode: (mode) => set({ mode }),
  setRole: (role) => set({ role }),
  setConnectionState: (connectionState) => set({ connectionState }),
  setRoomId: (roomId) => set({ roomId }),
  setFiles: (files) => set({ files }),
  setTextPayload: (textPayload) => set({ textPayload }),
  setIncomingFile: (incomingFile) => set({ incomingFile }),
  setIncomingText: (incomingText) => set({ incomingText }),
  setIncomingThumbnail: (incomingThumbnail) => set({ incomingThumbnail }),
  setDownloadedFileUrl: (downloadedFileUrl) => set({ downloadedFileUrl }),
  setProgress: (progress) => set({ progress }),
  setTransferSpeed: (transferSpeed) => set({ transferSpeed }),
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  setLatency: (latency) => set({ latency }),
  setError: (error) => set({ error, connectionState: error ? 'error' : 'disconnected' }),
  setLocalStream: (localStream) => set({ localStream }),
  setRemoteStream: (remoteStream) => set({ remoteStream }),
  prepareNextTransfer: () => {
    const { downloadedFileUrl } = get();
    if (downloadedFileUrl) {
      URL.revokeObjectURL(downloadedFileUrl);
    }
    set({
      files: [],
      textPayload: null,
      incomingFile: null,
      incomingText: null,
      downloadedFileUrl: null,
      progress: 0,
      transferSpeed: '0 B/s',
      timeRemaining: null,
      latency: null,
      connectionState: 'connected'
    });
  },
  reset: () => {
    const { downloadedFileUrl, localStream, remoteStream } = get();
    if (downloadedFileUrl) {
      URL.revokeObjectURL(downloadedFileUrl);
    }
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(t => t.stop());
    }
    set({
      mode: 'idle',
      role: null,
      connectionState: 'disconnected',
      roomId: null,
      files: [],
      textPayload: null,
      incomingFile: null,
      incomingText: null,
      incomingThumbnail: null,
      downloadedFileUrl: null,
      progress: 0,
      transferSpeed: '0 B/s',
      timeRemaining: null,
      latency: null,
      error: null,
      localStream: null,
      remoteStream: null,
    });
  },
}));
