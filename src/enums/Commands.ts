export const Commands = {
  GET_SETTINGS: 'get_settings',
  UPDATE_SETTINGS: 'update_settings',
  GET_ACTIVE_CHARACTERS: 'get_active_characters',
} as const;

export type Commands = (typeof Commands)[keyof typeof Commands];
