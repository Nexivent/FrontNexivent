'use client';

import { useUser } from '@contexts/UserContext';
import FormPhoto from './components/FormPhoto';
import FormMain from './components/FormMain';
import { useEffect, useState } from 'react';

const ProfileClient: React.FC = () => {
  const { user } = useUser();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData({
        name: parsedUser.nombre || '',
        email: parsedUser.correo || '',
        phoneNumber: parsedUser.telefono || '',
      });
    } else if (user) {
      setUserData({
        name: user.nombre || '',
        email: user.correo || '',
        phoneNumber: user.telefono || '',
      });
    }
  }, [user]);

  return (
    <>
      {/* 🔹 Foto dinámica */}
      <div className='padding-top'>
        <FormPhoto />
      </div>

      {/* 🔹 Datos dinámicos */}
      <FormMain data={userData} />
    </>
  );
};

export default ProfileClient;
