import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useAppVersion } from '../useAppVersion';

const { getVersionMock } = vi.hoisted(() => ({
  getVersionMock: vi.fn(),
}));

vi.mock('@tauri-apps/api/app', () => ({
  getVersion: getVersionMock,
}));

describe('useAppVersion', () => {
  afterEach(() => {
    getVersionMock.mockReset();
  });

  it('requests the app version on mount and returns it once loaded', async () => {
    // given
    getVersionMock.mockResolvedValue('1.2.3');

    // when
    const { result } = renderHook(() => useAppVersion());

    // then
    expect(result.current).toBe('');

    await waitFor(() => {
      expect(result.current).toBe('1.2.3');
    });
    expect(getVersionMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the initial empty state until the Tauri version resolves', async () => {
    // given
    let resolveVersion: (value: string) => void;
    getVersionMock.mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveVersion = resolve;
        }),
    );

    // when
    const { result } = renderHook(() => useAppVersion());

    // then
    expect(result.current).toBe('');
    expect(getVersionMock).toHaveBeenCalledTimes(1);

    await Promise.resolve();
    expect(result.current).toBe('');

    resolveVersion!('9.9.9');

    await waitFor(() => {
      expect(result.current).toBe('9.9.9');
    });
  });
});
