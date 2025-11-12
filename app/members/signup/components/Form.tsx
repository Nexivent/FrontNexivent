'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { registerSchema } from '@components/Form/validationSchemas';
import { DOCUMENTS_TYPES } from '@utils/Constants';
import api from '@utils/api';

import Link from 'next/link';

// hooks
import useAlert from '@hooks/useAlert';

// components
import Input from '@components/Form/Input';
import Switch from '@components/Form/Switch';
import Button from '@components/Button/Button';
import Loader from '@components/Loader/Loader';
import Select from '@components/Form/Select';

type RegisterFormData = z.infer<typeof registerSchema>;

const Form: React.FC = () => {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      nombre: '',
      ndocumento: '',
      telefono: '',
      correo: '',
      contraseña: '',
      tos: false,
    },
  });

  const watchedDocumentType = watch('tipo_documento');
  const currentDocRule = DOCUMENTS_TYPES.find((doc) => doc.value === watchedDocumentType);
  const docNumberMaxLength = currentDocRule ? currentDocRule.length : 12;
  const passwordValue = watch('contraseña', '');

  const passwordRequirements = useMemo(() => {
    return [
      { text: 'Al menos 8 caracteres', met: passwordValue.length >= 8 },
      { text: 'Al menos una mayúscula (A-Z)', met: /[A-Z]/.test(passwordValue) },
      { text: 'Al menos un número (0-9)', met: /[0-9]/.test(passwordValue) },
      { text: 'Al menos un carácter especial (!@#$...)', met: /[^A-Za-z0-9]/.test(passwordValue) },
    ];
  }, [passwordValue]);

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      await api.post('/api/auth/register', data);

      showAlert({ type: 'success', text: '¡Registro exitoso! Por favor, inicia sesión.' });
      router.push('/members/signin');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Ocurrió un error inesperado.';
      setApiError(errorMessage);
      showAlert({ type: 'error', text: errorMessage });
    }
  };

  if (isSubmitting) {
    return <Loader type='inline' color='gray' text='Creando cuenta...' />;
  }

  return (
    <form className='form shrink' noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className='form-elements'>
        {/*SVG de Google*/}
        <div className='form-line'>
          <div className='one-line'>
            <button type='button' className='google-button'>
              <svg
                version='1.1'
                xmlns='http://www.w3.org/2000/svg'
                width='18px'
                height='18px'
                viewBox='0 0 48 48'
              >
                <g>
                  <path
                    fill='#EA4335'
                    d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'
                  />
                  <path
                    fill='#4285F4'
                    d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'
                  />
                  <path
                    fill='#FBBC05'
                    d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'
                  />
                  <path
                    fill='#34A853'
                    d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'
                  />
                  <path fill='none' d='M0 0h48v48H0z' />
                </g>
              </svg>
              <span>Ingresa con Google</span>
            </button>
          </div>
        </div>
        <div className='or-line'>
          <hr />
        </div>
        {/*Campo nombre*/}
        <div className='form-line'>
          <div className='one-line'>
            <Input
              label='Nombre'
              type='text'
              placeholder='Ingresa tu nombre'
              required
              error={errors.nombre?.message}
              {...register('nombre')}
            />
          </div>
        </div>
        {/*Campo documento*/}
        <div className='form-line' style={{ display: 'flex', gap: '1rem' }}>
          <div className='one-line' style={{ flex: 1 }}>
            <Select
              label='Tipo de Documento'
              options={DOCUMENTS_TYPES}
              error={errors.tipo_documento?.message}
              {...register('tipo_documento')}
            />
          </div>
          <div className='one-line' style={{ flex: 2 }}>
            <Input
              label='N° de Documento'
              type='text'
              placeholder='12345678'
              required
              error={errors.ndocumento?.message}
              maxLength={docNumberMaxLength}
              {...register('ndocumento')}
            />
          </div>
        </div>
        {/*Campo teléfono*/}
        <div className='form-line'>
          <div className='one-line'>
            <Input
              label='Teléfono'
              type='tel'
              placeholder='987654321'
              required
              error={errors.telefono?.message}
              {...register('telefono')}
            />
          </div>
        </div>
        {/*Campo correo electrónico*/}
        <div className='form-line'>
          <div className='one-line'>
            <Input
              label='Correo electrónico'
              type='email'
              placeholder='Ingresa tu correo electrónico'
              required
              error={errors.correo?.message}
              {...register('correo')}
            />
          </div>
        </div>
        {/*Campo contraseña*/}
        <div className='form-line'>
          <Input
            label='Contraseña'
            isPassword
            placeholder='Ingresa tu contraseña'
            required
            {...register('contraseña')}
          />
          <div className='password-requirements'>
            {passwordRequirements.map((req, index) => (
              <p key={index} style={{ color: req.met ? 'green' : '#888', fontSize: '0.95rem' }}>
                {req.met ? '✓' : '○'} {req.text}
              </p>
            ))}
          </div>
        </div>
        {/*Campo confirmar contraseña*/}
        <div className='form-line'>
          <Input
            label='Confirmar Contraseña'
            isPassword
            placeholder='Vuelve a escribir tu contraseña'
            error={errors.confirmarContraseña?.message}
            {...register('confirmarContraseña')}
          />
        </div>
        {/*Checkbox TOS*/}
        <div className='form-line'>
          <div className='label-line'>
            <label htmlFor='tos'>Términos y Condiciones</label>
          </div>
          <Controller
            name='tos'
            control={control}
            render={({ field }) => (
              <Switch
                color='blue'
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                name={''}
              >
                Acepto la{' '}
                <Link href='/legal/privacy-policy' className='blue'>
                  Política de privacidad
                </Link>{' '}
                y{' '}
                <Link href='/legal/terms-of-service' className='blue'>
                  Términos de servicio
                </Link>
              </Switch>
            )}
          />
        </div>
        {apiError && <p className='form-error api-error'>{apiError}</p>}
        <div className='form-buttons'>
          <Button type='submit' color='yellow-filled' text='Registrarse' disabled={isSubmitting} />
        </div>
      </div>
    </form>
  );
};

export default Form;
