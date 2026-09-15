import { useCallback, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

import { CharacterSlots, Commands } from '../constants';
import type { GetSettingsCommand, Settings } from '../types';

import { SettingsContext } from './SettingsContext';

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings>({
    gameInstallationPath: '',
    activeCharacterSlots: CharacterSlots.UNDERWORLD,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );

  const fetchSettings = useCallback(async () => {
    const response = await invoke<GetSettingsCommand>(Commands.GET_SETTINGS);

    const newSettings = {
      gameInstallationPath: response.gameInstallationPath,
      activeCharacterSlots: response.activeCharacterSlots,
    };
    setSettings(newSettings);

    return newSettings;
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        fetchSettings();
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
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        fetchSettings,
        isInitialized,
        initializationError,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
