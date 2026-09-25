import { useContext } from 'react';
import { Link } from 'react-router';
import { CircleX, RefreshCw } from 'lucide-react';

import { Button, Spinner } from '../../components';
import { Routes } from '../../constants';
import { SettingsContext } from '../../context';

import styles from './Characters.module.scss';
import { CharacterCard, EmptyCharacterCard } from './CharacterCard';
import { useActiveCharacters } from './useActiveCharacters';
import { useBackup } from './useBackup';

export const Characters = () => {
  const {
    settings: { gameInstallationPath, activeCharacterSlots },
  } = useContext(SettingsContext);

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
