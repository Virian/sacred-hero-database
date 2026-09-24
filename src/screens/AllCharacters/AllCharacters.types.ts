import type { CharacterClass } from '../../enums';
import type { Character } from '../../types';

export interface CharacterRow {
  id: string;
  name: string;
  characterClass: CharacterClass;
  level?: number;
  versionCount: number;
}

export type MappedCharacter = Omit<
  Character,
  | 'version'
  | 'level'
  | 'isHardcore'
  | 'deathCount'
  | 'survivalBonus'
  | 'playTime'
  | 'modifiedAt'
> &
  Partial<
    Pick<
      Character,
      | 'version'
      | 'level'
      | 'isHardcore'
      | 'deathCount'
      | 'survivalBonus'
      | 'playTime'
      | 'modifiedAt'
    >
  > & { versionCount: number };
