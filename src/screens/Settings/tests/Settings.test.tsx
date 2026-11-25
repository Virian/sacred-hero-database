import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsContext } from '../../../context/settings/SettingsContext';
import { CharacterSlots } from '../../../constants';
import { Settings } from '../Settings';

const {
  installDownloadedUpdateMock,
  logErrorMock,
  toastErrorMock,
  updateServiceMock,
} = vi.hoisted(() => ({
  installDownloadedUpdateMock: vi.fn(),
  logErrorMock: vi.fn(),
  toastErrorMock: vi.fn(),
  updateServiceMock: vi.fn(),
}));

vi.mock('../../../hooks', () => ({
  useAppVersion: () => '1.2.3',
  useInvokeMutation: () => ({ invoke: vi.fn(), isLoading: false }),
  useUpdateService: updateServiceMock,
}));

vi.mock('react-toastify', () => ({
  toast: {
    error: toastErrorMock,
    success: vi.fn(),
  },
}));

vi.mock('@tauri-apps/plugin-log', () => ({
  error: logErrorMock,
}));

const renderSettings = () => {
  render(
    <SettingsContext.Provider
      value={{
        settings: {
          gameInstallationPath: 'C:\\Game',
          activeCharacterSlots: CharacterSlots.UNDERWORLD,
        },
        fetchSettings: vi.fn(),
        isInitialized: true,
        initializationError: null,
      }}
    >
      <Settings />
    </SettingsContext.Provider>,
  );
};

describe('Settings', () => {
  afterEach(cleanup);

  beforeEach(() => {
    installDownloadedUpdateMock.mockReset();
    installDownloadedUpdateMock.mockResolvedValue(undefined);
    logErrorMock.mockReset();
    toastErrorMock.mockReset();
    updateServiceMock.mockReturnValue({
      availableUpdate: { version: '2.0.0' },
      installDownloadedUpdate: installDownloadedUpdateMock,
    });
  });

  it('shows an install button when an update is available', async () => {
    // given
    renderSettings();

    // when
    fireEvent.click(
      screen.getByRole('button', { name: 'Install and restart' }),
    );

    // then
    expect(screen.getByText('Version 2.0.0 is ready to install.')).toBeTruthy();
    await waitFor(() => {
      expect(installDownloadedUpdateMock).toHaveBeenCalledTimes(1);
    });
  });

  it('does not show the update section when no update is available', () => {
    // given
    updateServiceMock.mockReturnValue({
      availableUpdate: null,
      installDownloadedUpdate: installDownloadedUpdateMock,
    });

    // when
    renderSettings();

    // then
    expect(screen.queryByText('Application update')).toBeNull();
  });

  it('shows an error when installing the update fails', async () => {
    // given
    installDownloadedUpdateMock.mockRejectedValue(
      new Error('Installer failed'),
    );
    renderSettings();

    // when
    fireEvent.click(
      screen.getByRole('button', { name: 'Install and restart' }),
    );

    // then
    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(
        'Failed to install update: Installer failed',
      );
    });
    expect(logErrorMock).toHaveBeenCalledWith(
      'Failed to install update: Installer failed',
    );
  });
});
