import clsx from 'clsx';
import styles from './Button.module.scss';

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = ({
  className,
  children,
  disabled = false,
  onClick = () => null,
  variant = 'primary',
}: ButtonProps) => (
  <button
    className={clsx(styles.button, styles[`button-${variant}`], className)}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);
