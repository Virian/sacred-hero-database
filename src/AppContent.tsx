import { useContext, useState } from 'react';
import {
  Users,
  BookUser,
  Download,
  Settings as SettingsIcon,
  TriangleAlert,
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';

import { Badge, Menu, MenuOption, SettingsError, Spinner } from './components';
import { SettingsContext } from './context';
import { MenuOptions } from './enums';
import { AllCharacters, Characters, Import, Settings } from './screens';

import styles from './AppContent.module.scss';

export const AppContent = () => {
  const { settings, isInitialized, initializationError } =
    useContext(SettingsContext);
  const [activeMenuOption, setActiveMenuOption] = useState<MenuOptions>(
    MenuOptions.CHARACTERS,
  );

  const isGameInstallationPathMissing = !settings.gameInstallationPath;

  const renderActiveScreen = () => {
    switch (activeMenuOption) {
      case MenuOptions.CHARACTERS:
        return <Characters />;
      case MenuOptions.ALL_CHARACTERS:
        return <AllCharacters />;
      case MenuOptions.IMPORT:
        return <Import />;
      case MenuOptions.SETTINGS:
        return <Settings />;
      default:
        return null;
    }
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
            label="Characters"
            isActive={activeMenuOption === MenuOptions.CHARACTERS}
            onClick={() => setActiveMenuOption(MenuOptions.CHARACTERS)}
          />
          <MenuOption
            icon={BookUser}
            label="All Characters"
            isActive={activeMenuOption === MenuOptions.ALL_CHARACTERS}
            onClick={() => setActiveMenuOption(MenuOptions.ALL_CHARACTERS)}
            rightContent={<Badge>12</Badge>}
          />
          <MenuOption
            icon={Download}
            label="Import"
            isActive={activeMenuOption === MenuOptions.IMPORT}
            onClick={() => setActiveMenuOption(MenuOptions.IMPORT)}
          />
          <MenuOption
            icon={SettingsIcon}
            label="Settings"
            isActive={activeMenuOption === MenuOptions.SETTINGS}
            onClick={() => setActiveMenuOption(MenuOptions.SETTINGS)}
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
      <main className={styles.main}>{renderActiveScreen()}</main>
      <Tooltip id="settings-warning" />
    </div>
  );
};
