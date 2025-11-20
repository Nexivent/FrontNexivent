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
    watch,
    formState: { isSubmitting },
  } = useFormContext();
  const tipoDoc = prefilledData.tipo_documento;
  const isDNI = tipoDoc === 'DNI';
  const isCE = tipoDoc === 'CE';
  const isRUC = tipoDoc === 'RUC_PERSONA' || tipoDoc === 'RUC_EMPRESA';

  const showGoogleOption = isDNI || isCE;

  useEffect(() => {
    setValue('nombre', prefilledData.nombre, { shouldValidate: true });
    setValue('tipo_documento', prefilledData.tipo_documento);
    setValue('ndocumento', prefilledData.ndocumento);
    setValue('tos', false);
  }, [prefilledData, setValue]);

  const onFinalSubmit = async (data: any) => {
    try {
      console.log('Datos del formulario:', data); // Para debugging
      const tosValue = watch('tos');
      console.log('TOS value (watch):', tosValue);

      // Validar que se aceptaron los términos
      if (!tosValue) {
        alert('Debes aceptar los Términos y Condiciones para continuar');
        return;
      }

      // Validar que las contraseñas coincidan
      if (data.contraseña !== data.confirmarContraseña) {
        alert('Las contraseñas no coinciden');
        return;
      }

      // Preparar datos para enviar al backend
      const payload = {
        nombre: data.nombre.trim(),
        tipo_documento: prefilledData.tipo_documento,
        num_documento: prefilledData.ndocumento.trim(),
        correo: data.correo.trim(),
        contrasenha: data.contraseña,
        telefono: data.telefono ? data.telefono.trim() : '',
      };

      console.log('Enviando payload:', payload);

      const response = await fetch('http://localhost:8098/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Respuesta del backend:', result);

      if (response.ok) {
        // El backend retorna el token dentro de la respuesta
        if (result.token) {
          localStorage.setItem('auth_token', result.token.token);
          localStorage.setItem('user', JSON.stringify(result));

          alert('¡Registro exitoso!');
          window.location.href = '/dashboards';
        } else {
          alert('¡Registro exitoso! Por favor inicia sesión.');
          window.location.href = '/members/login';
        }
      } else {
        throw new Error(result.message || result.error || 'Error al registrar el usuario');
      }
    } catch (error: any) {
      console.error('Error completo en registro:', error);
      alert(error.message || 'Error al registrar el usuario.');
    }
  };

  return (
    <div className='registration-step-container'>
      <form onSubmit={handleSubmit(onFinalSubmit)} className='form shrink'>
        <div className='form-elements'>
          <Input label='Nombre / Razón Social' {...register('nombre')} disabled />
          {showGoogleOption && (
            <>
              <div className='form-line'>
                <div style={{ height: '3px' }}></div>
                <div className='or-line'>
                  <hr />
                </div>
                <button type='button' className='google-button'>
                  <span>Continuar con Google</span>
                </button>
                <div style={{ height: '30px' }}></div>
                <div className='or-line'>
                  <hr />
                </div>
              </div>
              <p style={{ marginTop: '-80px' }}>O completa tus datos manualmente.</p>
            </>
          )}
          {!showGoogleOption && (
            <p>
              {isRUC
                ? 'Completa los datos de tu empresa para continuar.'
                : 'Completa tus datos para continuar.'}
            </p>
          )}
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
            defaultValue={false}
            render={({ field: { value, onChange, ref } }) => (
              <Switch
                ref={ref}
                checked={value}
                onChange={(e: any) => {
                  const newValue = typeof e === 'boolean' ? e : e?.target?.checked || false;
                  console.log('Switch changed to:', newValue);
                  onChange(newValue);
                  setValue('tos', newValue, { shouldValidate: true });
                }}
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
