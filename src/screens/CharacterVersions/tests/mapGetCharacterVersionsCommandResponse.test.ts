import { describe, expect, it } from 'vitest';

import type { GetCharacterVersionsCommandResponse } from '../../../types';
import { mapGetCharacterVersionsCommandResponse } from '../mapGetCharacterVersionsCommandResponse';

describe('mapGetCharacterVersionsCommandResponse', () => {
  it('maps version fields and preserves response order without mutating the input', () => {
    // given
    const response: GetCharacterVersionsCommandResponse = [
      {
        id: 'latest-version',
        version_number: 2,
        is_latest: true,
        level: 20,
        hardcore: true,
        deaths: 1,
        survival_bonus: 200,
        play_time_seconds: 3600,
        modified_at: '2026-09-02T12:00:00Z',
        created_at: '2026-09-02T12:00:00Z',
        character_id: 'character-id',
      },
      {
        id: 'older-version',
        version_number: 1,
        is_latest: false,
        level: 10,
        hardcore: false,
        deaths: 0,
        survival_bonus: 100,
        play_time_seconds: 1800,
        modified_at: '2026-09-01T12:00:00Z',
        created_at: '2026-09-01T12:00:00Z',
        character_id: 'character-id',
      },
    ];

    const originalIds = response.map(({ id }) => id);

    // when
    const result = mapGetCharacterVersionsCommandResponse(response);

    // then
    expect(result).toEqual([
      {
        id: 'latest-version',
        version: 2,
        isLatest: true,
        level: 20,
        isHardcore: true,
        deathCount: 1,
        survivalBonus: 200,
        playTime: 3600,
        modifiedAt: new Date('2026-09-02T12:00:00Z'),
        createdAt: new Date('2026-09-02T12:00:00Z'),
        characterId: 'character-id',
      },
      {
        id: 'older-version',
        version: 1,
        isLatest: false,
        level: 10,
        isHardcore: false,
        deathCount: 0,
        survivalBonus: 100,
        playTime: 1800,
        modifiedAt: new Date('2026-09-01T12:00:00Z'),
        createdAt: new Date('2026-09-01T12:00:00Z'),
        characterId: 'character-id',
      },
    ]);
    expect(response.map(({ id }) => id)).toEqual(originalIds);
  });

  it('returns an empty array for an empty response', () => {
    // given
    const response: GetCharacterVersionsCommandResponse = [];

    // when
    const result = mapGetCharacterVersionsCommandResponse(response);

    // then
    expect(result).toEqual([]);
  });
});
