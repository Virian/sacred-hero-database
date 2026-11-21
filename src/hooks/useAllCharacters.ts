import { isNil } from 'lodash';

import { Commands } from '../enums';
import type { Character, GetAllCharactersCommandResponse } from '../types';
import { stripCharacterFormatting } from '../utils';

import { useInvokeQuery } from './useInvokeQuery';

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
  > & { versionCount: number; versionId?: string };

export const useAllCharacters = () => {
  const { data, isLoading, refetch } = useInvokeQuery<
    GetAllCharactersCommandResponse,
    MappedCharacter[]
  >({
    command: Commands.GET_ALL_CHARACTERS,
    mapper: (data) =>
      data.map((character) => ({
        id: character.id,
        characterClass: character.class,
        name: stripCharacterFormatting(character.name),
        versionCount: character.versions_count,
        version: character.latest_version?.version_number,
        versionId: character.latest_version?.id,
        level: character.latest_version?.level,
        isHardcore: character.latest_version?.hardcore,
        deathCount: character.latest_version?.deaths,
        survivalBonus: character.latest_version?.survival_bonus,
        playTime: character.latest_version?.play_time_seconds,
        modifiedAt: isNil(character.latest_version?.modified_at)
          ? undefined
          : new Date(character.latest_version.modified_at),
      })),
  });

  return { data, isLoading, refetch };
};
