import clsx from 'clsx';
import type { InputHTMLAttributes } from 'react';

import styles from './Input.module.scss';

export const Input = ({
  className,
  type = 'text',
  ...inputProps
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...inputProps}
    className={clsx(styles.input, className)}
    type={type}
  />
);
