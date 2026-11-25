import { useCallback, useMemo, useRef, useState } from 'react';
import { relaunch } from '@tauri-apps/plugin-process';
import { debug as logDebug, info as logInfo } from '@tauri-apps/plugin-log';
import {
  check,
  type DownloadEvent,
  type Update,
} from '@tauri-apps/plugin-updater';

import { UpdateContext, type DownloadedUpdate } from './UpdateContext';

interface UpdateProviderProps {
  children: React.ReactNode;
}

interface PendingUpdate {
  update: Update;
  info: DownloadedUpdate;
}

export const UpdateProvider = ({ children }: UpdateProviderProps) => {
  const [availableUpdate, setAvailableUpdate] =
    useState<DownloadedUpdate | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const pendingUpdateRef = useRef<PendingUpdate | null>(null);
  const hasCheckedForUpdateRef = useRef(false);
  const checkAndDownloadPromiseRef =
    useRef<Promise<DownloadedUpdate | null> | null>(null);
  const installPromiseRef = useRef<Promise<void> | null>(null);

  const checkAndDownload = useCallback(
    async (
      onProgress?: (event: DownloadEvent) => void,
    ): Promise<DownloadedUpdate | null> => {
      await logDebug('Starting update check.');
      const update = await check();

      if (!update) {
        hasCheckedForUpdateRef.current = true;
        return null;
      }

      await logInfo(
        `Update available: version=${update.version}, currentVersion=${update.currentVersion}. Starting download.`,
      );
      await logDebug(`Starting download of update ${update.version}.`);

      setIsDownloading(true);
      try {
        await update.download(onProgress);
      } catch (error) {
        try {
          await update.close();
        } catch (closeError) {
          throw new AggregateError(
            [error, closeError],
            'Update download failed and its resources could not be released.',
            { cause: closeError },
          );
        }

        throw new Error('Failed to download the update.', { cause: error });
      } finally {
        setIsDownloading(false);
      }

      await logInfo(`Finished downloading update ${update.version}.`);

      const updateInfo = {
        version: update.version,
        date: update.date,
        notes: update.body,
      };
      pendingUpdateRef.current = { update, info: updateInfo };
      hasCheckedForUpdateRef.current = true;
      setAvailableUpdate(updateInfo);

      return updateInfo;
    },
    [],
  );

  const installAndRelaunch = useCallback(async (): Promise<void> => {
    const pendingUpdate = pendingUpdateRef.current;
    if (!pendingUpdate) {
      throw new Error('There is no downloaded update to install.');
    }

    await logInfo(
      `Starting installation of update ${pendingUpdate.update.version}.`,
    );
    await pendingUpdate.update.install();
    pendingUpdateRef.current = null;
    setAvailableUpdate(null);
    await logInfo(
      `Installed update ${pendingUpdate.update.version}. Relaunching application.`,
    );
    await relaunch();
  }, []);

  const checkAndDownloadUpdate = useCallback(
    async (
      onProgress?: (event: DownloadEvent) => void,
    ): Promise<DownloadedUpdate | null> => {
      // Reuse a completed result so later calls don't check or download again.
      if (hasCheckedForUpdateRef.current) {
        return pendingUpdateRef.current?.info ?? null;
      }

      // Concurrent callers wait for the same check/download operation.
      if (checkAndDownloadPromiseRef.current) {
        return await checkAndDownloadPromiseRef.current;
      }

      const promise = checkAndDownload(onProgress);
      checkAndDownloadPromiseRef.current = promise;

      try {
        return await promise;
      } finally {
        // Clear only this operation, allowing a retry after failure.
        if (checkAndDownloadPromiseRef.current === promise) {
          checkAndDownloadPromiseRef.current = null;
        }
      }
    },
    [checkAndDownload],
  );

  const installDownloadedUpdate = useCallback(async (): Promise<void> => {
    // Prevent concurrent requests from starting multiple installers.
    if (installPromiseRef.current) {
      return await installPromiseRef.current;
    }

    if (!pendingUpdateRef.current) {
      throw new Error('There is no downloaded update to install.');
    }

    const promise = installAndRelaunch();
    installPromiseRef.current = promise;

    try {
      await promise;
    } finally {
      if (installPromiseRef.current === promise) {
        installPromiseRef.current = null;
      }
    }
  }, [installAndRelaunch]);

  const contextValue = useMemo(
    () => ({
      availableUpdate,
      isDownloading,
      checkAndDownloadUpdate,
      installDownloadedUpdate,
    }),
    [
      availableUpdate,
      isDownloading,
      checkAndDownloadUpdate,
      installDownloadedUpdate,
    ],
  );

  return (
    <UpdateContext.Provider value={contextValue}>
      {children}
    </UpdateContext.Provider>
  );
};
