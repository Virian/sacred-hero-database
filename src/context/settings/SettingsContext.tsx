import { createContext } from 'react';

import { CharacterSlots } from '../../constants';
import type { Settings } from '../../types';

interface SettingsContextProps {
  settings: Settings;
  fetchSettings: () => Promise<void>;
  isInitialized: boolean;
  initializationError: string | null;
}

export const SettingsContext = createContext<SettingsContextProps>({
  settings: {
    gameInstallationPath: '',
    activeCharacterSlots: CharacterSlots.UNDERWORLD,
  },
  fetchSettings: async () => {},
  isInitialized: false,
  initializationError: null,
});
