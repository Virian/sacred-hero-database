import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CharacterClass, Commands } from '../../enums';
import type { GetAllCharactersCommandResponse } from '../../types';

import { type MappedCharacter, useAllCharacters } from '../useAllCharacters';

const useInvokeQueryMock = vi.hoisted(() => vi.fn());

vi.mock('../useInvokeQuery', () => ({
  useInvokeQuery: useInvokeQueryMock,
}));

const allCharactersResponse: GetAllCharactersCommandResponse = [
  {
    id: 'character-1',
    name: '\\c12345678First Hero',
    class: 'Seraphim',
    versions_count: 3,
    latest_version: {
      id: 'version-1',
      version_number: 3,
      level: 12,
      hardcore: false,
      deaths: 0,
      survival_bonus: 3,
      play_time_seconds: 3600,
      modified_at: '2024-01-02T03:04:05.000Z',
      created_at: '2024-01-01T00:00:00.000Z',
    },
  },
  {
    id: 'character-2',
    name: '\\c12345678Second Hero',
    class: 'Gladiator',
    versions_count: 1,
    latest_version: null,
  },
];

describe('useAllCharacters', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('maps characters and handles characters without a latest version', () => {
    // given
    useInvokeQueryMock.mockImplementation(
      ({
        mapper,
      }: {
        mapper: (data: GetAllCharactersCommandResponse) => MappedCharacter[];
      }) => ({
        data: mapper(allCharactersResponse),
        isLoading: false,
        refetch: vi.fn(),
      }),
    );

    // when
    const { result } = renderHook(() => useAllCharacters());

    // then
    expect(result.current.data).toEqual([
      {
        id: 'character-1',
        characterClass: CharacterClass.SERAPHIM,
        name: 'First Hero',
        versionCount: 3,
        version: 3,
        versionId: 'version-1',
        level: 12,
        isHardcore: false,
        deathCount: 0,
        survivalBonus: 3,
        playTime: 3600,
        modifiedAt: new Date('2024-01-02T03:04:05.000Z'),
      },
      {
        id: 'character-2',
        characterClass: CharacterClass.GLADIATOR,
        name: 'Second Hero',
        versionCount: 1,
        version: undefined,
        versionId: undefined,
        level: undefined,
        isHardcore: undefined,
        deathCount: undefined,
        survivalBonus: undefined,
        playTime: undefined,
        modifiedAt: undefined,
      },
    ]);
  });

  it('requests all characters and exposes query state', () => {
    // given
    const refetch = vi.fn();
    useInvokeQueryMock.mockReturnValue({
      data: [],
      isLoading: true,
      refetch,
    });

    // when
    const { result } = renderHook(() => useAllCharacters());

    // then
    expect(useInvokeQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ command: Commands.GET_ALL_CHARACTERS }),
    );
    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.refetch).toBe(refetch);
  });
});
