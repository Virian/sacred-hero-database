import clsx from 'clsx';
import { CirclePlus } from 'lucide-react';

import styles from './Card.module.scss';

interface EmptyCardProps {
  slotNumber: number;
  isActive: boolean;
  onClick: () => void;
}

export const EmptyCard = ({
  slotNumber,
  isActive,
  onClick,
}: EmptyCardProps) => (
  <div
    className={clsx(styles.card, styles.emptyCard, {
      [styles.active]: isActive,
    })}
    onClick={onClick}
  >
    <span className={styles.slotNumber}>{slotNumber}</span>
    <CirclePlus
      className={styles.emptySlotIcon}
      size={24}
    />
    <span className={styles.emptySlotText}>Empty Slot</span>
  </div>
);
