import clsx from 'clsx';
import type { ChangeEvent } from 'react';
import styles from './Radio.module.scss';

interface RadioProps {
  checked?: boolean;
  className?: string;
  id?: string;
  label: string;
  name: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  value: string;
}

export const Radio = ({
  checked,
  className,
  id,
  label,
  name,
  onChange,
  value,
}: RadioProps) => (
  <label className={clsx(styles.radio, className)}>
    <input
      type="radio"
      id={id}
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
    />
    {label}
  </label>
);
