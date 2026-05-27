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
  downloadedFileUrl: string | null;
  receivedFileChecksum: string | null;
  progress: number;
  transferSpeed: string;
  error: string | null;

  setMode: (mode: AppMode) => void;
  setRole: (role: Role) => void;
  setConnectionState: (state: ConnectionState) => void;
  setRoomId: (id: string | null) => void;
  setFiles: (files: File[]) => void;
  setTextPayload: (text: string | null) => void;
  setIncomingFile: (file: FileMetadata | null) => void;
  setIncomingText: (text: string | null) => void;
  setDownloadedFileUrl: (url: string | null) => void;
  setReceivedFileChecksum: (checksum: string | null) => void;
  setProgress: (progress: number) => void;
  setTransferSpeed: (speed: string) => void;
  setError: (error: string | null) => void;
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
  downloadedFileUrl: null,
  receivedFileChecksum: null,
  progress: 0,
  transferSpeed: '0 B/s',
  error: null,

  setMode: (mode) => set({ mode }),
  setRole: (role) => set({ role }),
  setConnectionState: (connectionState) => set({ connectionState }),
  setRoomId: (roomId) => set({ roomId }),
  setFiles: (files) => set({ files }),
  setTextPayload: (textPayload) => set({ textPayload }),
  setIncomingFile: (incomingFile) => set({ incomingFile }),
  setIncomingText: (incomingText) => set({ incomingText }),
  setDownloadedFileUrl: (downloadedFileUrl) => set({ downloadedFileUrl }),
  setReceivedFileChecksum: (receivedFileChecksum) => set({ receivedFileChecksum }),
  setProgress: (progress) => set({ progress }),
  setTransferSpeed: (transferSpeed) => set({ transferSpeed }),
  setError: (error) => set({ error, connectionState: error ? 'error' : 'disconnected' }),
  reset: () => {
    const { downloadedFileUrl } = get();
    if (downloadedFileUrl) {
      URL.revokeObjectURL(downloadedFileUrl);
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
      downloadedFileUrl: null,
      receivedFileChecksum: null,
      progress: 0,
      transferSpeed: '0 B/s',
      error: null,
    });
  },
}));
