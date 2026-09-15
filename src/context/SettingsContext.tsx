import { createContext, type Dispatch, type SetStateAction } from 'react';

import type { Settings } from '../types';

interface SettingsContextProps {
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
  isInitialized: boolean;
  initializationError: string | null;
}

export const SettingsContext = createContext<SettingsContextProps>({
  settings: { gameInstallationPath: '', activeCharacterSlots: '' },
  setSettings: () => {},
  isInitialized: false,
  initializationError: null,
});
