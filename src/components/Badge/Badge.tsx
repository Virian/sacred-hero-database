import styles from './Badge.module.scss';

interface BadgeProps {
  children: React.ReactNode;
}

export const Badge = ({ children }: BadgeProps) => (
  <span className={styles.badge}>{children}</span>
);
