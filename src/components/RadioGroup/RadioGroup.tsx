import type { ChangeEvent } from 'react';
import { Radio } from './Radio';
import styles from './RadioGroup.module.scss';

interface RadioGroupOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  name: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  options: RadioGroupOption[];
  value: string;
}

export const RadioGroup = ({
  name,
  onChange,
  options,
  value,
}: RadioGroupProps) => (
  <div className={styles.group}>
    {options.map((option) => (
      <Radio
        key={option.value}
        {...option}
        checked={option.value === value}
        name={name}
        onChange={onChange}
      />
    ))}
  </div>
);
