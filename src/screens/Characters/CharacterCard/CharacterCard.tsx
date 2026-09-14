import { Save } from 'lucide-react';

import { Button, CharacterPortrait } from '../../../components';
import { Character } from '../../../types';
import { formatTime } from '../../../utils';
import styles from './CharacterCard.module.scss';

interface CharacterCardProps {
  cardNumber?: number;
  character: Character;
  onBackup?: (character: Character) => void;
}

export const CharacterCard = ({
  cardNumber,
  character,
  onBackup,
}: CharacterCardProps) => {
  const handleBackup = () => {
    onBackup?.(character);
  };

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <span className={styles.cardNumber}>{cardNumber}</span>

        <div className={styles.leftSection}>
          <CharacterPortrait
            characterClass={character.characterClass}
            size={56}
          />
          <Button
            variant="secondary"
            className={styles.button}
            onClick={handleBackup}
          >
            <span className={styles.buttonText}>
              <Save size={14} />
              Backup
            </span>
          </Button>
        </div>

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
