import { useContext } from 'react';
import { Link, Outlet } from 'react-router';
import {
  Users,
  BookUser,
  Download,
  Info,
  Settings as SettingsIcon,
  TriangleAlert,
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';

import { Badge, Menu, MenuOption, SettingsError, Spinner } from '../';
import { Routes } from '../../constants';
import { CharactersCountContext, SettingsContext } from '../../context';
import { useAppVersion, useUpdateService } from '../../hooks';

import styles from './AppLayout.module.scss';

export const AppLayout = () => {
  const { settings, isInitialized, initializationError } =
    useContext(SettingsContext);
  const { charactersCount } = useContext(CharactersCountContext);
  const { availableUpdate, isDownloading } = useUpdateService();

  const appVersion = useAppVersion();

  const isGameInstallationPathMissing = !settings.gameInstallationPath;

  const renderCountBadge = () => {
    if (!charactersCount) {
      return null;
    }

    const charactersCountFormatted =
      charactersCount > 999 ? '999+' : charactersCount;

    return <Badge>{charactersCountFormatted}</Badge>;
  };

  const renderUpdateIndicator = () => {
    if (isDownloading) {
      return (
        <div
          className={styles.updateDownloading}
          data-tooltip-id="update-status"
          data-tooltip-content="Downloading update."
          data-tooltip-place="top"
        >
          <Spinner
            size="small"
            label="Downloading update"
          />
        </div>
      );
    }

    if (!availableUpdate) {
      return null;
    }

    return (
      <Link
        to={`/${Routes.SETTINGS}`}
        className={styles.updateAvailable}
        aria-label="A new update is available. Go to Settings to install it."
        data-tooltip-id="update-status"
        data-tooltip-content="A new update is available. Go to Settings to install it."
        data-tooltip-place="top"
      >
        <Info size={16} />
      </Link>
    );
  };

  if (!isInitialized) {
    return (
      <div className={styles.loading}>
        <Spinner />
        <span>Loading...</span>
      </div>
    );
  }

  if (initializationError) {
    return <SettingsError errorMessage={initializationError} />;
  }

  return (
    <div className={styles.layout}>
      <nav className={styles.menu}>
        <Menu>
          <MenuOption
            icon={Users}
            route={`/${Routes.CHARACTERS}`}
            label="Characters"
          />
          <MenuOption
            icon={BookUser}
            route={`/${Routes.CHARACTERS_DATBASE}`}
            label="Database"
            rightContent={renderCountBadge()}
          />
          <MenuOption
            icon={Download}
            route={`/${Routes.IMPORT}`}
            label="Import"
          />
          <MenuOption
            icon={SettingsIcon}
            route={`/${Routes.SETTINGS}`}
            label="Settings"
            rightContent={
              isGameInstallationPathMissing && (
                <TriangleAlert
                  className={styles.warningIcon}
                  size={18}
                  data-tooltip-id="settings-warning"
                  data-tooltip-content="Game installation path is not set"
                  data-tooltip-place="bottom"
                />
              )
            }
          />
        </Menu>
        {appVersion && (
          <div className={styles.appVersionContainer}>
            <span className={styles.appVersion}>v{appVersion}</span>
            {renderUpdateIndicator()}
          </div>
        )}
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
      <Tooltip id="settings-warning" />
      <Tooltip id="update-status" />
    </div>
  );
};
