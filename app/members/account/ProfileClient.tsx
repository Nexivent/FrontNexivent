'use client';

import { useUser } from '@contexts/UserContext';
import FormPhoto from './components/FormPhoto';
import FormMain from './components/FormMain';

const ProfileClient: React.FC = () => {
  const { user } = useUser();

  return (
    <>
      {/* 🔹 Foto dinámica */}
      <div className='padding-top'>
        <FormPhoto />
      </div>

      {/* 🔹 Datos dinámicos */}
      <FormMain
        data={{
          name: user?.nombre || 'Mario',
          lastname: user?.nombre || 'Bros',
          email: user?.email || 'mariobros@gmail.com',
        }}
      />
    </>
  );
};

export default ProfileClient;
