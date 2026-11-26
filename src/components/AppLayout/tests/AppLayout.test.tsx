import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CharactersCountContext, SettingsContext } from '../../../context';
import { CharacterSlots } from '../../../constants';
import { AppLayout } from '../AppLayout';

const { updateServiceMock } = vi.hoisted(() => ({
  updateServiceMock: vi.fn(),
}));

vi.mock('../../../hooks', () => ({
  useAppVersion: () => '1.2.3',
  useUpdateService: updateServiceMock,
}));

describe('AppLayout', () => {
  afterEach(cleanup);

  beforeEach(() => {
    updateServiceMock.mockReturnValue({
      availableUpdate: { version: '2.0.0' },
      isDownloading: false,
    });
  });

  it('shows a settings link for a downloaded update beside the app version', () => {
    // given
    render(
      <MemoryRouter>
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
          <CharactersCountContext.Provider
            value={{ charactersCount: 0, refetch: vi.fn() }}
          >
            <AppLayout />
          </CharactersCountContext.Provider>
        </SettingsContext.Provider>
      </MemoryRouter>,
    );

    // when
    const updateLink = screen.getByRole('link', {
      name: 'A new update is available. Go to Settings to install it.',
    });

    // then
    expect(screen.getByText('v1.2.3')).toBeTruthy();
    expect(updateLink.getAttribute('href')).toBe('/settings');
    expect(updateLink.getAttribute('data-tooltip-content')).toBe(
      'A new update is available. Go to Settings to install it.',
    );
  });

  it('shows a tooltip-enabled spinner while an update is downloading', () => {
    // given
    updateServiceMock.mockReturnValue({
      availableUpdate: null,
      isDownloading: true,
    });

    // when
    render(
      <MemoryRouter>
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
          <CharactersCountContext.Provider
            value={{ charactersCount: 0, refetch: vi.fn() }}
          >
            <AppLayout />
          </CharactersCountContext.Provider>
        </SettingsContext.Provider>
      </MemoryRouter>,
    );

    // then
    const spinner = screen.getByRole('status', {
      name: 'Downloading update',
    });
    expect(spinner.parentElement?.getAttribute('data-tooltip-content')).toBe(
      'Downloading update.',
    );
    expect(
      screen.queryByRole('link', {
        name: 'A new update is available. Go to Settings to install it.',
      }),
    ).toBeNull();
  });
});
