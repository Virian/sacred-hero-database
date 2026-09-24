import { useState } from 'react';
import { useNavigate } from 'react-router';
import isNil from 'lodash/isNil';

import {
  CharacterOverview,
  CharacterPortrait,
  CharacterTable,
  Spinner,
  type ColumnDefinition,
} from '../../components';
import { Routes } from '../../constants';
import { CharacterClass, Commands } from '../../enums';
import { useInvokeQuery } from '../../hooks';
import type { GetAllCharactersCommandResponse } from '../../types';
import { stripCharacterFormatting } from '../../utils';

import { CharacterDetails } from './CharacterDetails/CharacterDetails';
import type { CharacterRow, MappedCharacter } from './CharactersDatabase.types';
import styles from './CharactersDatabase.module.scss';

const portraitColumn: ColumnDefinition<CharacterRow, CharacterClass> = {
  id: 'portrait',
  field: 'characterClass',
  width: 'calc(36px + 1rem)',
  rowCellClass: styles.portraitCell,
  cellRenderer: (characterClass) => (
    <CharacterPortrait
      characterClass={characterClass}
      size={36}
    />
  ),
};

const levelColumn: ColumnDefinition<CharacterRow, number | undefined> = {
  id: 'level',
  field: 'level',
  width: 50,
  headerLabel: 'Level',
  headerCellClass: styles.numberCell,
  rowCellClass: styles.numberCell,
  cellRenderer: (level) => level ?? '-',
};

const columnDefinitions: ColumnDefinition<CharacterRow>[] = [
  portraitColumn,
  {
    id: 'name',
    field: 'name',
    width: 'minmax(0, 1fr)',
    headerLabel: 'Name',
    rowCellClass: styles.nameCell,
  },
  {
    id: 'characterClass',
    field: 'characterClass',
    width: 110,
    headerLabel: 'Class',
  },
  levelColumn,
  {
    id: 'versionCount',
    field: 'versionCount',
    width: 70,
    headerLabel: 'Versions',
    headerCellClass: styles.numberCell,
    rowCellClass: styles.numberCell,
  },
];

export const CharactersDatabase = () => {
  const navigate = useNavigate();

  const [selectedCharacter, setSelectedCharacter] =
    useState<MappedCharacter | null>(null);

  const { data: characters, isLoading } = useInvokeQuery<
    GetAllCharactersCommandResponse,
    MappedCharacter[]
  >({
    command: Commands.GET_ALL_CHARACTERS,
    mapper: (data) =>
      data.map((character) => ({
        id: character.id,
        characterClass: character.class,
        name: stripCharacterFormatting(character.name),
        versionCount: character.versions_count,
        version: character.latest_version?.version_number,
        level: character.latest_version?.level,
        isHardcore: character.latest_version?.hardcore,
        deathCount: character.latest_version?.deaths,
        survivalBonus: character.latest_version?.survival_bonus,
        playTime: character.latest_version?.play_time_seconds,
        modifiedAt: isNil(character.latest_version?.modified_at)
          ? undefined
          : new Date(character.latest_version.modified_at),
      })),
  });

  const handleRowClick = (characterId: string) => {
    const clickedCharacter = characters?.find(({ id }) => id === characterId);
    setSelectedCharacter(clickedCharacter || null);
  };

  const handleViewVersions = (id: string) => {
    navigate(
      `/${Routes.CHARACTERS_DATBASE}/${Routes.CHARACTER_VERSIONS}`.replace(
        ':characterId',
        id,
      ),
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Characters Database</h1>
      <h2 className={styles.subheading}>
        Your characters (latest version of each)
      </h2>
      {isLoading ? (
        <div className={styles.spinnerContainer}>
          <Spinner />
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.tableSection}>
            <CharacterTable
              columnDefinitions={columnDefinitions}
              rows={characters || []}
              isFullWidth
              selectedRowIds={selectedCharacter ? [selectedCharacter.id] : []}
              onRowClick={handleRowClick}
            />
            <span className={styles.characterCount}>
              {characters?.length || 0} characters
            </span>
          </div>

          {selectedCharacter ? (
            <>
              <div className={styles.separator} />

              <div className={styles.characterSection}>
                <CharacterOverview
                  id={selectedCharacter.id}
                  characterClass={selectedCharacter.characterClass}
                  name={selectedCharacter.name}
                  level={selectedCharacter.level}
                  levelLabel="Latest Lv"
                  overviewText={`${selectedCharacter.versionCount} version(s)`}
                  onActivate={() => null}
                  onViewVersions={handleViewVersions}
                  onDelete={() => null}
                />
                <CharacterDetails
                  isHardcore={selectedCharacter.isHardcore}
                  deathCount={selectedCharacter.deathCount}
                  survivalBonus={selectedCharacter.survivalBonus}
                  playTime={selectedCharacter.playTime}
                  modifiedAt={selectedCharacter.modifiedAt}
                />
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
