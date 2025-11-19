// app/members/signup/components/CompletionStep.tsx
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { type PrefilledData } from './Form';

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
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useFormContext();
  const isRuc = prefilledData.tipo_documento === '06';

  useEffect(() => {
    setValue('nombre', prefilledData.nombre, { shouldValidate: true });
    setValue('tipo_documento', prefilledData.tipo_documento);
    setValue('ndocumento', prefilledData.ndocumento);
  }, [prefilledData, setValue]);

  const onFinalSubmit = async (data: any) => {
    try {
      // Preparar datos para enviar al backend
      const payload = {
        nombre: data.nombre,
        tipo_documento: data.tipo_documento,
        num_documento: data.ndocumento,
        email: data.correo,
        contrasena: data.contraseña,
        telefono: data.telefono || null,
      };

      const response = await fetch('http://localhost:8098/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.token) {
        // Guardar token y usuario en localStorage
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.usuario));

        alert('¡Registro exitoso!');
        window.location.href = '/dashboards';
      } else {
        throw new Error(result.message || 'Error al registrar el usuario');
      }
    } catch (error: any) {
      alert(error.message || 'Error al registrar el usuario.');
      console.error('Error en registro:', error);
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

          <Input label='Correo electrónico' type='email' {...register('correo')} />
          <Input label='Teléfono' type='tel' {...register('telefono')} />
          <Input label='Contraseña' type='password' isPassword {...register('contraseña')} />
          <Input
            label='Confirmar Contraseña'
            type='password'
            isPassword
            {...register('confirmarContraseña')}
          />
          <Controller
            name='tos'
            control={control}
            render={({ field }) => (
              <Switch {...field} checked={field.value}>
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
