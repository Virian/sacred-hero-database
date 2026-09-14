import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

import styles from './Button.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = ({
  className,
  children,
  variant = 'primary',
  type = 'button',
  ...buttonProps
}: ButtonProps) => (
  <button
    {...buttonProps}
    className={clsx(styles.button, styles[`button-${variant}`], className)}
    type={type}
  >
    {children}
  </button>
);
