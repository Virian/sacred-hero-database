import { useContext, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';

import {
  AssignSelectedCharacterModal,
  Button,
  CharacterOverview,
  CharacterTable,
  ConfirmModal,
  Spinner,
  type ColumnDefinition,
} from '../../components';
import { Routes } from '../../constants';
import { CharactersCountContext } from '../../context';
import { Commands } from '../../enums';
import { useInvokeMutation, useInvokeQuery } from '../../hooks';
import type {
  Character,
  DeleteCharacterVersionCommandParams,
  GetCharacterByIdCommandParams,
  GetCharacterByIdCommandResponse,
  GetCharacterVersionsCommandParams,
  GetCharacterVersionsCommandResponse,
} from '../../types';
import { stripCharacterFormatting } from '../../utils';

import styles from './CharacterVersions.module.scss';
import type { CharacterRow } from './CharacterVersions.types';
import { mapGetCharacterVersionsCommandResponse } from './mapGetCharacterVersionsCommandResponse';

type CharacterData = Pick<Character, 'id' | 'name' | 'characterClass'>;

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
  const { refetch: refetchCharactersCount } = useContext(
    CharactersCountContext,
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<CharacterRow | null>(
    null,
  );

  const args = useMemo(() => ({ characterId }), [characterId]);

  const {
    data: characterVersions,
    isLoading: isLoadingCharacterVersions,
    refetch: refetchCharacterVersions,
  } = useInvokeQuery<
    GetCharacterVersionsCommandResponse,
    CharacterRow[],
    GetCharacterVersionsCommandParams
  >({
    command: Commands.GET_CHARACTER_VERSIONS,
    args,
    mapper: mapGetCharacterVersionsCommandResponse,
  });

  const { data: characterData, isLoading: isLoadingCharacterData } =
    useInvokeQuery<
      GetCharacterByIdCommandResponse,
      CharacterData | null,
      GetCharacterByIdCommandParams
    >({
      command: Commands.GET_CHARACTER_BY_ID,
      args,
      mapper: (response) =>
        response && {
          id: response.id,
          characterClass: response.class,
          name: stripCharacterFormatting(response.name),
        },
    });

  const { invoke: deleteCharacterVersion, isLoading: isDeleteLoading } =
    useInvokeMutation<DeleteCharacterVersionCommandParams>({
      command: Commands.DELETE_CHARACTER_VERSION,
    });

  const isLoading = isLoadingCharacterVersions || isLoadingCharacterData;

  const handleRowClick = (versionId: string) => {
    const clickedCharacterVersion = characterVersions?.find(
      ({ id }) => id === versionId,
    );
    setSelectedVersion(clickedCharacterVersion || null);
  };

  const handleAssign = async (slotIndex: number, isEmptySlot: boolean) => {
    // TODO
    console.log({ slotIndex, isEmptySlot });
  };

  const handleDeleteCharacterVersion = async () => {
    if (!selectedVersion) {
      toast.error('No character version is selected to delete.');
      return;
    }

    try {
      const isLastVersion = characterVersions?.length === 1;
      await deleteCharacterVersion({ characterVersionId: selectedVersion.id });
      setSelectedVersion(null);
      setIsDeleteModalOpen(false);
      toast.success('Character version deleted successfully.');

      if (isLastVersion) {
        refetchCharactersCount();
        navigate(`/${Routes.CHARACTERS_DATBASE}`);
      } else {
        refetchCharacterVersions();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(
        `Failed to delete version ${selectedVersion.id}: ${errorMessage}`,
      );
    }
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
              onActivate={() => setIsAssignModalOpen(true)}
              onDelete={() => setIsDeleteModalOpen(true)}
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
      {selectedVersion && characterData && (
        <AssignSelectedCharacterModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onAssign={handleAssign}
          character={{
            name: characterData.name,
            level: selectedVersion.level,
            characterClass: characterData.characterClass,
            isHardcore: selectedVersion.isHardcore,
            deathCount: selectedVersion.deathCount,
            survivalBonus: selectedVersion.survivalBonus,
            playTime: selectedVersion.playTime,
          }}
        />
      )}
      <ConfirmModal
        title="Delete character version"
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCharacterVersion}
        isLoading={isDeleteLoading}
      >
        This will permanently delete the selected version. If it is the
        character&apos;s last saved version, the character and its save data
        will also be deleted.
      </ConfirmModal>
    </div>
  );
};
