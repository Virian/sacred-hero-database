export interface CharacterRow {
  id: string;
  version: number;
  level: number;
  isHardcore: boolean;
  deathCount: number;
  survivalBonus: number;
  playTime: number;
  modifiedAt: Date;
  createdAt: Date;
  characterId: string;
  isLatest: boolean;
}
