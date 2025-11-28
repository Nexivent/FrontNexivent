'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';

// hooks
import useAlert from '@hooks/useAlert';

// components
import Input from '@components/Form/Input';
import Button from '@components/Button/Button';
import Loader from '@components/Loader/Loader';
import ButtonLink from '@components/Button/ButtonLink';

// utils
import Request, { type IRequest, type IResponse } from '@utils/Request';

// interfaces
interface IProps {
  data: {
    name: string;
    email: string;
    phoneNumber: string;
  };
}

interface IFormProps {
  name: string;
}

const FormMain: React.FC<IProps> = ({ data }) => {
  const { showAlert, hideAlert } = useAlert();

  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<IFormProps>({
    name: '',
  });

  // Sincronizar formValues cuando data cambie
  useEffect(() => {
    if (data.name) {
      setFormValues({
        name: data.name,
      });
    }
  }, [data]);

  /**
   * Handles the change event for input fields in the form.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  /**
   * Handles the form submission event.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   * @returns {Promise<any>}
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<any> => {
    e.preventDefault();

    hideAlert();

    setLoading(true);

    const parameters: IRequest = {
      url: 'v1/profile/update',
      method: 'POST',
      postData: {
        name: formValues.name,
      },
    };

    const req: IResponse = await Request.getResponse(parameters);

    const { status, data } = req;

    if (status === 200) {
      showAlert({ type: 'success', text: 'Perfil actualizado correctamente' });
    } else {
      showAlert({ type: 'error', text: data.title ?? 'Error al actualizar el perfil' });
    }

    setLoading(false);
  };

  if (loading) {
    return <Loader type='inline' color='gray' text='Actualizando perfil...' />;
  }

  return (
    <form
      className='form shrink'
      noValidate
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
    >
      <div className='form-elements'>
        <div className='form-line'>
          <div className='one-line'>
            <div className='label-line'>
              <label htmlFor='name'>Nombre completo</label>
            </div>
            <Input
              type='text'
              name='name'
              value={formValues.name}
              maxLength={128}
              placeholder='Ingresa tu nombre completo'
              required
              disabled
              onChange={handleChange}
            />
          </div>
        </div>
        <div className='form-line'>
          <div className='one-line'>
            <div className='label-line'>
              <label htmlFor='email'>Correo electrónico</label>
            </div>
            <Input
              type='email'
              name='email'
              value={data.email}
              maxLength={128}
              placeholder='Correo electrónico'
              required
              disabled
              onChange={() => {}}
            />
          </div>
        </div>
        <div className='form-line'>
          <div className='one-line'>
            <div className='label-line'>
              <label htmlFor='phoneNumber'>Teléfono</label>
            </div>
            <Input
              type='tel'
              name='phoneNumber'
              value={data.phoneNumber}
              maxLength={20}
              placeholder='Número de teléfono'
              required
              disabled
              onChange={() => {}}
            />
          </div>
        </div>
        <div className='form-line'>
          <div className='label-line flex flex-v-center flex-space-between'>
            <label htmlFor='password'>Contraseña</label>
            <Link href='/members/password' className='blue'>
              Cambiar contraseña
            </Link>
          </div>
        </div>
        <div className='form-buttons'>
          <ButtonLink color='yellow-overlay' text='Cerrar sesión' url='members/signout' />
          &nbsp; &nbsp;
          <Button type='submit' color='yellow-filled' text='Actualizar perfil' />
        </div>
      </div>
    </form>
  );
};

export default FormMain;
