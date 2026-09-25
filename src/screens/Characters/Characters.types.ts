import type { CharacterClass } from '../../enums';

export interface ActiveCharacter {
  id: string;
  name: string;
  characterClass: CharacterClass;
  level: number;
  isHardcore: boolean;
  deathCount: number;
  survivalBonus: number;
  playTime: number;
  modifiedAt: Date;
}
