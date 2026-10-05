import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Commands } from '../../enums';

import { useAssignToSlot } from '../useAssignToSlot';

const {
  assignToSlotMock,
  handleBackupMock,
  toastMock,
  useInvokeMutationMock,
  useBackupMock,
} = vi.hoisted(() => ({
  assignToSlotMock: vi.fn(),
  handleBackupMock: vi.fn(),
  toastMock: {
    error: vi.fn(),
    success: vi.fn(),
  },
  useInvokeMutationMock: vi.fn(),
  useBackupMock: vi.fn(),
}));

vi.mock('..', () => ({
  useBackup: useBackupMock,
  useInvokeMutation: useInvokeMutationMock,
}));

vi.mock('react-toastify', () => ({
  toast: toastMock,
}));

const assignment = {
  slotNumber: 2,
  characterVersionId: 'version-1',
};

const renderAssignToSlot = () => {
  useBackupMock.mockReturnValue({ handleBackup: handleBackupMock });
  useInvokeMutationMock.mockReturnValue({ invoke: assignToSlotMock });

  return renderHook(() => useAssignToSlot());
};

describe('useAssignToSlot', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('backs up the selected slot before assigning by default', async () => {
    // given
    handleBackupMock.mockResolvedValue(true);
    assignToSlotMock.mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    const { result } = renderAssignToSlot();

    // when
    await act(async () => {
      await result.current.handleAssignToSlot({ ...assignment, onSuccess });
    });

    // then
    expect(handleBackupMock).toHaveBeenCalledWith(2, false);
    expect(assignToSlotMock).toHaveBeenCalledWith(assignment);
    expect(toastMock.success).toHaveBeenCalledWith(
      'Character assigned to slot 2 successfully.',
    );
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(result.current.isLoading).toBe(false);
  });

  it('assigns without backing up when requested', async () => {
    // given
    assignToSlotMock.mockResolvedValue(undefined);
    const { result } = renderAssignToSlot();

    // when
    await act(async () => {
      await result.current.handleAssignToSlot({
        ...assignment,
        shouldBackup: false,
      });
    });

    // then
    expect(handleBackupMock).not.toHaveBeenCalled();
    expect(assignToSlotMock).toHaveBeenCalledWith(assignment);
    expect(toastMock.success).toHaveBeenCalledOnce();
  });

  it('does not assign when the backup fails', async () => {
    // given
    handleBackupMock.mockResolvedValue(false);
    const onSuccess = vi.fn();
    const { result } = renderAssignToSlot();

    // when
    await act(async () => {
      await result.current.handleAssignToSlot({ ...assignment, onSuccess });
    });

    // then
    expect(assignToSlotMock).not.toHaveBeenCalled();
    expect(toastMock.success).not.toHaveBeenCalled();
    expect(toastMock.error).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('reports assignment errors and resets loading state', async () => {
    // given
    assignToSlotMock.mockRejectedValue(new Error('Save failed.'));
    const onSuccess = vi.fn();
    const { result } = renderAssignToSlot();

    // when
    await act(async () => {
      await result.current.handleAssignToSlot({
        ...assignment,
        shouldBackup: false,
        onSuccess,
      });
    });

    // then
    expect(toastMock.error).toHaveBeenCalledWith(
      'Assigning to slot 2 failed: Save failed.',
    );
    expect(toastMock.success).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('configures the assign command and exposes loading while assigning', async () => {
    // given
    let resolveAssignment!: () => void;
    assignToSlotMock.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveAssignment = resolve;
      }),
    );
    const { result } = renderAssignToSlot();

    // when
    let assignmentPromise!: Promise<void>;
    act(() => {
      assignmentPromise = result.current.handleAssignToSlot({
        ...assignment,
        shouldBackup: false,
      });
    });

    // then
    expect(useInvokeMutationMock).toHaveBeenCalledWith({
      command: Commands.ASSIGN_TO_SLOT,
    });
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveAssignment();
      await assignmentPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });
});
