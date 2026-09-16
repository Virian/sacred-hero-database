import clsx from 'clsx';
import styles from './Spinner.module.scss';

interface SpinnerProps {
  className?: string;
  label?: string;
  size?: 'small' | 'medium';
}

export const Spinner = ({
  className = '',
  label = 'Loading',
  size = 'medium',
}: SpinnerProps) => (
  <div
    className={clsx(styles.spinner, `${styles[`spinner-${size}`]}`, className)}
    role="status"
    aria-label={label}
  />
);
