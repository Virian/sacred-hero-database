import type { GetCharacterVersionsCommandResponse } from '../../types';
import type { CharacterRow } from './CharacterVersions.types';

export const mapGetCharacterVersionsCommandResponse = (
  response: GetCharacterVersionsCommandResponse,
): CharacterRow[] =>
  [...response]
    // Double reversing because data comes from backend with the first
    // element being the latest version. We want to have the lowest version
    // number to be the oldest version.
    .reverse()
    .map(
      (
        {
          id,
          is_latest,
          level,
          hardcore,
          deaths,
          survival_bonus,
          play_time_seconds,
          modified_at,
          created_at,
          character_id,
        },
        index,
      ) => ({
        id,
        version: index + 1,
        isLatest: is_latest,
        level,
        isHardcore: hardcore,
        deathCount: deaths,
        survivalBonus: survival_bonus,
        playTime: play_time_seconds,
        modifiedAt: new Date(modified_at),
        createdAt: new Date(created_at),
        characterId: character_id,
      }),
    )
    .reverse();
