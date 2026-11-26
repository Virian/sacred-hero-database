import { useContext, useEffect } from 'react';
import { error as logError } from '@tauri-apps/plugin-log';
import { toast } from 'react-toastify';

import { isDevMode } from '../../constants';
import { SettingsContext } from '../../context';
import { useUpdateService } from '../../hooks';
import { getErrorMessage } from '../../utils';

export const AppInitializer = () => {
  const { isInitialized } = useContext(SettingsContext);
  const { checkAndDownloadUpdate } = useUpdateService();

  useEffect(() => {
    if (!isInitialized || isDevMode) {
      return;
    }

    let isMounted = true;

    const initialize = async () => {
      try {
        const update = await checkAndDownloadUpdate();

        if (isMounted && update) {
          toast.info(
            `Update ${update.version} is downloaded and ready to install.`,
          );
        }
      } catch (error) {
        const message = getErrorMessage(error);
        console.error(error);
        logError(`Failed to check for or download an update: ${message}`);

        if (isMounted) {
          toast.error(`Failed to check for or download an update: ${message}`);
        }
      }
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, [checkAndDownloadUpdate, isInitialized]);

  return null;
};
