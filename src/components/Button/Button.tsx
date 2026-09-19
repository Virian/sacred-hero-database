import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

import { Spinner } from '../Spinner/Spinner';

import styles from './Button.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  contentClassName?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button = ({
  className = '',
  contentClassName = '',
  children,
  variant = 'primary',
  type = 'button',
  isLoading = false,
  disabled,
  ...buttonProps
}: ButtonProps) => (
  <button
    {...buttonProps}
    className={clsx(
      styles.button,
      styles[`button-${variant}`],
      isLoading && styles.loading,
      className,
    )}
    type={type}
    disabled={disabled || isLoading}
  >
    <span className={clsx(styles.content, contentClassName)}>{children}</span>
    {isLoading && (
      <Spinner
        className={styles.spinner}
        size="small"
      />
    )}
  </button>
);
