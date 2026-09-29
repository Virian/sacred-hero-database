import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

import styles from './Checkbox.module.scss';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = ({
  className,
  label,
  ...checkboxProps
}: CheckboxProps) => (
  <label className={clsx(styles.checkbox, className)}>
    <input
      {...checkboxProps}
      type="checkbox"
    />
    {label}
  </label>
);
