import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CharacterClass, Commands } from '../../../enums';
import type { ImportResult } from '../../../utils';

import type { ActiveCharacter } from '../Characters.types';
import { useBackup } from '../useBackup';

const { backupMock, useInvokeMutationMock, toastMock } = vi.hoisted(() => ({
  backupMock: vi.fn(),
  useInvokeMutationMock: vi.fn(),
  toastMock: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../../hooks', () => ({
  useInvokeMutation: useInvokeMutationMock,
}));

vi.mock('react-toastify', () => ({
  toast: toastMock,
}));

const character: ActiveCharacter = {
  id: '1',
  name: 'Hero',
  characterClass: CharacterClass.SERAPHIM,
  level: 10,
  isHardcore: false,
  deathCount: 0,
  survivalBonus: 2,
  playTime: 600,
  modifiedAt: new Date('2026-01-01'),
};

const renderBackup = (isLoading = false) => {
  useInvokeMutationMock.mockReturnValue({
    invoke: backupMock,
    isLoading,
  });

  return renderHook(() => useBackup());
};

describe('useBackup', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing when no slot number is provided', async () => {
    // given
    const { result } = renderBackup();

    // when
    await act(async () => {
      await result.current.handleBackup(character);
    });

    // then
    expect(backupMock).not.toHaveBeenCalled();
    expect(toastMock.success).not.toHaveBeenCalled();
    expect(toastMock.info).not.toHaveBeenCalled();
    expect(toastMock.error).not.toHaveBeenCalled();
    expect(result.current.backedUpCardNumber).toBeUndefined();
  });

  it('backs up the selected slot and reports success', async () => {
    // given
    const successfulBackup: ImportResult = {
      status: 'success',
      fileName: 'Hero00.pax',
      characterClass: CharacterClass.SERAPHIM,
    };
    backupMock.mockResolvedValue(successfulBackup);
    const { result } = renderBackup();

    // when
    await act(async () => {
      await result.current.handleBackup(character, 1);
    });

    // then
    expect(backupMock).toHaveBeenCalledWith({ slotNumber: 1 });
    expect(toastMock.success).toHaveBeenCalledWith(
      'Character backed up successfully.',
    );
    expect(result.current.backedUpCardNumber).toBeUndefined();
  });

  it('reports skipped and backend error results', async () => {
    // given
    const { result } = renderBackup();

    // when
    backupMock.mockResolvedValueOnce({
      status: 'skipped',
      fileName: 'Hero00.pax',
      characterClass: CharacterClass.SERAPHIM,
    } satisfies ImportResult);
    await act(async () => {
      await result.current.handleBackup(character, 1);
    });

    backupMock.mockResolvedValueOnce({
      status: 'error',
      fileName: 'Hero00.pax',
      message: 'Character could not be imported.',
    } satisfies ImportResult);
    await act(async () => {
      await result.current.handleBackup(character, 1);
    });

    // then
    expect(toastMock.info).toHaveBeenCalledWith(
      'Character is already backed up.',
    );
    expect(toastMock.error).toHaveBeenCalledWith(
      'Character backup failed: Character could not be imported.',
    );
  });

  it('reports thrown errors and clears the backed up card number after failure', async () => {
    // given
    backupMock.mockRejectedValue(new Error('Database unavailable.'));
    const { result } = renderBackup();

    // when
    await act(async () => {
      await result.current.handleBackup(character, 2);
    });

    // then
    expect(toastMock.error).toHaveBeenCalledWith(
      'Character backup failed: Database unavailable.',
    );
    expect(result.current.backedUpCardNumber).toBeUndefined();
  });

  it('exposes loading state and configures the backup command', () => {
    // given
    const { result } = renderBackup(true);

    // then
    expect(useInvokeMutationMock).toHaveBeenCalledWith(
      expect.objectContaining({ command: Commands.BACKUP }),
    );
    expect(result.current.isLoading).toBe(true);
  });
});
