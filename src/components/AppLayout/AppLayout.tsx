import { useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import {
  Users,
  BookUser,
  Download,
  Settings as SettingsIcon,
  TriangleAlert,
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { getVersion } from '@tauri-apps/api/app';

import { Badge, Menu, MenuOption, SettingsError, Spinner } from '../';
import { Routes } from '../../constants';
import { CharactersCountContext, SettingsContext } from '../../context';

import styles from './AppLayout.module.scss';

export const AppLayout = () => {
  const { settings, isInitialized, initializationError } =
    useContext(SettingsContext);
  const { charactersCount } = useContext(CharactersCountContext);

  const [appVersion, setAppVersion] = useState('');

  const isGameInstallationPathMissing = !settings.gameInstallationPath;

  useEffect(() => {
    const getAppVersion = async () => {
      setAppVersion(await getVersion());
    };

    getAppVersion();
  }, []);

  const renderCountBadge = () => {
    if (!charactersCount) {
      return null;
    }

    const charactersCountFormatted =
      charactersCount > 999 ? '999+' : charactersCount;

    return <Badge>{charactersCountFormatted}</Badge>;
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
        {appVersion && <span className={styles.appVersion}>v{appVersion}</span>}
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
      <Tooltip id="settings-warning" />
    </div>
  );
};
