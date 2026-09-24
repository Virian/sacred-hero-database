import { useContext } from 'react';
import { Outlet } from 'react-router';
import {
  Users,
  BookUser,
  Download,
  Settings as SettingsIcon,
  TriangleAlert,
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';

import { Badge, Menu, MenuOption, SettingsError, Spinner } from '../';
import { Routes } from '../../constants';
import { SettingsContext } from '../../context';
import { Commands } from '../../enums';
import { useInvokeQuery } from '../../hooks';
import type { GetAllCharactersCountCommandResponse } from '../../types';

import styles from './AppLayout.module.scss';

export const AppLayout = () => {
  const { settings, isInitialized, initializationError } =
    useContext(SettingsContext);

  const isGameInstallationPathMissing = !settings.gameInstallationPath;

  const { data: charactersCount } =
    useInvokeQuery<GetAllCharactersCountCommandResponse>({
      command: Commands.GET_ALL_CHARACTERS_COUNT,
    });

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
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
      <Tooltip id="settings-warning" />
    </div>
  );
};
