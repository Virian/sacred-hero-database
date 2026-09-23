import type { ImportCharactersCommandResponse } from '../../types';

export const mapImportCommandResponse = (
  data: ImportCharactersCommandResponse,
) =>
  data.map((result) => {
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
  });

export type ImportResults = ReturnType<typeof mapImportCommandResponse>;
