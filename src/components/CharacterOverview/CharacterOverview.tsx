import clsx from 'clsx';
import isNil from 'lodash/isNil';

import { Button, CharacterPortrait } from '../';
import type { CharacterClass } from '../../enums';

import styles from './CharacterOverview.module.scss';

interface CharacterOverviewProps {
  id: string;
  characterClass?: CharacterClass;
  name?: string;
  level?: number;
  className?: string;
  levelLabel?: string;
  overviewText?: string;
  onActivate?: (id: string) => void;
  onViewVersions?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const CharacterOverview = ({
  className = '',
  id,
  characterClass,
  name,
  level,
  levelLabel = 'Lv',
  overviewText,
  onActivate,
  onViewVersions,
  onDelete,
}: CharacterOverviewProps) => {
  const handleActivate = () => onActivate?.(id);
  const handleViewVersions = () => onViewVersions?.(id);
  const handleDelete = () => onDelete?.(id);

  const levelText = isNil(level) ? '' : `${levelLabel}${level}`;

  return (
    <div className={clsx(styles.characterOverview, className)}>
      <div className={styles.allOverviewInformation}>
        {characterClass && (
          <CharacterPortrait
            characterClass={characterClass}
            size={56}
          />
        )}
        <div className={styles.overviewTextInformationContainer}>
          <h4>{name}</h4>
          <p className={styles.overviewText}>
            {[characterClass, levelText].filter(Boolean).join(' · ')}
          </p>
          {overviewText && (
            <p className={styles.overviewText}>{overviewText}</p>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        {onActivate && (
          <Button
            className={styles.button}
            onClick={handleActivate}
          >
            Make active
          </Button>
        )}
        {onViewVersions && (
          <Button
            variant="secondary"
            className={styles.button}
            onClick={handleViewVersions}
          >
            View versions
          </Button>
        )}
        {onDelete && (
          <Button
            variant="danger"
            className={styles.button}
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};
