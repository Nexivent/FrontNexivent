import React, { forwardRef, InputHTMLAttributes } from 'react';
// interfaces
interface IProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, IProps>(({ name, label, error, ...rest }, ref) => {
  return (
    <div className='form-group'>
      {' '}
      {label && (
        <div className='label-line'>
          <label htmlFor={name}>{label}</label>
        </div>
      )}
      <input
        id={name}
        name={name}
        ref={ref}
        autoComplete='off'
        className={`input-text ${error ? 'input-error' : ''}`}
        {...rest}
      />
      {error && <p className='form-error'>{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
