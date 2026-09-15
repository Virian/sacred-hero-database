import styles from './Spinner.module.scss';

interface SpinnerProps {
  label?: string;
  size?: 'small' | 'medium';
}

export const Spinner = ({
  label = 'Loading',
  size = 'medium',
}: SpinnerProps) => (
  <div
    className={`${styles.spinner} ${styles[`spinner-${size}`]}`}
    role="status"
    aria-label={label}
  />
);
