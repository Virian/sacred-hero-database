import { createContext, type Dispatch, type SetStateAction } from 'react';

import { CharacterSlots } from '../constants';
import type { Settings } from '../types';

interface SettingsContextProps {
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
  fetchSettings: () => Promise<Settings>;
  isInitialized: boolean;
  initializationError: string | null;
}

export const SettingsContext = createContext<SettingsContextProps>({
  settings: {
    gameInstallationPath: '',
    activeCharacterSlots: CharacterSlots.UNDERWORLD,
  },
  setSettings: () => {},
  fetchSettings: async () => ({
    gameInstallationPath: '',
    activeCharacterSlots: CharacterSlots.UNDERWORLD,
  }),
  isInitialized: false,
  initializationError: null,
});
