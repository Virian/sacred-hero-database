import clsx from 'clsx';

import { CharacterPortrait } from '../../../components';
import { Character } from '../../../types';
import { formatTime } from '../../../utils';
import styles from './CharacterCard.module.scss';

interface CharacterCardProps {
  cardNumber?: number;
  isActive?: boolean;
  character: Character;
  onClick?: () => void;
}

export const CharacterCard = ({
  cardNumber,
  isActive = false,
  character,
  onClick,
}: CharacterCardProps) => {
  return (
    <div
      className={clsx(styles.card, { [styles.active]: isActive })}
      onClick={onClick}
    >
      <div className={styles.content}>
        <span className={styles.cardNumber}>{cardNumber}</span>

        <CharacterPortrait
          characterClass={character.characterClass}
          size={56}
        />

        <div className={styles.characterInfo}>
          <h3 className={styles.characterName}>{character.name}</h3>
          <p className={styles.characterDetails}>
            {character.characterClass} · Lv{character.level}
          </p>
          <p className={styles.characterDetails}>
            {character.isHardcore ? 'Hardcore' : 'Softcore'} · Deaths:{' '}
            {character.deathCount}
          </p>
          <p className={styles.characterDetails}>
            Survival Bonus: {character.survivalBonus}% · Play time:{' '}
            {formatTime(character.playTime)}
          </p>
          <p className={styles.characterDetails}>
            Last modified: {character.modifiedAt.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
