import { useState } from 'react';

import {
  CharacterPortrait,
  CharacterTable,
  type ColumnDefinition,
} from '../../components';
import { CharacterClass } from '../../enums';
import type { Character } from '../../types';

import { CharacterOverview } from './CharacterOverview/CharacterOverview';
import { CharacterDetails } from './CharacterDetails/CharacterDetails';
import { CharacterVersions } from './CharacterVersions/CharacterVersions';
import styles from './AllCharacters.module.scss';

interface CharacterRow {
  id: string;
  name: string;
  characterClass: CharacterClass;
  level: number;
  versionCount: number;
}

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

const columnDefinitions: ColumnDefinition<CharacterRow>[] = [
  portraitColumn,
  {
    id: 'name',
    field: 'name',
    headerLabel: 'Name',
    rowCellClass: styles.nameCell,
  },
  {
    id: 'characterClass',
    field: 'characterClass',
    width: 110,
    headerLabel: 'Class',
  },
  {
    id: 'level',
    field: 'level',
    width: 50,
    headerLabel: 'Level',
    headerCellClass: styles.numberCell,
    rowCellClass: styles.numberCell,
  },
  {
    id: 'versionCount',
    field: 'versionCount',
    width: 70,
    headerLabel: 'Versions',
    headerCellClass: styles.numberCell,
    rowCellClass: styles.numberCell,
  },
];

interface CharacterWithVersionCount extends Character {
  versionCount: number;
}

const MOCK_CHARACTERS: CharacterWithVersionCount[] = [
  {
    id: '1',
    name: 'Ares',
    characterClass: CharacterClass.GLADIATOR,
    level: 42,
    isHardcore: true,
    deathCount: 0,
    survivalBonus: 38,
    playTime: 45240, // in seconds
    modifiedAt: new Date(),
    version: 1,
    versionCount: 3,
  },
  {
    id: '2',
    name: 'Seraphina',
    characterClass: CharacterClass.SERAPHIM,
    level: 37,
    isHardcore: false,
    deathCount: 2,
    survivalBonus: 95,
    playTime: 33120, // in seconds
    modifiedAt: new Date(),
    version: 1,
    versionCount: 1,
  },
  {
    id: '3',
    name: 'Shadow',
    characterClass: CharacterClass.DARK_ELF,
    level: 28,
    isHardcore: false,
    deathCount: 0,
    survivalBonus: 76,
    playTime: 24300, // in seconds
    modifiedAt: new Date(),
    version: 1,
    versionCount: 2,
  },
  {
    id: '4',
    name: 'Sylvan',
    characterClass: CharacterClass.WOOD_ELF,
    level: 31,
    isHardcore: true,
    deathCount: 0,
    survivalBonus: 84,
    playTime: 28320, // in seconds
    modifiedAt: new Date(),
    version: 1,
    versionCount: 2,
  },
  {
    id: '5',
    name: 'Merlin',
    characterClass: CharacterClass.BATTLE_MAGE,
    level: 40,
    isHardcore: false,
    deathCount: 12,
    survivalBonus: 5,
    playTime: 40860, // in seconds
    modifiedAt: new Date(),
    version: 1,
    versionCount: 5,
  },
  {
    id: '6',
    name: 'Vladis',
    characterClass: CharacterClass.VAMPIRESS,
    level: 26,
    isHardcore: false,
    deathCount: 0,
    survivalBonus: 64,
    playTime: 19980, // in seconds
    modifiedAt: new Date(),
    version: 1,
    versionCount: 1,
  },
  {
    id: '7',
    name: 'Brom',
    characterClass: CharacterClass.DWARF,
    level: 18,
    isHardcore: true,
    deathCount: 1,
    survivalBonus: 22,
    playTime: 1980, // in seconds
    modifiedAt: new Date(),
    version: 1,
    versionCount: 2,
  },
  {
    id: '8',
    name: 'Zhar',
    characterClass: CharacterClass.DAEMON,
    level: 33,
    isHardcore: false,
    deathCount: 10,
    survivalBonus: 68,
    playTime: 32180, // in seconds
    modifiedAt: new Date(),
    version: 1,
    versionCount: 2,
  },
];

export const AllCharacters = () => {
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterWithVersionCount | null>(null);
  const [characterIdBrowseVersions, setCharacterIdBrowseVersions] = useState<
    string | null
  >(null);

  const handleRowClick = (characterId: string) => {
    const clickedCharacter = MOCK_CHARACTERS.find(
      ({ id }) => id === characterId,
    );
    setSelectedCharacter(clickedCharacter || null);
  };

  const handleViewVersions = (id: string) => {
    setCharacterIdBrowseVersions(id);
  };

  const handleBackFromVersions = () => {
    setSelectedCharacter(null);
    setCharacterIdBrowseVersions(null);
  };

  if (characterIdBrowseVersions && selectedCharacter) {
    return (
      <CharacterVersions
        character={selectedCharacter}
        onBack={handleBackFromVersions}
      />
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>All Characters</h1>
      <h2 className={styles.subheading}>
        Your characters (latest version of each)
      </h2>
      <div className={styles.content}>
        <div className={styles.tableSection}>
          <CharacterTable
            columnDefinitions={columnDefinitions}
            rows={MOCK_CHARACTERS}
            isFullWidth
            selectedRowIds={selectedCharacter ? [selectedCharacter.id] : []}
            onRowClick={handleRowClick}
          />
          <span className={styles.characterCount}>12 characters</span>
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
                overviewText={`${selectedCharacter.versionCount} versions`}
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
    </div>
  );
};
