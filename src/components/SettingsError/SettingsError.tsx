import { relaunch } from '@tauri-apps/plugin-process';
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

import { Button } from '../Button/Button';
import { ErrorState } from '../ErrorState/ErrorState';

import styles from './SettingsError.module.scss';

interface SettingsErrorProps {
  errorMessage: string;
}

export const SettingsError = ({ errorMessage }: SettingsErrorProps) => {
  const [restartError, setRestartError] = useState<string | null>(null);

  const handleRestart = async () => {
    try {
      await relaunch();
    } catch (error) {
      setRestartError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <ErrorState
      title="Unable to load settings"
      message={
        <>
          The application could not load its settings file. The file may be
          invalid or corrupted. See the error details below for more
          information.
        </>
      }
      errorMessage={restartError || errorMessage}
    >
      <Button
        contentClassName={styles.buttonText}
        onClick={handleRestart}
      >
        <RefreshCw size={16} />
        Restart application
      </Button>
    </ErrorState>
  );
};
