import React from 'react';

// interfaces
interface IProps {
  type?: 'button' | 'submit';
  text: string;
  color: string;
  leftIcon?: string;
  rightIcon?: string;
  disabled?: boolean;
  dataIntent?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<IProps> = ({
  type,
  text,
  color,
  leftIcon,
  rightIcon,
  disabled,
  dataIntent,
  onClick,
}) => (
  <button
    type={type === 'submit' ? 'submit' : 'button'}
    className={`button ${color}`}
    disabled={disabled}
    data-intent={dataIntent}
    onClick={onClick}
  >
    {leftIcon !== undefined && (
      <span className='material-symbols-outlined left-icon'>{leftIcon}</span>
    )}
    {text}
    {rightIcon !== undefined && (
      <span className='material-symbols-outlined right-icon'>{rightIcon}</span>
    )}
  </button>
);

export default Button;
