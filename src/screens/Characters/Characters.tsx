import { useContext, useMemo } from 'react';
import { Link } from 'react-router';
import { CircleX, RefreshCw } from 'lucide-react';

import { Button, Spinner } from '../../components';
import { SettingsContext } from '../../context';
import { CharacterClass, Commands } from '../../enums';
import { useInvokeQuery } from '../../hooks';
import type { GetActiveCharactersCommandResponse } from '../../types';
import { stripCharacterFormatting } from '../../utils';

import { CharacterCard, EmptyCharacterCard } from './CharacterCard';
import styles from './Characters.module.scss';
import { Routes } from '../../constants';

interface ActiveCharacter {
  id: string;
  name: string;
  characterClass: CharacterClass;
  level: number;
  isHardcore: boolean;
  deathCount: number;
  survivalBonus: number;
  playTime: number;
  modifiedAt: Date;
}

export const Characters = () => {
  const {
    settings: { gameInstallationPath, activeCharacterSlots },
  } = useContext(SettingsContext);

  const {
    data,
    isLoading,
    isFetching,
    refetch: refetchActiveCharacters,
  } = useInvokeQuery<
    GetActiveCharactersCommandResponse,
    Array<ActiveCharacter | null>
  >({
    command: Commands.GET_ACTIVE_CHARACTERS,
    mapper: (data) =>
      data.map(({ character, slot }) =>
        character
          ? {
              id: `${slot}`,
              name: stripCharacterFormatting(character.name),
              characterClass: character.class,
              level: character.level,
              isHardcore: character.hardcore,
              deathCount: character.revivals,
              survivalBonus: character.survival_bonus,
              playTime: character.play_time.secs,
              modifiedAt: new Date(character.modified.secs_since_epoch * 1000),
            }
          : null,
      ),
  });

  const activeCharacters: Array<ActiveCharacter | null> = useMemo(() => {
    const baseArray = new Array(activeCharacterSlots).fill(null);

    return baseArray.map((_, index) => {
      const slotNumber = `${index + 1}`;
      return (
        (data || []).find((character) => character?.id === slotNumber) || null
      );
    });
  }, [activeCharacterSlots, data]);

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

    if (isLoading) {
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
            isLoading={isFetching}
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
