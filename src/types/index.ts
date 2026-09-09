import type { CharacterClass } from '../enums';

export interface Character {
  id: string | number; // TODO: decide on one once we know it
  name: string;
  class: CharacterClass;
  level: number;
  isHardcore: boolean;
  deathCount: number;
  survivalBonus: number;
  playTime: number; // in seconds
  modifiedAt: Date;
  version: number;
}
