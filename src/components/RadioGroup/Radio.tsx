import clsx from 'clsx';
import type { InputHTMLAttributes } from 'react';
import styles from './Radio.module.scss';

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  value: string;
}

export const Radio = ({
  className,
  label,
  name,
  type = 'radio',
  value,
  ...radioProps
}: RadioProps) => (
  <label className={clsx(styles.radio, className)}>
    <input
      {...radioProps}
      type={type}
      name={name}
      value={value}
    />
    {label}
  </label>
);
