import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import styles from './MenuOption.module.scss';

interface MenuOptionProps {
  icon?: LucideIcon;
  label: string;
  rightContent?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

export const MenuOption = ({
  icon: Icon,
  label,
  rightContent,
  isActive = false,
  onClick = () => null,
}: MenuOptionProps) => (
  <li
    className={clsx(styles.option, { [styles.active]: isActive })}
    onClick={onClick}
  >
    {Icon && <Icon size={22} />}
    <span className={styles.label}>{label}</span>
    {rightContent}
  </li>
);
