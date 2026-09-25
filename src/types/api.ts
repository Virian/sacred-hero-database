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

interface ApiCharacterVersion {
  id: string;
  version_number: number;
  level: number;
  hardcore: boolean;
  deaths: number;
  survival_bonus: number;
  play_time_seconds: number;
  modified_at: string;
  created_at: string;
}

export type GetAllCharactersCommandResponse = {
  id: string;
  name: string;
  class: CharacterClass;
  versions_count: number;
  latest_version: ApiCharacterVersion | null;
}[];

export type GetAllCharactersCountCommandResponse = number;

export type GetCharacterByIdCommandParams = {
  characterId: string;
};

export type GetCharacterByIdCommandResponse = {
  id: string;
  name: string;
  class: CharacterClass;
} | null;

export type GetCharacterVersionsCommandParams = {
  characterId: string;
};

export type GetCharacterVersionsCommandResponse = {
  id: string;
  version_number: number;
  is_latest: boolean;
  level: number;
  hardcore: boolean;
  deaths: number;
  survival_bonus: number;
  play_time_seconds: number;
  modified_at: string;
  created_at: string;
}[];

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

export type ImportResult =
  ImportResultSuccess | ImportResultSkipped | ImportResultError;

export type ImportCharactersCommandResponse = ImportResult[];

export interface BackupCommandParams {
  slotNumber: number;
}

export type BackupCommandResponse = ImportResult;
