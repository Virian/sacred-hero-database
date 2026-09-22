export interface GetSettingsCommandResponse {
  gameInstallationPath: string;
  activeCharacterSlots: number;
  triedDetectingGamePath: boolean;
}

export interface UpdateSettingsCommandParams {
  gameInstallationPath: string;
  activeCharacterSlots: number;
}

type CharacterClass =
  | 'Seraphim'
  | 'Gladiator'
  | 'Battle Mage'
  | 'Dark Elf'
  | 'Wood Elf'
  | 'Vampiress'
  | 'Dwarf'
  | 'Daemon';

interface ApiActiveCharacter {
  name: string;
  class: CharacterClass;
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

export interface ImportCharactersCommandParams {
  filePaths: string[];
}

interface ImportResultSuccess {
  status: 'success';
  file_name: string;
  character_class: CharacterClass;
}

interface ImportResultSkipped {
  status: 'skipped';
  file_name: string;
  character_class: CharacterClass;
}

interface ImportResultError {
  status: 'error';
  file_name: string;
  error: string;
}

type ImportResult =
  ImportResultSuccess | ImportResultSkipped | ImportResultError;

export type ImportCharactersCommandResponse = ImportResult[];
