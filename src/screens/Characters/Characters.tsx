import { useContext, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { CircleX, RefreshCw } from 'lucide-react';

import { Button, Spinner } from '../../components';
import { Routes } from '../../constants';
import { CharactersCountContext, SettingsContext } from '../../context';
import { Commands } from '../../enums';
import { useInvokeMutation } from '../../hooks';
import type { Character, RemoveFromSlotCommandParams } from '../../types';

import styles from './Characters.module.scss';
import { CharacterCard, EmptyCharacterCard } from './CharacterCard';
import { ConfirmRemoveModal } from './ConfirmRemoveModal/ConfirmRemoveModal';
import { useActiveCharacters } from './useActiveCharacters';
import { useBackup } from './useBackup';

export const Characters = () => {
  const {
    settings: { gameInstallationPath, activeCharacterSlots },
  } = useContext(SettingsContext);
  const { refetch: refetchCharactersCount } = useContext(
    CharactersCountContext,
  );

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [characterToRemove, setCharacterToRemove] = useState<{
    character: Omit<Character, 'version'>;
    slotNumber: number;
  } | null>(null);
  const [isRemoveFromSlotLoading, setIsRemoveFromSlotLoading] = useState(false);

  const { invoke: removeFromSlotCommand } =
    useInvokeMutation<RemoveFromSlotCommandParams>({
      command: Commands.REMOVE_FROM_SLOT,
    });

  const {
    activeCharacters,
    refetch: refetchActiveCharacters,
    isLoading: isLoadingCharacters,
    isFetching: isFetchingCharacters,
  } = useActiveCharacters();

  const {
    backedUpCardNumber,
    isLoading: isBackupLoading,
    handleBackup,
  } = useBackup();

  const handleCardRemove = (
    character: Omit<Character, 'version'>,
    slotNumber?: number,
  ) => {
    setCharacterToRemove({
      character: character,
      slotNumber: slotNumber || 0,
    });
    setIsRemoveModalOpen(true);
  };

  const removeFromSlot = async (shouldBackup: boolean) => {
    if (!characterToRemove) {
      return;
    }

    try {
      setIsRemoveFromSlotLoading(true);

      if (shouldBackup) {
        const backupSucceeded = await handleBackup(
          characterToRemove.character,
          characterToRemove.slotNumber,
        );

        // don't proceed if backup failed
        // toast error is already shown by `handleBackup`
        if (!backupSucceeded) {
          return;
        }
      }

      await removeFromSlotCommand({ slotNumber: characterToRemove.slotNumber });
      setIsRemoveModalOpen(false);
      toast.success(
        `Removed "${characterToRemove.character.name}" from slot ${characterToRemove.slotNumber}.`,
      );
      refetchActiveCharacters();
      refetchCharactersCount();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(
        `Removing "${characterToRemove.character.name}" from slot ${characterToRemove.slotNumber} failed: ${errorMessage}`,
      );
    } finally {
      setIsRemoveFromSlotLoading(false);
    }
  };

  const renderContent = () => {
    if (!gameInstallationPath) {
      return (
        <div className={styles.errorContainer}>
          <CircleX
            size={36}
            className={styles.errorIcon}
          />
          <span>Could not load active characters.</span>
          <span className={styles.errorDescription}>
            Set your game installation path in{' '}
            <Link
              to={`/${Routes.SETTINGS}`}
              className={styles.link}
            >
              Settings
            </Link>{' '}
            to load your active characters.
          </span>
        </div>
      );
    }

    if (isLoadingCharacters) {
      return (
        <div className={styles.spinnerContainer}>
          <Spinner />
        </div>
      );
    }

    return (
      <>
        <div className={styles.characters}>
          {activeCharacters.map((character, index) =>
            character ? (
              <CharacterCard
                key={character.id}
                cardNumber={index + 1}
                character={character}
                isBackupLoading={
                  isBackupLoading && backedUpCardNumber === index + 1
                }
                onBackup={handleBackup}
                onRemove={handleCardRemove}
              />
            ) : (
              <EmptyCharacterCard
                key={index + 1}
                cardNumber={index + 1}
              />
            ),
          )}
        </div>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            isLoading={isFetchingCharacters}
            onClick={() => refetchActiveCharacters()}
          >
            <span className={styles.buttonText}>
              <RefreshCw size={16} />
              Refresh
            </span>
          </Button>
        </div>
        <ConfirmRemoveModal
          isOpen={isRemoveModalOpen}
          onClose={() => setIsRemoveModalOpen(false)}
          onConfirm={removeFromSlot}
          isLoading={isRemoveFromSlotLoading}
          characterName={characterToRemove?.character.name || ''}
          slotNumber={characterToRemove?.slotNumber || 0}
        />
      </>
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Characters</h1>
      <h2 className={styles.subheading}>
        Active character slots (1 - {activeCharacterSlots})
      </h2>
      {renderContent()}
    </div>
  );
};
