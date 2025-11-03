'use client';

import { type FC } from 'react';

import { useUser } from '@contexts/UserContext';

import FormPhoto from './components/FormPhoto';
import FormMain from './components/FormMain';

const ProfileClient: FC = () => {
  const { user } = useUser();

  return (
    <>
      <div className='padding-top'>
        <FormPhoto />
      </div>

      <FormMain
        data={{
          name: user.nombre || 'Mario',
          lastname: user.apellido || 'Bros',
          email: user.correo || 'mariobros@gmail.com',
        }}
      />
    </>
  );
};

export default ProfileClient;
