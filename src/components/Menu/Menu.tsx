import styles from './Menu.module.scss';

interface MenuProps {
  children?: React.ReactNode;
}

export const Menu = ({ children }: MenuProps) => (
  <ul className={styles.list}>{children}</ul>
);
