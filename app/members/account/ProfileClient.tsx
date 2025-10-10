'use client';

import React from 'react';
import { useUser } from '@contexts/UserContext';
import FormMain from './components/FormMain';

const ProfileClient: React.FC = () => {
  const { user } = useUser();

  if (!user) return <p>Loading user data...</p>;

  return (
    <FormMain
      data={{
        name: user.nombre,
        lastname: user.apellido,
        email: user.correo,
      }}
    />
  );
};

export default ProfileClient;
