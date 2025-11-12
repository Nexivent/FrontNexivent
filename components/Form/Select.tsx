// components/Form/Select.tsx
import React, { forwardRef, SelectHTMLAttributes } from 'react';

interface Option {
  label: string;
  value: string | number;
}

interface IProps extends SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label?: string;
  options: Option[];
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, IProps>(
  ({ name, label, options, error, ...rest }, ref) => (
    <div className='form-group'>
      {' '}
      {label && <label htmlFor={name}>{label}</label>}
      <div className='select-wrapper'>
        {' '}
        <select
          id={name}
          name={name}
          ref={ref}
          className={`select-native ${error ? 'input-error' : ''}`}
          {...rest}
        >
          <option value=''>Seleccionar...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className='form-error'>{error}</p>}
    </div>
  )
);

Select.displayName = 'Select';

export default Select;
