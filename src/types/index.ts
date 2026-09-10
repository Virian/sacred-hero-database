import type { CharacterClass } from '../enums';

export interface Character {
  id: string;
  name: string;
  characterClass: CharacterClass;
  level: number;
  isHardcore: boolean;
  deathCount: number;
  survivalBonus: number;
  playTime: number; // in seconds
  modifiedAt: Date;
  version: number;
}
