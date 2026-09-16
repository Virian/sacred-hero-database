import { useMemo } from 'react';

import { CharacterSlots } from '../../constants';
import { Commands } from '../../enums';
import { useInvokeQuery } from '../../hooks';
import type { GetSettingsCommandResponse, Settings } from '../../types';

import { SettingsContext } from './SettingsContext';
import { getInitializationError } from './getInitializationError';

interface SettingsProviderProps {
  children: React.ReactNode;
}

const defaultSettings: Settings = {
  gameInstallationPath: '',
  activeCharacterSlots: CharacterSlots.UNDERWORLD,
};

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const { data, error, hasFetched, refetch } = useInvokeQuery<
    GetSettingsCommandResponse,
    Settings
  >({
    command: Commands.GET_SETTINGS,
    mapper: ({ gameInstallationPath, activeCharacterSlots }) => ({
      gameInstallationPath,
      activeCharacterSlots,
    }),
  });

  const initializationError = getInitializationError(error);

  const settings = useMemo(() => data || defaultSettings, [data]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        fetchSettings: refetch,
        isInitialized: hasFetched,
        initializationError,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
