import styles from './Menu.module.scss';

interface MenuProps {
  children?: React.ReactNode;
}

export const Menu = ({ children }: MenuProps) => (
  <div className={styles.menu}>{children}</div>
);
