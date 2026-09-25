import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SettingsContext } from '../../../context';
import { CharacterClass, Commands } from '../../../enums';
import type { GetActiveCharactersCommandResponse } from '../../../types';

import type { ActiveCharacter } from '../Characters.types';
import { useActiveCharacters } from '../useActiveCharacters';

const useInvokeQueryMock = vi.hoisted(() => vi.fn());

vi.mock('../../../hooks', () => ({
  useInvokeQuery: useInvokeQueryMock,
}));

const activeCharactersResponse: GetActiveCharactersCommandResponse = [
  {
    slot: 2,
    character: {
      name: '\\c12345678Second Hero',
      class: 'Gladiator',
      level: 18,
      hardcore: true,
      revivals: 2,
      survival_bonus: 7,
      play_time: { secs: 7200, nanos: 0 },
      modified: { secs_since_epoch: 1_700_000_000, nanos_since_epoch: 0 },
    },
  },
  {
    slot: 1,
    character: {
      name: '\\c12345678First Hero',
      class: 'Seraphim',
      level: 12,
      hardcore: false,
      revivals: 0,
      survival_bonus: 3,
      play_time: { secs: 3600, nanos: 0 },
      modified: { secs_since_epoch: 1_600_000_000, nanos_since_epoch: 0 },
    },
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <SettingsContext.Provider
    value={{
      settings: {
        gameInstallationPath: 'C:\\Sacred',
        activeCharacterSlots: 3,
      },
      fetchSettings: vi.fn(),
      isInitialized: true,
      initializationError: null,
    }}
  >
    {children}
  </SettingsContext.Provider>
);

describe('useActiveCharacters', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('maps characters and returns them in slot order with empty slots padded', () => {
    // given
    const refetch = vi.fn();
    useInvokeQueryMock.mockImplementation(
      ({
        mapper,
      }: {
        mapper: (
          data: GetActiveCharactersCommandResponse,
        ) => Array<ActiveCharacter | null>;
      }) => ({
        data: mapper(activeCharactersResponse),
        isLoading: false,
        isFetching: false,
        refetch,
      }),
    );

    // when
    const { result } = renderHook(() => useActiveCharacters(), { wrapper });

    // then
    expect(result.current.activeCharacters).toEqual([
      {
        id: '1',
        name: 'First Hero',
        characterClass: CharacterClass.SERAPHIM,
        level: 12,
        isHardcore: false,
        deathCount: 0,
        survivalBonus: 3,
        playTime: 3600,
        modifiedAt: new Date(1_600_000_000 * 1000),
      },
      {
        id: '2',
        name: 'Second Hero',
        characterClass: CharacterClass.GLADIATOR,
        level: 18,
        isHardcore: true,
        deathCount: 2,
        survivalBonus: 7,
        playTime: 7200,
        modifiedAt: new Date(1_700_000_000 * 1000),
      },
      null,
    ]);
  });

  it('requests active characters and exposes query state', () => {
    // given
    const refetch = vi.fn();
    useInvokeQueryMock.mockReturnValue({
      data: [],
      isLoading: true,
      isFetching: true,
      refetch,
    });

    // when
    const { result } = renderHook(() => useActiveCharacters(), { wrapper });

    // then
    expect(useInvokeQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ command: Commands.GET_ACTIVE_CHARACTERS }),
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isFetching).toBe(true);
    expect(result.current.refetch).toBe(refetch);
    expect(result.current.activeCharacters).toEqual([null, null, null]);
  });
});
