import { createContext } from 'react';
import type { DownloadEvent } from '@tauri-apps/plugin-updater';

export interface DownloadedUpdate {
  version: string;
  date?: string;
  notes?: string;
}

interface UpdateContextValue {
  availableUpdate: DownloadedUpdate | null;
  isDownloading: boolean;
  checkAndDownloadUpdate: (
    onProgress?: (event: DownloadEvent) => void,
  ) => Promise<DownloadedUpdate | null>;
  installDownloadedUpdate: () => Promise<void>;
}

export const UpdateContext = createContext<UpdateContextValue | null>(null);
