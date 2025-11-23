'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Usuario } from '@utils/api';
import { useUser } from '@contexts/UserContext';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface HeaderProps {
  user: Usuario | null;
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ user: propUser, onMenuToggle }) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const showFeedNav = pathname === '/' || pathname === '' || pathname === null;
  ///////////////////////////////////////////////////////////////////////
  const { logout } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const user = propUser;
  const isAuthenticated = !!user;
  const primerNombre = user?.nombre.split(' ')[0] || '';
  const nombreLowerCase = primerNombre.toLowerCase();
  const nombreMostrado = nombreLowerCase.charAt(0).toUpperCase() + nombreLowerCase.slice(1);
  ///////////////////////////////////////////////////////////////////////

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión. Intenta nuevamente.');
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled
          ? 'bg-black/95 backdrop-blur-sm shadow-lg'
          : 'bg-gradient-to-b from-black/90 to-transparent'
        }`}
    >
      <div className='container mx-auto grid grid-cols-3 items-center px-4 py-3'>
        {/* Logo */}
        <div className='flex items-center justify-start gap-4'>
          <Link href='/'>
            <img src='/logo_transparente.png' alt='Nexivent' className='h-20 w-auto' />
          </Link>
        </div>
        {/* Navegación central */}
        {showFeedNav && (
          <nav className='hidden md:flex items-center justify-center gap-8'>
            <Link
              href='/'
              className='text-white text-sm font-medium hover:text-white/80 transition-colors'
            >
              Recomendado
            </Link>
            <Link
              href='/list?search=1'
              className='text-white hover:text-white/80 transition-colors'
              aria-label='Ir a la sección de búsqueda en la lista de eventos'
            >
              <Search size={22} />
            </Link>
          </nav>
        )}
        {/* Sección de usuario */}
        <div className='flex items-center justify-end'>
          {isAuthenticated && user ? (
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
                  src='/default_avatar.jpg'
                  alt='Foto de Perfil'
                  className='h-8 w-8 rounded-full object-cover border-2 border-transparent group-hover:border-white/50 transition'
                />
                <div className='hidden lg:flex items-center gap-1 text-white text-sm font-medium hover:text-white/80 transition-colors'>
                  {nombreMostrado}
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
                  <button
                    onClick={handleLogout}
                    className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50'
                  >
                    Cerrar sesión
                  </button>
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
