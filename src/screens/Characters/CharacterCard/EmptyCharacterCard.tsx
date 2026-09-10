import { CirclePlus } from 'lucide-react';
import styles from './EmptyCharacterCard.module.scss';

interface EmptyCharacterCardProps {
  cardNumber?: number;
  onClick?: () => void;
}

export const EmptyCharacterCard = ({
  cardNumber,
  onClick,
}: EmptyCharacterCardProps) => (
  <div
    className={styles.card}
    onClick={onClick}
  >
    <div className={styles.content}>
      <span className={styles.cardNumber}>{cardNumber}</span>

      <CirclePlus
        className={styles.icon}
        size={40}
      />
      <h3 className={styles.title}>Empty Slot</h3>
      <p className={styles.description}>
        Click to select a character from your database.
      </p>
    </div>
  </div>
);
