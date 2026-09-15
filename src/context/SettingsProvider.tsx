import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

import type { GetSettingsCommand, Settings } from '../types';

import { SettingsContext } from './SettingsContext';

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings>({
    gameInstallationPath: '',
    activeCharacterSlots: '8',
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const init = async () => {
      try {
        const response = await invoke<GetSettingsCommand>('get_settings');
        setSettings({
          gameInstallationPath: response.gameInstallationPath,
          activeCharacterSlots: `${response.activeCharacterSlots}`,
        });
      } catch (error) {
        if (error instanceof Error) {
          setInitializationError(error.message);
        } else if (typeof error === 'string') {
          setInitializationError(error);
        } else {
          setInitializationError('An error occurred.');
        }
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, setSettings, isInitialized, initializationError }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
