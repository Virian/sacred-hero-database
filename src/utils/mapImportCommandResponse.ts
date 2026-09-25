import type {
  ImportCharactersCommandResponse,
  ImportResult as ApiImportResult,
} from '../types';

export const mapResultImportCommandResponse = (result: ApiImportResult) => {
  if (result.status === 'success') {
    return {
      status: result.status,
      fileName: result.file_name,
      characterClass: result.character_class,
    };
  }

  if (result.status === 'skipped') {
    return {
      status: result.status,
      fileName: result.file_name,
      characterClass: result.character_class,
    };
  }

  return {
    status: result.status,
    fileName: result.file_name,
    message: result.error,
  };
};

export const mapImportCommandResponse = (
  data: ImportCharactersCommandResponse,
) => data.map(mapResultImportCommandResponse);

export type ImportResult = ReturnType<typeof mapResultImportCommandResponse>;
