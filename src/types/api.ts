export interface GetSettingsCommandResponse {
  gameInstallationPath: string;
  activeCharacterSlots: number;
  triedDetectingGamePath: boolean;
}

export interface UpdateSettingsCommandParams {
  gameInstallationPath: string;
  activeCharacterSlots: number;
}

interface ApiActiveCharacter {
  name: string;
  class:
    | 'Seraphim'
    | 'Gladiator'
    | 'Battle Mage'
    | 'Dark Elf'
    | 'Wood Elf'
    | 'Vampiress'
    | 'Dwarf'
    | 'Daemon';
  level: number;
  hardcore: boolean;
  revivals: number;
  survival_bonus: number;
  play_time: { secs: number; nanos: number };
  modified: { secs_since_epoch: number; nanos_since_epoch: number };
}

interface ApiActiveCharacterWithSlot {
  slot: number;
  character: ApiActiveCharacter | null;
}

export type GetActiveCharactersCommandResponse = ApiActiveCharacterWithSlot[];
