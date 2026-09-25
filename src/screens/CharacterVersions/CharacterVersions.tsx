import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';

import {
  Button,
  CharacterOverview,
  CharacterTable,
  Spinner,
  type ColumnDefinition,
} from '../../components';
import { Routes } from '../../constants';
import { Commands } from '../../enums';
import { useInvokeQuery } from '../../hooks';
import type {
  Character,
  GetCharacterByIdCommandParams,
  GetCharacterByIdCommandResponse,
  GetCharacterVersionsCommandParams,
  GetCharacterVersionsCommandResponse,
} from '../../types';
import { stripCharacterFormatting } from '../../utils';

import styles from './CharacterVersions.module.scss';

type CharacterData = Pick<Character, 'id' | 'name' | 'characterClass'>;

interface CharacterRow {
  id: string;
  version: number;
  level: number;
  isHardcore: boolean;
  deathCount: number;
  survivalBonus: number;
  playTime: number;
  modifiedAt: Date;
  createdAt: Date;
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

export const CharacterVersions = () => {
  const navigate = useNavigate();
  const { characterId = '' } = useParams();

  const [selectedVersion, setSelectedVersion] = useState<CharacterRow | null>(
    null,
  );

  const { data: characterVersions, isLoading: isLoadingCharacterVersions } =
    useInvokeQuery<
      GetCharacterVersionsCommandResponse,
      CharacterRow[],
      GetCharacterVersionsCommandParams
    >({
      command: Commands.GET_CHARACTER_VERSIONS,
      args: { characterId },
      mapper: (response) =>
        response
          // Double reversing because data comes from backend with the first
          // element being the latest version. We want to have the lowest version
          // number to be the oldest version.
          .reverse()
          .map(
            (
              {
                id,
                is_latest,
                level,
                hardcore,
                deaths,
                survival_bonus,
                play_time_seconds,
                modified_at,
                created_at,
              },
              index,
            ) => ({
              id,
              version: index + 1,
              isLatest: is_latest,
              level,
              isHardcore: hardcore,
              deathCount: deaths,
              survivalBonus: survival_bonus,
              playTime: play_time_seconds,
              modifiedAt: new Date(modified_at),
              createdAt: new Date(created_at),
            }),
          )
          .reverse(),
    });

  const { data: characterData, isLoading: isLoadingCharacterData } =
    useInvokeQuery<
      GetCharacterByIdCommandResponse,
      CharacterData | null,
      GetCharacterByIdCommandParams
    >({
      command: Commands.GET_CHARACTER_BY_ID,
      args: { characterId },
      mapper: (response) =>
        response && {
          id: response.id,
          characterClass: response.class,
          name: stripCharacterFormatting(response.name),
        },
    });

  const isLoading = isLoadingCharacterVersions || isLoadingCharacterData;

  const handleRowClick = (versionId: string) => {
    const clickedCharacterVersion = characterVersions?.find(
      ({ id }) => id === versionId,
    );
    setSelectedVersion(clickedCharacterVersion || null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <Link
          to={`/${Routes.CHARACTERS_DATBASE}`}
          className={styles.link}
        >
          Characters Database
        </Link>
        <ChevronRight size={18} />
        <span className={styles.navigationName}>{characterData?.name}</span>
      </div>
      <h1 className={styles.heading}>Character Versions</h1>
      {isLoading ? (
        <div className={styles.spinnerContainer}>
          <Spinner />
        </div>
      ) : (
        <div className={styles.tableSection}>
          <CharacterTable
            className={clsx({ [styles.fullTable]: !!selectedVersion })}
            isFullWidth={!!selectedVersion}
            rowClassName={styles.tableRow}
            columnDefinitions={columnDefinitions}
            rows={characterVersions || []}
            selectedRowIds={selectedVersion ? [selectedVersion.id] : []}
            onRowClick={handleRowClick}
          />
          {selectedVersion && (
            <CharacterOverview
              className={styles.overview}
              id={selectedVersion.id}
              name={characterData?.name}
              characterClass={characterData?.characterClass}
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
      )}

      <Button
        className={clsx(styles.backButton, {
          [styles.backButtonLoadingScreen]: isLoading,
        })}
        variant="secondary"
        onClick={() => navigate(-1)}
      >
        Back
      </Button>
    </div>
  );
};
