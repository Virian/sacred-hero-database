import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

import styles from './IconButton.module.scss';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const IconButton = ({
  className,
  children,
  type = 'button',
  ...buttonProps
}: IconButtonProps) => (
  <button
    {...buttonProps}
    className={clsx(styles.button, className)}
    type={type}
  >
    {children}
  </button>
);
