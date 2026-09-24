import isNil from 'lodash/isNil';

import { formatTime } from '../../../utils';

import styles from './CharacterDetails.module.scss';

interface CharacterDetailsProps {
  isHardcore?: boolean;
  deathCount?: number;
  survivalBonus?: number;
  playTime?: number;
  modifiedAt?: Date;
}

export const CharacterDetails = ({
  isHardcore,
  deathCount,
  survivalBonus,
  playTime,
  modifiedAt,
}: CharacterDetailsProps) => {
  const getHardcoreLabel = () => {
    if (isNil(isHardcore)) {
      return '-';
    }
    return isHardcore ? 'Yes' : 'No';
  };

  return (
    <div className={styles.details}>
      <div className={styles.headerContainer}>
        <h4 className={styles.header}>Character Details</h4>
        <span className={styles.headerDisclaimer}>(Latest version)</span>
      </div>
      <div className={styles.singleDetailContainer}>
        <span className={styles.singleDetailLabel}>Hardcore:</span>
        <span className={styles.singleDetailValue}>{getHardcoreLabel()}</span>
      </div>
      <div className={styles.singleDetailContainer}>
        <span className={styles.singleDetailLabel}>Deaths:</span>
        <span className={styles.singleDetailValue}>{deathCount ?? '-'}</span>
      </div>
      <div className={styles.singleDetailContainer}>
        <span className={styles.singleDetailLabel}>Survival Bonus:</span>
        <span className={styles.singleDetailValue}>
          {survivalBonus ?? '-'}%
        </span>
      </div>
      <div className={styles.singleDetailContainer}>
        <span className={styles.singleDetailLabel}>Play time:</span>
        <span className={styles.singleDetailValue}>
          {isNil(playTime) ? '-' : formatTime(playTime)}
        </span>
      </div>
      <div className={styles.singleDetailContainer}>
        <span className={styles.singleDetailLabel}>Last modified:</span>
        <span className={styles.singleDetailValue}>
          {modifiedAt?.toLocaleString() ?? '-'}
        </span>
      </div>
    </div>
  );
};
