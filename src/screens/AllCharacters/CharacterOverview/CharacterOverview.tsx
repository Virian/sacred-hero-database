import { Button, CharacterPortrait } from '../../../components';
import type { Character } from '../../../types';

import styles from './CharacterOverview.module.scss';

type CharacterOverviewProps = Pick<
  Character,
  'id' | 'characterClass' | 'name' | 'level'
> & {
  versionCount: number;
  onActivate?: (id: string) => void;
  onViewVersions?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export const CharacterOverview = ({
  id,
  characterClass,
  name,
  level,
  versionCount,
  onActivate,
  onViewVersions,
  onDelete,
}: CharacterOverviewProps) => {
  const handleActivate = () => onActivate?.(id);
  const handleViewVersions = () => onViewVersions?.(id);
  const handleDelete = () => onDelete?.(id);

  return (
    <div className={styles.characterOverview}>
      <div className={styles.allOverviewInformation}>
        <CharacterPortrait
          characterClass={characterClass}
          size={56}
        />
        <div className={styles.overviewTextInformationContainer}>
          <h4>{name}</h4>
          <p className={styles.overviewText}>
            {characterClass} · Latest Lv{level}
          </p>
          <p className={styles.overviewText}>{versionCount} versions</p>
        </div>
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.button}
          onClick={handleActivate}
        >
          Make active
        </Button>
        <Button
          variant="secondary"
          className={styles.button}
          onClick={handleViewVersions}
        >
          View versions
        </Button>
        <Button
          variant="danger"
          className={styles.button}
          onClick={handleDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};
