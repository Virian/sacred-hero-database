import { act } from 'react';
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Commands } from '../../enums';
import { useInvokeMutation } from '../useInvokeMutation';

const { tauriInvokeMock } = vi.hoisted(() => ({
  tauriInvokeMock: vi.fn(),
}));

vi.mock('@tauri-apps/api/core', () => ({
  invoke: tauriInvokeMock,
}));

describe('useInvokeMutation', () => {
  afterEach(() => {
    tauriInvokeMock.mockReset();
  });

  it('calls the Tauri command with args and returns mapped data', async () => {
    // given
    tauriInvokeMock.mockResolvedValue(21);
    const { result } = renderHook(() =>
      useInvokeMutation<{ someKey: string }, number, number>({
        command: Commands.GET_SETTINGS,
        mapper: (data: number) => data * 2,
      }),
    );

    // when
    const response = await act(async () =>
      result.current.invoke({ someKey: 'someValue' }),
    );

    // then
    expect(tauriInvokeMock).toHaveBeenCalledWith(Commands.GET_SETTINGS, {
      someKey: 'someValue',
    });
    expect(response).toBe(42);
    expect(result.current.isLoading).toBe(false);
  });

  it('sets the loading state while the command is pending and resets it after completion', async () => {
    // given
    let resolveInvoke: (value: number) => void;
    tauriInvokeMock.mockImplementation(
      () =>
        new Promise<number>((resolve) => {
          resolveInvoke = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useInvokeMutation<{ theme: string }, number, number>({
        command: Commands.UPDATE_SETTINGS,
      }),
    );

    let pendingRequest: Promise<number>;

    // when
    await act(async () => {
      pendingRequest = result.current.invoke({ theme: 'dark' });
    });

    // then
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveInvoke(42);
      await pendingRequest;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('rethrows errors from the invoke call', async () => {
    // given
    const error = new Error('Failed to update settings');
    tauriInvokeMock.mockRejectedValue(error);
    const { result } = renderHook(() =>
      useInvokeMutation<{ theme: string }, number, number>({
        command: Commands.UPDATE_SETTINGS,
      }),
    );

    // when
    await act(async () => {
      await expect(result.current.invoke({ theme: 'dark' })).rejects.toThrow(
        'Failed to update settings',
      );
    });
  });
});
