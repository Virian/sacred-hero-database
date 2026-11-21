import clsx from 'clsx';

import { CharacterPortrait } from '../../../components';
import type { CharacterClass } from '../../../enums';

import styles from './CharacterRow.module.scss';

interface CharacterRowProps {
  isSelected?: boolean;
  onClick?: (id: string) => void;
  id: string;
  characterClass: CharacterClass;
  name: string;
  level: number;
  modifiedAt?: Date;
}

export const CharacterRow = ({
  isSelected,
  onClick = () => {},
  id,
  characterClass,
  name,
  level,
  modifiedAt,
}: CharacterRowProps) => (
  <li
    className={clsx(styles.characterRow, {
      [styles.selected]: isSelected,
    })}
    onClick={() => onClick(id)}
  >
    <CharacterPortrait
      className={styles.characterPortrait}
      characterClass={characterClass}
      size={40}
    />
    <div className={styles.characterData}>
      <span className={styles.characterName}>{name}</span>
      <span className={styles.characterClassAndLevel}>
        {characterClass} · Lv{level}
      </span>
    </div>
    <div className={styles.characterDetails}>
      <span>Last modified:</span>
      <span>{modifiedAt?.toLocaleString()}</span>
    </div>
  </li>
);
