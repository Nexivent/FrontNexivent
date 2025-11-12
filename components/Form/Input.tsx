import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
// interfaces
interface IProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  error?: string;
  isPassword?: boolean;
}

const Input = forwardRef<HTMLInputElement, IProps>(
  ({ name, label, error, type, isPassword = false, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    return (
      <div className='form-group'>
        {label && (
          <div className='label-line'>
            <label htmlFor={name}>{label}</label>
          </div>
        )}
        <div className='input-wrapper'>
          <input
            id={name}
            name={name}
            ref={ref}
            type={inputType}
            autoComplete='off'
            className={`input-text ${error ? 'input-error' : ''}`}
            {...rest}
          />
          {isPassword && (
            <button
              type='button'
              className='password-toggle-button'
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && <p className='form-error'>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
