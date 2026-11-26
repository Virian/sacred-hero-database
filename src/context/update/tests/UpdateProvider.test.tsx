import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UpdateProvider } from '../UpdateProvider';
import { useUpdateService } from '../../../hooks/useUpdateService';

const { checkMock, debugMock, infoMock, relaunchMock } = vi.hoisted(() => ({
  checkMock: vi.fn(),
  debugMock: vi.fn(),
  infoMock: vi.fn(),
  relaunchMock: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-updater', () => ({
  check: checkMock,
}));

vi.mock('@tauri-apps/plugin-process', () => ({
  relaunch: relaunchMock,
}));

vi.mock('@tauri-apps/plugin-log', () => ({
  debug: debugMock,
  info: infoMock,
}));

const wrapper = ({ children }: PropsWithChildren) => (
  <UpdateProvider>{children}</UpdateProvider>
);

describe('UpdateProvider', () => {
  beforeEach(() => {
    checkMock.mockReset();
    debugMock.mockReset();
    infoMock.mockReset();
    relaunchMock.mockReset();
  });

  it('shares downloaded update state and installs only when requested', async () => {
    // given
    const update = {
      version: '1.2.3',
      currentVersion: '1.0.0',
      date: '2026-11-25T00:00:00Z',
      body: 'Release notes',
      download: vi.fn().mockResolvedValue(undefined),
      install: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const logOrder: string[] = [];
    infoMock.mockImplementation(async (message: string) => {
      logOrder.push(message);
    });
    relaunchMock.mockImplementation(async () => {
      logOrder.push('relaunch');
    });
    checkMock.mockResolvedValue(update);

    const { result } = renderHook(() => useUpdateService(), { wrapper });

    // when
    await act(async () => {
      await Promise.all([
        result.current.checkAndDownloadUpdate(),
        result.current.checkAndDownloadUpdate(),
      ]);
    });

    // then
    expect(checkMock).toHaveBeenCalledTimes(1);
    expect(update.download).toHaveBeenCalledTimes(1);
    expect(update.install).not.toHaveBeenCalled();
    expect(result.current.availableUpdate).toEqual({
      version: '1.2.3',
      date: '2026-11-25T00:00:00Z',
      notes: 'Release notes',
    });
    expect(debugMock).toHaveBeenNthCalledWith(1, 'Starting update check.');
    expect(debugMock).toHaveBeenNthCalledWith(
      2,
      'Starting download of update 1.2.3.',
    );
    expect(infoMock).toHaveBeenNthCalledWith(
      1,
      'Update available: version=1.2.3, currentVersion=1.0.0. Starting download.',
    );
    expect(infoMock).toHaveBeenNthCalledWith(
      2,
      'Finished downloading update 1.2.3.',
    );

    // when
    await act(async () => {
      await result.current.installDownloadedUpdate();
    });

    // then
    expect(update.install).toHaveBeenCalledTimes(1);
    expect(result.current.availableUpdate).toBeNull();
    expect(infoMock).toHaveBeenNthCalledWith(
      3,
      'Starting installation of update 1.2.3.',
    );
    expect(infoMock).toHaveBeenNthCalledWith(
      4,
      'Installed update 1.2.3. Relaunching application.',
    );
    expect(logOrder[logOrder.length - 1]).toBe('relaunch');
  });

  it('caches the result when no update is available', async () => {
    // given
    checkMock.mockResolvedValue(null);
    const { result } = renderHook(() => useUpdateService(), { wrapper });

    // when
    await act(async () => {
      await Promise.all([
        result.current.checkAndDownloadUpdate(),
        result.current.checkAndDownloadUpdate(),
      ]);
    });

    // then
    expect(checkMock).toHaveBeenCalledTimes(1);
    expect(result.current.availableUpdate).toBeNull();
  });

  it('exposes downloading state only while the package is downloading', async () => {
    // given
    let finishDownload: () => void = () => {};
    const download = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishDownload = resolve;
        }),
    );
    checkMock.mockResolvedValue({
      version: '1.2.3',
      currentVersion: '1.0.0',
      download,
      install: vi.fn(),
      close: vi.fn(),
    });
    const { result } = renderHook(() => useUpdateService(), { wrapper });
    let checkPromise: Promise<unknown>;

    // when
    await act(async () => {
      checkPromise = result.current.checkAndDownloadUpdate();
    });

    // then
    await waitFor(() => {
      expect(download).toHaveBeenCalledTimes(1);
      expect(result.current.isDownloading).toBe(true);
    });

    // when
    await act(async () => {
      finishDownload();
      await checkPromise!;
    });

    // then
    expect(result.current.isDownloading).toBe(false);
    expect(result.current.availableUpdate?.version).toBe('1.2.3');
  });
});
