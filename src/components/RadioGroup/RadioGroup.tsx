import type { ChangeEvent, HTMLAttributes } from 'react';
import { Radio } from './Radio';
import styles from './RadioGroup.module.scss';

interface RadioGroupOption {
  label: string;
  value: string;
}

interface RadioGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  name: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  options: RadioGroupOption[];
  value: string;
}

export const RadioGroup = ({
  className,
  name,
  onChange,
  options,
  value,
  ...groupProps
}: RadioGroupProps) => (
  <div
    {...groupProps}
    className={`${styles.group} ${className ?? ''}`}
  >
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
