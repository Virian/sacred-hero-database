import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsContext } from '../../../context';
import { AppInitializer } from '../AppInitializer';

const {
  checkAndDownloadUpdateMock,
  isDevModeMock,
  logErrorMock,
  toastErrorMock,
  toastInfoMock,
} = vi.hoisted(() => ({
  checkAndDownloadUpdateMock: vi.fn(),
  isDevModeMock: vi.fn(),
  logErrorMock: vi.fn(),
  toastErrorMock: vi.fn(),
  toastInfoMock: vi.fn(),
}));

vi.mock('../../../constants', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../constants')>()),
  get isDevMode() {
    return isDevModeMock();
  },
}));

vi.mock('@tauri-apps/plugin-log', () => ({
  error: logErrorMock,
}));

vi.mock('react-toastify', () => ({
  toast: {
    error: toastErrorMock,
    info: toastInfoMock,
  },
}));

vi.mock('../../../hooks', () => ({
  useUpdateService: () => ({
    checkAndDownloadUpdate: checkAndDownloadUpdateMock,
  }),
}));

describe('AppInitializer', () => {
  beforeEach(() => {
    checkAndDownloadUpdateMock.mockReset();
    isDevModeMock.mockReturnValue(false);
    logErrorMock.mockReset();
    toastErrorMock.mockReset();
    toastInfoMock.mockReset();
  });

  it('skips update checks in development mode', () => {
    // given
    isDevModeMock.mockReturnValue(true);

    // when
    render(
      <SettingsContext.Provider
        value={{
          settings: {
            gameInstallationPath: '',
            activeCharacterSlots: 0,
          },
          fetchSettings: vi.fn(),
          isInitialized: true,
          initializationError: null,
        }}
      >
        <AppInitializer />
      </SettingsContext.Provider>,
    );

    // then
    expect(checkAndDownloadUpdateMock).not.toHaveBeenCalled();
  });

  it('waits for settings initialization before checking for updates', async () => {
    // given
    checkAndDownloadUpdateMock.mockResolvedValue(null);

    // when
    const { rerender } = render(
      <SettingsContext.Provider
        value={{
          settings: {
            gameInstallationPath: '',
            activeCharacterSlots: 0,
          },
          fetchSettings: vi.fn(),
          isInitialized: false,
          initializationError: null,
        }}
      >
        <AppInitializer />
      </SettingsContext.Provider>,
    );

    // then
    expect(checkAndDownloadUpdateMock).not.toHaveBeenCalled();

    // when
    rerender(
      <SettingsContext.Provider
        value={{
          settings: {
            gameInstallationPath: '',
            activeCharacterSlots: 0,
          },
          fetchSettings: vi.fn(),
          isInitialized: true,
          initializationError: null,
        }}
      >
        <AppInitializer />
      </SettingsContext.Provider>,
    );

    // then
    await waitFor(() => {
      expect(checkAndDownloadUpdateMock).toHaveBeenCalledTimes(1);
    });
  });

  it('notifies the user after an update has downloaded', async () => {
    // given
    checkAndDownloadUpdateMock.mockResolvedValue({ version: '1.2.3' });

    // when
    render(
      <SettingsContext.Provider
        value={{
          settings: {
            gameInstallationPath: '',
            activeCharacterSlots: 0,
          },
          fetchSettings: vi.fn(),
          isInitialized: true,
          initializationError: null,
        }}
      >
        <AppInitializer />
      </SettingsContext.Provider>,
    );

    // then
    await waitFor(() => {
      expect(toastInfoMock).toHaveBeenCalledWith(
        'Update 1.2.3 is downloaded and ready to install.',
      );
    });
  });
});
