import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Commands } from '../../enums';
import { useInvokeQuery } from '../useInvokeQuery';

const { tauriInvokeMock } = vi.hoisted(() => ({
  tauriInvokeMock: vi.fn(),
}));

vi.mock('@tauri-apps/api/core', () => ({
  invoke: tauriInvokeMock,
}));

describe('useInvokeQuery', () => {
  afterEach(() => {
    tauriInvokeMock.mockReset();
  });

  it('auto-invokes the command and maps the returned data', async () => {
    // given
    tauriInvokeMock.mockResolvedValue({ value: 21 });
    const { result } = renderHook(() =>
      useInvokeQuery<{ value: number }, { value: number }>({
        command: Commands.GET_SETTINGS,
        mapper: (data) => ({ value: data.value * 2 }),
      }),
    );

    // when
    await waitFor(() => {
      expect(result.current.data).toEqual({ value: 42 });
    });

    // then
    expect(tauriInvokeMock).toHaveBeenCalledWith(
      Commands.GET_SETTINGS,
      undefined,
    );
    expect(result.current.hasFetched).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('does not auto-invoke when shouldAutoInvoke is false', () => {
    // given
    const { result } = renderHook(() =>
      useInvokeQuery<{ value: number }, { value: number }>({
        command: Commands.GET_SETTINGS,
        shouldAutoInvoke: false,
      }),
    );

    // when
    const hasBeenCalled = tauriInvokeMock.mock.calls.length > 0;

    // then
    expect(hasBeenCalled).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.hasFetched).toBe(false);
  });

  it('manual refetch passes args and updates the mapped response', async () => {
    // given
    tauriInvokeMock.mockResolvedValueOnce({ value: 10 });
    const { result } = renderHook(() =>
      useInvokeQuery<{ value: number }, { value: number }, { mode: string }>({
        command: Commands.GET_SETTINGS,
        mapper: (data) => ({ value: data.value + 1 }),
      }),
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({ value: 11 });
    });

    // when
    tauriInvokeMock.mockResolvedValueOnce({ value: 20 });
    await act(async () => {
      await result.current.refetch({ mode: 'dark' });
    });

    // then
    expect(tauriInvokeMock).toHaveBeenLastCalledWith(Commands.GET_SETTINGS, {
      mode: 'dark',
    });
    expect(result.current.data).toEqual({ value: 21 });
  });

  it('tracks isPending and isLoading during the initial and subsequent fetch lifecycles', async () => {
    // given
    let firstResolve: (value: { value: number }) => void;
    let secondResolve: (value: { value: number }) => void;
    let requestCount = 0;

    tauriInvokeMock.mockImplementation(
      () =>
        new Promise<{ value: number }>((resolve) => {
          requestCount += 1;

          if (requestCount === 1) {
            firstResolve = resolve;
          } else {
            secondResolve = resolve;
          }
        }),
    );

    const { result } = renderHook(() =>
      useInvokeQuery<{ value: number }, { value: number }>({
        command: Commands.GET_SETTINGS,
      }),
    );

    // when
    await act(async () => {
      await Promise.resolve();
    });

    // then initial request
    expect(result.current.isPending).toBe(true);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasFetched).toBe(false);

    await act(async () => {
      firstResolve!({ value: 42 });
    });

    await waitFor(() => {
      expect(result.current.hasFetched).toBe(true);
      expect(result.current.data).toEqual({ value: 42 });
      expect(result.current.isPending).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    // given subsequent request
    let refetchPromise: Promise<void>;

    // when
    await act(async () => {
      refetchPromise = result.current.refetch();
      await Promise.resolve();
    });

    // then
    expect(result.current.isPending).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasFetched).toBe(true);

    await act(async () => {
      secondResolve!({ value: 99 });
      await refetchPromise!;
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasFetched).toBe(true);
      expect(result.current.data).toEqual({ value: 99 });
    });
  });

  it('sets error state when the invoke call fails', async () => {
    // given
    const error = new Error('Failed to load settings');
    tauriInvokeMock.mockRejectedValue(error);
    const { result } = renderHook(() =>
      useInvokeQuery<unknown, unknown>({
        command: Commands.GET_SETTINGS,
      }),
    );

    // when
    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });

    // then
    expect(result.current.hasFetched).toBe(true);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
