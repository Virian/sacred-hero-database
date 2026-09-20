import { NavLink } from 'react-router';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

import styles from './MenuOption.module.scss';

interface MenuOptionProps {
  icon?: LucideIcon;
  route: string;
  label: string;
  rightContent?: React.ReactNode;
}

export const MenuOption = ({
  icon: Icon,
  route,
  label,
  rightContent,
}: MenuOptionProps) => (
  <NavLink
    to={route}
    className={({ isActive }) =>
      clsx(styles.option, { [styles.active]: isActive })
    }
  >
    {Icon && <Icon size={22} />}
    <span className={styles.label}>{label}</span>
    {rightContent}
  </NavLink>
);
