import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

import styles from './Radio.module.scss';

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Radio = ({
  className,
  label,
  type = 'radio',
  ...radioProps
}: RadioProps) => (
  <label className={clsx(styles.radio, className)}>
    <input
      {...radioProps}
      type={type}
    />
    {label}
  </label>
);
