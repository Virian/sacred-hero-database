export const MenuOptions = {
  CHARACTERS: 'Characters',
  ALL_CHARACTERS: 'All Characters',
  IMPORT: 'Import',
  SETTINGS: 'Settings',
} as const;

export type MenuOptions = (typeof MenuOptions)[keyof typeof MenuOptions];
