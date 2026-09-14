import clsx from 'clsx';

import { Button, CharacterPortrait } from '../../../components';
import type { Character } from '../../../types';

import styles from './CharacterOverview.module.scss';

type CharacterOverviewProps = Pick<
  Character,
  'id' | 'characterClass' | 'name' | 'level'
> & {
  className?: string;
  levelLabel?: string;
  overviewText?: string;
  onActivate?: (id: string) => void;
  onViewVersions?: (id: string) => void;
  onDelete?: (id: string) => void;
};

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

  return (
    <div className={clsx(styles.characterOverview, className)}>
      <div className={styles.allOverviewInformation}>
        <CharacterPortrait
          characterClass={characterClass}
          size={56}
        />
        <div className={styles.overviewTextInformationContainer}>
          <h4>{name}</h4>
          <p className={styles.overviewText}>
            {characterClass} · {levelLabel}
            {level}
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
