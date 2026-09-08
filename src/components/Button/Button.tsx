import clsx from 'clsx';
import styles from './Button.module.scss';

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = ({
  className,
  children,
  onClick = () => null,
  variant = 'primary',
}: ButtonProps) => (
  <button
    className={clsx(styles.button, styles[`button-${variant}`], className)}
    onClick={onClick}
  >
    {children}
  </button>
);
