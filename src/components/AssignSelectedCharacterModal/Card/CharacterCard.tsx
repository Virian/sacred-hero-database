import clsx from 'clsx';

import { CharacterPortrait } from '../..';
import type { CharacterClass } from '../../../enums';

import styles from './Card.module.scss';

interface CharacterCardProps {
  slotNumber: number;
  characterClass: CharacterClass;
  name: string;
  level: number;
  isActive: boolean;
  onClick: () => void;
}

export const CharacterCard = ({
  slotNumber,
  characterClass,
  name,
  level,
  isActive,
  onClick,
}: CharacterCardProps) => (
  <div
    className={clsx(styles.card, styles.characterCard, {
      [styles.active]: isActive,
    })}
    onClick={onClick}
  >
    <span className={styles.slotNumber}>{slotNumber}</span>
    <CharacterPortrait
      className={styles.characterPortrait}
      characterClass={characterClass}
      size={36}
    />
    <div className={styles.characterInfo}>
      <span className={styles.characterName}>{name}</span>
      <span className={styles.characterDetails}>
        {characterClass} · Lv {level}
      </span>
    </div>
  </div>
);
