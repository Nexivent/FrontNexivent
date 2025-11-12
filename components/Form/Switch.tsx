'use client';

import React, { ReactNode, InputHTMLAttributes } from 'react';

interface IProps extends InputHTMLAttributes<HTMLInputElement> {
  children: ReactNode;
  color?: string;
  error?: string;
}

const Switch: React.FC<IProps> = ({ children, name, checked, onChange, error, ...rest }) => {
  return (
    <div className='switch-container'>
      <label htmlFor={name} className='switch-label'>
        <input
          id={name}
          name={name}
          type='checkbox'
          checked={checked}
          onChange={onChange}
          className='switch-input-hidden'
          {...rest}
        />
        <div className={`switch-visual ${checked ? 'checked' : ''}`}>
          <div className='switch-toggle'></div>
        </div>
        <span className='switch-text'>{children}</span>
      </label>
      {error && <p className='form-error switch-error'>{error}</p>}
    </div>
  );
};

export default Switch;
