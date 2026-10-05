import { CharacterPortrait } from '../..';
import type { CharacterClass } from '../../../enums';
import { formatTime } from '../../../utils';
import styles from './Overview.module.scss';

interface OverviewProps {
  name: string;
  characterClass: CharacterClass;
  level: number;
  isHardcore: boolean;
  deathCount: number;
  survivalBonus: number;
  playTime: number;
}

export const Overview = ({
  name,
  characterClass,
  level,
  isHardcore,
  deathCount,
  survivalBonus,
  playTime,
}: OverviewProps) => (
  <div className={styles.overview}>
    <CharacterPortrait
      className={styles.characterPortrait}
      characterClass={characterClass}
    />
    <div className={styles.overviewInfo}>
      <span>{name}</span>
      <span className={styles.overviewDetails}>
        {characterClass} · Lv {level} · {isHardcore ? 'Hardcore' : 'Softcore'} ·{' '}
        {deathCount} deaths · {survivalBonus}% Survival Bonus ·{' '}
        {formatTime(playTime)} Play Time
      </span>
    </div>
  </div>
);
