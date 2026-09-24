export const Commands = {
  GET_SETTINGS: 'get_settings',
  UPDATE_SETTINGS: 'update_settings',
  GET_ACTIVE_CHARACTERS: 'get_active_characters',
  GET_ALL_CHARACTERS: 'get_all_characters',
  IMPORT_CHARACTERS: 'import_characters',
} as const;

export type Commands = (typeof Commands)[keyof typeof Commands];
