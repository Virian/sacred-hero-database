import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';

import {
  Button,
  CharacterOverview,
  CharacterTable,
  type ColumnDefinition,
} from '../../components';
import { Routes } from '../../constants';
import { CharacterClass } from '../../enums';

import styles from './CharacterVersions.module.scss';

interface CharacterRow {
  id: string;
  version: number;
  level: number;
  deathCount: number;
  survivalBonus: number;
  modifiedAt: Date;
  isLatest: boolean;
}

const modifiedDateColumn: ColumnDefinition<CharacterRow, Date> = {
  id: 'modifiedAt',
  field: 'modifiedAt',
  headerLabel: 'Modified Date',
  rowCellClass: styles.dateCell,
  cellRenderer: (value) => value.toLocaleString(),
};

const columnDefinitions: ColumnDefinition<CharacterRow>[] = [
  {
    id: 'version',
    field: 'version',
    width: 70,
    headerLabel: 'Version',
    headerCellClass: styles.numberCell,
    rowCellClass: styles.numberCell,
    cellRenderer: (value, row) => {
      if (row.isLatest) {
        return <span className={styles.latestVersionPill}>Latest</span>;
      }

      return value;
    },
  },
  {
    id: 'level',
    field: 'level',
    width: 60,
    headerLabel: 'Level',
    headerCellClass: styles.numberCell,
    rowCellClass: styles.numberCell,
  },
  {
    id: 'deaths',
    field: 'deathCount',
    width: 60,
    headerLabel: 'Deaths',
    headerCellClass: styles.numberCell,
    rowCellClass: styles.numberCell,
  },
  {
    id: 'survivalBonus',
    field: 'survivalBonus',
    width: 100,
    headerLabel: 'Survival Bonus',
    headerCellClass: styles.numberCell,
    rowCellClass: styles.numberCell,
  },
  modifiedDateColumn,
];

const MOCK_CHARACTERS: CharacterRow[] = [
  {
    id: '3',
    version: 3,
    level: 42,
    deathCount: 2,
    survivalBonus: 15,
    modifiedAt: new Date(),
    isLatest: true,
  },
  {
    id: '2',
    version: 2,
    level: 40,
    deathCount: 1,
    survivalBonus: 22,
    modifiedAt: new Date(),
    isLatest: false,
  },
  {
    id: '1',
    version: 1,
    level: 35,
    deathCount: 0,
    survivalBonus: 38,
    modifiedAt: new Date(),
    isLatest: false,
  },
];

const MOCK_CURRENT_CHARACTER = {
  name: 'Ares',
  characterClass: CharacterClass.GLADIATOR,
};

export const CharacterVersions = () => {
  const navigate = useNavigate();

  const [selectedVersion, setSelectedVersion] = useState<CharacterRow | null>(
    null,
  );

  const handleRowClick = (versionId: string) => {
    const clickedCharacterVersion = MOCK_CHARACTERS.find(
      ({ id }) => id === versionId,
    );
    setSelectedVersion(clickedCharacterVersion || null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <Link
          to={`/${Routes.ALL_CHARACTERS}`}
          className={styles.link}
        >
          All Characters
        </Link>
        <ChevronRight size={18} />
        <span className={styles.navigationName}>
          {MOCK_CURRENT_CHARACTER.name}
        </span>
      </div>
      <h1 className={styles.heading}>Character Versions</h1>
      <div className={styles.tableSection}>
        <CharacterTable
          className={clsx({ [styles.fullTable]: !!selectedVersion })}
          isFullWidth={!!selectedVersion}
          rowClassName={styles.tableRow}
          columnDefinitions={columnDefinitions}
          rows={MOCK_CHARACTERS}
          selectedRowIds={selectedVersion ? [selectedVersion.id] : []}
          onRowClick={handleRowClick}
        />
        {selectedVersion && (
          <CharacterOverview
            className={styles.overview}
            id={selectedVersion.id}
            name={MOCK_CURRENT_CHARACTER.name}
            characterClass={MOCK_CURRENT_CHARACTER.characterClass}
            level={selectedVersion.level}
            overviewText={
              selectedVersion.isLatest
                ? 'Latest version'
                : `Version ${selectedVersion.version}`
            }
            onActivate={() => null}
            onDelete={() => null}
          />
        )}
      </div>
      <Button
        className={styles.backButton}
        variant="secondary"
        onClick={() => navigate(-1)}
      >
        Back
      </Button>
    </div>
  );
};
