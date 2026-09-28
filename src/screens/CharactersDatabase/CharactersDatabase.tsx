import { useContext, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import isNil from 'lodash/isNil';

import {
  CharacterOverview,
  CharacterPortrait,
  CharacterTable,
  ConfirmModal,
  Spinner,
  type ColumnDefinition,
} from '../../components';
import { Routes } from '../../constants';
import { CharactersCountContext } from '../../context';
import { CharacterClass, Commands } from '../../enums';
import { useInvokeMutation, useInvokeQuery } from '../../hooks';
import type {
  DeleteCharacterCommandParams,
  GetAllCharactersCommandResponse,
} from '../../types';
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

  const { refetch: refetchCharactersCount } = useContext(
    CharactersCountContext,
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] =
    useState<MappedCharacter | null>(null);

  const {
    data: characters,
    isLoading,
    refetch: refetchCharacters,
  } = useInvokeQuery<GetAllCharactersCommandResponse, MappedCharacter[]>({
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

  const { invoke: deleteCharacter, isLoading: isDeleteLoading } =
    useInvokeMutation<DeleteCharacterCommandParams>({
      command: Commands.DELETE_CHARACTER,
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

  const handleDeleteCharacter = async () => {
    if (!selectedCharacter) {
      toast.error('No character is selected to delete.');
      return;
    }

    try {
      await deleteCharacter({ characterId: selectedCharacter.id });
      setSelectedCharacter(null);
      setIsDeleteModalOpen(false);
      refetchCharacters();
      refetchCharactersCount();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(
        `Failed to delete "${selectedCharacter.name}": ${errorMessage}`,
      );
    }
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
                  onDelete={() => setIsDeleteModalOpen(true)}
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
      <ConfirmModal
        title="Delete character"
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCharacter}
        isLoading={isDeleteLoading}
      >
        This will permanently delete the selected character and all of its saved
        versions.
      </ConfirmModal>
    </div>
  );
};
