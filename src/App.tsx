import { useState } from 'react';
import {
  Users,
  BookUser,
  Download,
  Settings as SettingsIcon,
  TriangleAlert,
} from 'lucide-react';

import { Badge, Menu, MenuOption } from './components';
import { MenuOptions } from './enums';
import { AllCharacters, Characters, Import, Settings } from './screens';

import styles from './App.module.scss';

function App() {
  const [activeMenuOption, setActiveMenuOption] = useState<MenuOptions>(
    MenuOptions.CHARACTERS,
  );

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
              <TriangleAlert
                size={18}
                color="var(--warning)"
              />
            }
          />
        </Menu>
      </nav>
      <main className={styles.main}>{renderActiveScreen()}</main>
    </div>
  );
}

export default App;
