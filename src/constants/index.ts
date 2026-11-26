export * from './routes';

export const isDevMode = import.meta.env.DEV;

export const CharacterSlots = {
  UNDERWORLD: 8,
  PLUS: 6,
} as const;
