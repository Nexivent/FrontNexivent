'use client';

import { useUser } from '@contexts/UserContext';
import FormPhoto from './components/FormPhoto';
import FormMain from './components/FormMain';

export default function ProfileClient() {
  const { user, setUser } = useUser();

  const handlePhotoChange = (newPhotoUrl: string) => {
    setUser({ ...user, foto: newPhotoUrl });
  };

  return (
    <>
      {/* 🔹 Foto dinámica */}
      <div className='padding-top'>
        <FormPhoto />
      </div>

      {/* 🔹 Datos dinámicos */}
      <FormMain
        data={{
          name: user.nombre || 'Mario',
          lastname: user.apellido || 'Bros',
          email: user.correo || 'mariobros@gmail.com',
        }}
      />
    </>
  );
}
