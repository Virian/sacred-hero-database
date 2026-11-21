import type { CharacterClass } from '../../enums';

export interface CharacterRow {
  id: string;
  name: string;
  characterClass: CharacterClass;
  level?: number;
  versionCount: number;
}
