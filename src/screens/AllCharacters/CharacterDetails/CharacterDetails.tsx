import type { Character } from '../../../types';
import { formatTime } from '../../../utils';

import styles from './CharacterDetails.module.scss';

type CharacterDetailsProps = Pick<
  Character,
  'isHardcore' | 'deathCount' | 'survivalBonus' | 'playTime' | 'modifiedAt'
>;

export const CharacterDetails = ({
  isHardcore,
  deathCount,
  survivalBonus,
  playTime,
  modifiedAt,
}: CharacterDetailsProps) => (
  <div className={styles.details}>
    <div className={styles.headerContainer}>
      <h4 className={styles.header}>Character Details</h4>
      <span className={styles.headerDisclaimer}>(Latest version)</span>
    </div>
    <div className={styles.singleDetailContainer}>
      <span className={styles.singleDetailLabel}>Hardcore:</span>
      <span className={styles.singleDetailValue}>
        {isHardcore ? 'Yes' : 'No'}
      </span>
    </div>
    <div className={styles.singleDetailContainer}>
      <span className={styles.singleDetailLabel}>Deaths:</span>
      <span className={styles.singleDetailValue}>{deathCount}</span>
    </div>
    <div className={styles.singleDetailContainer}>
      <span className={styles.singleDetailLabel}>Survival Bonus:</span>
      <span className={styles.singleDetailValue}>{survivalBonus}%</span>
    </div>
    <div className={styles.singleDetailContainer}>
      <span className={styles.singleDetailLabel}>Play time:</span>
      <span className={styles.singleDetailValue}>{formatTime(playTime)}</span>
    </div>
    <div className={styles.singleDetailContainer}>
      <span className={styles.singleDetailLabel}>Last modified:</span>
      <span className={styles.singleDetailValue}>
        {modifiedAt.toLocaleString()}
      </span>
    </div>
  </div>
);
