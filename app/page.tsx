// components
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@contexts/UserContext';
import Master from '@components/Layout/Master';
import NexiventFeed from '../components/Feed/components/NexiventFeed';

const Page: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useUser();
  const [shouldRenderFeed, setShouldRenderFeed] = useState(false);

  useEffect(() => {
    if (loading) {
      setShouldRenderFeed(false);
      return;
    }

    if (user) {
      const isOrganizer =
        user.tipo_documento === 'RUC_PERSONA' || user.tipo_documento === 'RUC_EMPRESA';
      const isAdmin = user.rol_principal === 'ADMINISTRADOR';

      if (isAdmin) {
        console.log('✅ Administrador detectado, redirigiendo a /admin');
        setShouldRenderFeed(false);
        router.replace('/administrator');
        return;
      }

      if (isOrganizer) {
        console.log('✅ Organizador detectado, redirigiendo a /organizer');
        setShouldRenderFeed(false);
        router.replace('/organizer');
        return;
      }
    }

    setShouldRenderFeed(true);
  }, [loading, user, router]);

  if (
    loading ||
    (user &&
      (user.tipo_documento === 'RUC_PERSONA' ||
        user.tipo_documento === 'RUC_EMPRESA' ||
        user.rol_principal === 'ADMINISTRADOR'))
  ) {
    return (
      <Master>
        <div className='flex items-center justify-center min-h-screen bg-black'>
          <div className='text-center'>
            <div className='text-white text-xl mb-4'>
              {loading ? 'Cargando...' : 'Redirigiendo a tu panel...'}
            </div>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto'></div>
          </div>
        </div>
      </Master>
    );
  }

  if (!shouldRenderFeed) {
    return (
      <Master>
        <div className='flex items-center justify-center min-h-screen bg-black'>
          <div className='text-white text-xl'>Preparando...</div>
        </div>
      </Master>
    );
  }

  return (
    <Master>
      <NexiventFeed />
    </Master>
  );
};

export default Page;
