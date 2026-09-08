import clsx from 'clsx';
import type { ChangeEvent } from 'react';
import styles from './Input.module.scss';

interface InputProps {
  className?: string;
  id?: string;
  name?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  value?: string;
}

export const Input = ({
  className,
  id,
  name,
  onChange,
  placeholder,
  value,
}: InputProps) => (
  <input
    className={clsx(styles.input, className)}
    type="text"
    id={id}
    name={name}
    onChange={onChange}
    placeholder={placeholder}
    value={value}
  />
);
