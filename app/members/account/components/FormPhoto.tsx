'use client';

import { useState } from 'react';
import { useUser } from '@contexts/UserContext';
import useAlert from '@hooks/useAlert';
import Loader from '@components/Loader/Loader';
import ProfilePhoto from '@components/Profile/ProfilePhoto';
import Request, { type IRequest, type IResponse } from '@utils/Request';

const FormPhoto: React.FC = () => {
  const { user, setUser } = useUser();
  const { showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    hideAlert();
    setLoading(true);

    try {
      // Simulación de upload — reemplaza esto con tu endpoint real
      const newPhotoUrl = URL.createObjectURL(file);
      setUser({ ...user, foto: newPhotoUrl });

      showAlert({ type: 'success', text: 'Foto de perfil actualizada!' });
    } catch {
      showAlert({ type: 'error', text: 'Error al actualizar la foto.' });
    }

    setLoading(false);
  };

  if (loading) {
    return <Loader type='inline' color='gray' text='Cargando...' />;
  }

  return (
    <form noValidate>
      <div className='upload-picture text-center'>
        <input
          type='file'
          name='image'
          id='image'
          className='input-file'
          accept='.jpg,.jpeg,.png'
          onChange={handlePhotoChange}
        />
        <label htmlFor='image'>
          <span className='material-symbols-outlined'>edit</span>
        </label>
        <ProfilePhoto image={user.foto || '/default-avatar.jpg'} size='large' />
      </div>
    </form>
  );
};

export default FormPhoto;
