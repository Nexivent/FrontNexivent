// app/members/signup/components/CompletionStep.tsx
import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { type PrefilledData } from './Form';

// components
import Input from '@components/Form/Input';
import Switch from '@components/Form/Switch';
import Button from '@components/Button/Button';
import Link from 'next/dist/client/link';
import GoogleSignIn from '../../signin/components/GoogleSignIn';
import PasswordConditions from '@components/Form/PasswordStrengthIndicator';
import { set } from 'zod';

interface IProps {
  prefilledData: PrefilledData;
  onGoBack: () => void;
  onGoogleSuccess: () => void;
  onVerificationNeeded: (data: { usuarioId: number; correo: string; nombre: string }) => void;
}

const CompletionStep: React.FC<IProps> = ({
  prefilledData,
  onGoBack,
  onGoogleSuccess,
  onVerificationNeeded,
}) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    trigger,
    setError,
    clearErrors,
  } = useFormContext();

  const [showErrors, setShowErrors] = useState(false);
  const tipoDoc = prefilledData.tipo_documento;
  const isDNI = tipoDoc === 'DNI';
  const isCE = tipoDoc === 'CE';
  const isRUC = tipoDoc === 'RUC_PERSONA' || tipoDoc === 'RUC_EMPRESA';
  const passwordValue = watch('contraseña') || '';
  const confirmPasswordValue = watch('confirmarContraseña') || '';
  const tosValue = watch('tos');

  const showGoogleOption = isDNI || isCE;

  useEffect(() => {
    setValue('nombre', prefilledData.nombre, { shouldValidate: true });
    setValue('tipo_documento', prefilledData.tipo_documento);
    setValue('ndocumento', prefilledData.ndocumento);
    setValue('tos', false);
  }, [prefilledData, setValue]);

  const handleGoogleAuth = async (response: any) => {
    try {
      console.log('Respuesta de Google recibida en CompletionStep:', response);
      // Asociar el documento validado con la cuenta de Google
      const googleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/google-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: response.userInfo.email,
          name: response.userInfo.name,
          picture: response.userInfo.picture,
          email_verified: response.userInfo.email_verified,
          sub: response.userInfo.sub,
          access_token: response.access_token,
          tipo_documento: prefilledData.tipo_documento,
          num_documento: prefilledData.ndocumento,
        }),
      });

      const result = await googleResponse.json();

      if (googleResponse.ok) {
        console.log('Google account associated successfully:', result);
        // Guardar token y redirigir
        localStorage.setItem('authToken', result.token.token);
        localStorage.setItem('tokenExpiry', result.token.expiry.toString());
        localStorage.setItem('user', JSON.stringify(result.usuario));
        // Si es nuevo usuario y no requiere verificación, ir directo al dashboard
        if (result.skip_verification) {
          onGoogleSuccess();
          window.location.href = '/';
        } else {
          // Usuario existente
          window.location.href = '/members/signin';
        }
      } else {
        console.error('Error associating Google account:', result);
        alert(result.message || 'Error al asociar cuenta de Google');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor');
    }
  };

  const onFinalSubmit = async (data: any) => {
    try {
      setShowErrors(true);

      // Validar correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!data.correo || !emailRegex.test(data.correo)) {
        setError('correo', {
          type: 'manual',
          message: 'Ingresa un correo electrónico válido',
        });
      }

      // Validar contraseña (mínimo 8 caracteres)
      if (!data.contraseña || data.contraseña.length < 8) {
        setError('contraseña', {
          type: 'manual',
          message: 'La contraseña debe tener al menos 8 caracteres',
        });
      }

      // Validar que las contraseñas coincidan
      if (data.contraseña !== data.confirmarContraseña) {
        setError('confirmarContraseña', {
          type: 'manual',
          message: 'Las contraseñas no coinciden',
        });
      }

      // Validar términos y condiciones
      if (!tosValue) {
        setError('tos', {
          type: 'manual',
          message: 'Debes aceptar los Términos y Condiciones',
        });
      }

      // Validar todos los campos
      const isValid = await trigger();

      if (!isValid || Object.keys(errors).length > 0) {
        // Forzar actualización después de un breve delay para asegurar que los errores se rendericen
        setTimeout(() => {
          const firstErrorField = Object.keys(errors)[0];
          const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return; // Detener el envío si hay errores
      }

      // Limpiar errores si todo está bien
      clearErrors();

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

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098';
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Respuesta del backend:', result);

      if (response.ok && result.requiere_verificacion && result.codigo_verificacion) {
        try {
          const emailResponse = await fetch('/api/UserAccount', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: result.usuario.correo,
              code: result.codigo_verificacion,
              nombre: result.usuario.nombre,
            }),
          });

          if (!emailResponse.ok) {
            throw new Error('Error al enviar el email');
          }

          // Guardar datos para verificación
          sessionStorage.setItem('verification_user_id', result.usuario.id);
          sessionStorage.setItem('verification_email', result.usuario.correo);
          sessionStorage.setItem('verification_code', result.codigo_verificacion);
          sessionStorage.setItem('verification_expiry', String(Date.now() + 15 * 60 * 1000));
          sessionStorage.setItem('verification_nombre', result.usuario.nombre);

          alert('Registro exitoso! Revisa tu correo para el código de verificación.');
          onVerificationNeeded({
            usuarioId: result.usuario.id,
            correo: result.usuario.correo,
            nombre: result.usuario.nombre,
          });
        } catch (emailError) {
          console.error('Error al enviar email:', emailError);
          alert('Usuario registrado pero hubo un error al enviar el email. Contacta soporte.');
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
                <GoogleSignIn mode='signup' onGoogleAuth={handleGoogleAuth} />
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
          <div style={{ position: 'relative' }}>
            <Input
              label='Correo electrónico'
              type='email'
              {...register('correo', {
                required: 'El correo electrónico es requerido',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Ingresa un correo electrónico válido',
                },
              })}
              error={
                showErrors && errors.correo?.message ? String(errors.correo.message) : undefined
              }
              style={{
                borderColor: showErrors && errors.correo ? '#c33' : undefined,
                borderWidth: showErrors && errors.correo ? '2px' : undefined,
              }}
            />
          </div>
          <Input label='Teléfono' type='tel' {...register('telefono')} />
          <div style={{ position: 'relative' }}>
            <Input
              label='Contraseña'
              type='password'
              isPassword
              {...register('contraseña', {
                required: 'La contraseña es requerida',
                minLength: {
                  value: 8,
                  message: 'La contraseña debe tener al menos 8 caracteres',
                },
              })}
              error={
                showErrors && errors.contraseña?.message
                  ? String(errors.contraseña.message)
                  : undefined
              }
              style={{
                borderColor: showErrors && errors.contraseña ? '#c33' : undefined,
                borderWidth: showErrors && errors.contraseña ? '2px' : undefined,
              }}
            />
          </div>
          <PasswordConditions password={passwordValue} />
          <div style={{ position: 'relative' }}>
            <Input
              label='Confirmar Contraseña'
              type='password'
              isPassword
              {...register('confirmarContraseña', {
                required: 'Debes confirmar tu contraseña',
                validate: (value) => value === passwordValue || 'Las contraseñas no coinciden',
              })}
              error={
                showErrors && errors.confirmarContraseña?.message
                  ? String(errors.confirmarContraseña.message)
                  : undefined
              }
              style={{
                borderColor: showErrors && errors.confirmarContraseña ? '#c33' : undefined,
                borderWidth: showErrors && errors.confirmarContraseña ? '2px' : undefined,
              }}
            />
          </div>
          <Controller
            name='tos'
            control={control}
            defaultValue={false}
            rules={{ required: 'Debes aceptar los Términos y Condiciones' }}
            render={({ field: { value, onChange, ref } }) => (
              <div
                style={{
                  border: showErrors && errors.tos ? '2px solid #c33' : 'none',
                  borderRadius: '8px',
                  padding: showErrors && errors.tos ? '8px' : '0',
                  backgroundColor:
                    showErrors && errors.tos ? 'rgba(204, 51, 51, 0.05)' : 'transparent',
                }}
              >
                <Switch
                  checked={value}
                  onChange={(e: any) => {
                    const newValue = typeof e === 'boolean' ? e : e?.target?.checked || false;
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
                {showErrors && errors.tos && (
                  <p
                    style={{
                      color: '#c33',
                      fontSize: '14px',
                      marginTop: '4px',
                      marginBottom: '0',
                    }}
                  >
                    {String(errors.tos.message)}
                  </p>
                )}
              </div>
            )}
          />

          <div className='form-buttons'>
            <Button
              type='button'
              text='Atrás'
              color='gray'
              onClick={onGoBack}
              disabled={isSubmitting}
            />
            <Button
              type='submit'
              color='yellow-filled'
              text={isSubmitting ? 'Registrando...' : 'Finalizar Registro'}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompletionStep;
