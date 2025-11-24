'use client';

import { useEffect } from 'react';
import { useUser } from '@contexts/UserContext';
import { useRouter } from 'next/navigation';

const SignOutPage: React.FC = () => {
  const { logout } = useUser();
  const router = useRouter();

  useEffect(() => {
    const handleSignOut = async () => {
      await logout();
      router.push('/');
    };

    handleSignOut();
  }, [logout, router]);

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold mb-4'>Cerrando sesión...</h2>
        <p className='text-gray-600'>Por favor espera un momento.</p>
      </div>
    </div>
  );
};

export default SignOutPage;
