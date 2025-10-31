'use client';

import { useRef, useState, useEffect } from 'react';

import { Menu, Search, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface User {
  name: string;
  photoUrl: string;
}

interface MergedHeaderProps {
  user: User | null;
  onMenuToggle: () => void;
}

const Header: React.FC<MergedHeaderProps> = ({ user, onMenuToggle }) => {
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className='fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-transparent'>
      <div className='container mx-auto grid grid-cols-3 items-center px-4 py-3'>
        <div className='flex items-center justify-start gap-4'>
          <button
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className='text-white hover:text-white/80 transition-colors p-2'
          >
            <Menu size={24} />
          </button>
          <Link href='/'>
            <img src='/logo6.png' alt='Nexivent' className='h-10 w-auto' />
          </Link>
        </div>
        <nav className='hidden md:flex items-center justify-center gap-8'>
          <Link
            href='/'
            className='text-white text-sm font-medium hover:text-white/80 transition-colors'
          >
            Recomendado
          </Link>
          <Link
            href='/tendencias'
            className='text-white/70 text-sm hover:text-white/90 transition-colors'
          >
            Tendencias
          </Link>
          <Link
            href='/search'
            className='text-white hover:text-white/80 transition-colors'
            aria-label='Ir a la página de búsqueda'
          >
            <Search size={22} />
          </Link>
        </nav>
        <div className='flex items-center justify-end'>
          {user ? (
            <div className='relative' ref={dropdownRef}>
              <div
                className='flex items-center gap-3 cursor-pointer'
                role='button'
                tabIndex={0}
                aria-haspopup='true'
                aria-expanded={isDropdownOpen}
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setDropdownOpen(!isDropdownOpen);
                  }
                }}
              >
                <img
                  src={user.photoUrl}
                  alt='Foto de Perfil'
                  className='h-8 w-8 rounded-full object-cover border-2 border-transparent group-hover:border-white/50 transition'
                />
                <div className='hidden lg:flex items-center gap-1 text-white text-sm font-medium hover:text-white/80 transition-colors'>
                  {user.name}
                  {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {isDropdownOpen && (
                <div className='absolute right-0 mt-3 w-48 bg-white rounded-md shadow-lg py-1 z-20 text-black'>
                  <Link
                    href='/members/tickets'
                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  >
                    Mis tickets
                  </Link>
                  <Link
                    href='/members/account'
                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  >
                    Mi cuenta
                  </Link>
                  <div className='border-t border-gray-200 my-1'></div>
                  <Link
                    href='/members/signout'
                    className='block px-4 py-2 text-sm text-red-600 hover:bg-red-50'
                  >
                    Cerrar sesión
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className='hidden md:flex items-center gap-4'>
              <Link
                href='/members/signin'
                className='text-white text-sm font-medium hover:text-white/80 transition-colors'
              >
                Iniciar Sesión
              </Link>
              <Link
                href='/members/signup'
                className='bg-white text-black text-sm font-bold px-4 py-2 rounded-md hover:bg-white/80 transition-colors'
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
