// app/members/signup/components/CompletionStep.tsx
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { type PrefilledData } from './Form';
import api from '@utils/api';

// components
import Input from '@components/Form/Input';
import Switch from '@components/Form/Switch';
import Button from '@components/Button/Button';
import Link from 'next/dist/client/link';

interface IProps {
  prefilledData: PrefilledData;
  onGoBack: () => void;
}

const CompletionStep: React.FC<IProps> = ({ prefilledData, onGoBack }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useFormContext();
  const isRuc = prefilledData.tipo_documento === '06';

  useEffect(() => {
    setValue('nombre', prefilledData.nombre, { shouldValidate: true });
    setValue('tipo_documento', prefilledData.tipo_documento);
    setValue('ndocumento', prefilledData.ndocumento);
  }, [prefilledData, setValue]);

  const onFinalSubmit = async (data: any) => {
    try {
      await api.post('/api/auth/register', data);
      alert('¡Registro exitoso!');
      window.location.href = '/members/signin';
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al registrar el usuario.');
    }
  };

  return (
    <div className='registration-step-container'>
      <form onSubmit={handleSubmit(onFinalSubmit)} className='form shrink'>
        <div className='form-elements'>
          <button type='button' onClick={onGoBack} style={{ marginBottom: '20px' }}>
            &larr; Volver
          </button>

          <Input label='Nombre / Razón Social' {...register('nombre')} disabled />

          {!isRuc && (
            <div className='form-line'>
              <button type='button' className='google-button'>
                <span>Continuar con Google</span>
              </button>
              <div className='or-line'>
                <hr />
              </div>
            </div>
          )}

          <p>
            {isRuc
              ? 'Completa los datos de tu empresa para continuar.'
              : 'O completa tus datos manualmente.'}
          </p>

          <Input
            label='Correo electrónico'
            type='email'
            error={errors.correo?.message}
            {...register('correo')}
          />
          <Input
            label='Teléfono'
            type='tel'
            error={errors.telefono?.message}
            {...register('telefono')}
          />
          <Input
            label='Contraseña'
            type='password'
            isPassword
            error={errors.contraseña?.message}
            {...register('contraseña')}
          />
          <Input
            label='Confirmar Contraseña'
            type='password'
            isPassword
            error={errors.confirmarContraseña?.message}
            {...register('confirmarContraseña')}
          />
          <Controller
            name='tos'
            control={control}
            render={({ field }) => (
              <Switch {...field} checked={field.value} error={errors.tos?.message}>
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

          <div className='form-buttons'>
            <Button
              type='submit'
              color='yellow-filled'
              text='Finalizar Registro'
              disabled={isSubmitting}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompletionStep;
