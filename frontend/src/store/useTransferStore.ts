import { create } from 'zustand';

export type ConnectionState = 'disconnected' | 'waiting' | 'connecting' | 'connected' | 'transferring' | 'completed' | 'error';
export type AppMode = 'idle' | 'send' | 'receive';
export type Role = 'sender' | 'receiver' | null;

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
}

interface TransferState {
  mode: AppMode;
  role: Role;
  connectionState: ConnectionState;
  roomId: string | null;
  files: File[];
  incomingFile: FileMetadata | null;
  progress: number;
  transferSpeed: string;
  error: string | null;

  setMode: (mode: AppMode) => void;
  setRole: (role: Role) => void;
  setConnectionState: (state: ConnectionState) => void;
  setRoomId: (id: string | null) => void;
  setFiles: (files: File[]) => void;
  setIncomingFile: (file: FileMetadata | null) => void;
  setProgress: (progress: number) => void;
  setTransferSpeed: (speed: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useTransferStore = create<TransferState>((set) => ({
  mode: 'idle',
  role: null,
  connectionState: 'disconnected',
  roomId: null,
  files: [],
  incomingFile: null,
  progress: 0,
  transferSpeed: '0 B/s',
  error: null,

  setMode: (mode) => set({ mode }),
  setRole: (role) => set({ role }),
  setConnectionState: (connectionState) => set({ connectionState }),
  setRoomId: (roomId) => set({ roomId }),
  setFiles: (files) => set({ files }),
  setIncomingFile: (incomingFile) => set({ incomingFile }),
  setProgress: (progress) => set({ progress }),
  setTransferSpeed: (transferSpeed) => set({ transferSpeed }),
  setError: (error) => set({ error, connectionState: error ? 'error' : 'disconnected' }),
  reset: () => set({
    mode: 'idle',
    role: null,
    connectionState: 'disconnected',
    roomId: null,
    files: [],
    incomingFile: null,
    progress: 0,
    transferSpeed: '0 B/s',
    error: null,
  }),
}));
