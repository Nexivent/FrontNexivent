import Link from 'next/link';

// interfaces
interface IProps {
  url: string;
  text: string;
  color: string;
  leftIcon?: string;
  rightIcon?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

const ButtonLink: React.FC<IProps> = ({ url, text, color, leftIcon, rightIcon, onClick }) => (
  <Link className={`button ${color}`} href={`/${url}`} onClick={onClick}>
    {leftIcon !== undefined && (
      <span className='material-symbols-outlined left-icon'>{leftIcon}</span>
    )}
    {text}
    {rightIcon !== undefined && (
      <span className='material-symbols-outlined right-icon'>{rightIcon}</span>
    )}
  </Link>
);

export default ButtonLink;
