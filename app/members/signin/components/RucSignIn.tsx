// app/members/signin/components/RucSignIn.tsx
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { rucLoginSchema } from '@components/Form/validationSchemas';
import { useUser } from '@contexts/UserContext';
import { useState } from 'react';

import Input from '@components/Form/Input';
import Button from '@components/Button/Button';

type FormInputs = z.infer<typeof rucLoginSchema>;

const RucSignInForm: React.FC = () => {
  const router = useRouter();
  const { setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    resolver: zodResolver(rucLoginSchema),
  });

  const onSubmit = async (data: FormInputs) => {
    setIsLoading(true);
    setError(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098';
      const response = await fetch(`${API_URL}/loginorg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ruc: data.ruc,
          contrasenha: data.password,
        }),
      });
      const result = await response.json();

      if (result.error) {
        // Cuenta no activa o deshabilitada
        if (result.error === 'ACCOUNT_NOT_ACTIVE') {
          setError(
            'Tu cuenta está pendiente de aprobación por un administrador. Recibirás un correo cuando sea activada.'
          );
        } else if (result.error === 'ACCOUNT_DISABLED') {
          setError('Tu cuenta ha sido deshabilitada. Por favor, contacta al soporte.');
        } else {
          setError(result.message || 'No tienes permiso para acceder');
        }
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        if (response.status === 403) {
          if (result.error === 'ACCOUNT_NOT_ACTIVE') {
            setError('Tu cuenta está pendiente de aprobación por un administrador.');
            alert('⏳ Cuenta pendiente de aprobación\n\n' + result.message);
          } else if (result.error === 'ACCOUNT_DISABLED') {
            setError('Tu cuenta ha sido deshabilitada. Contacta al soporte.');
            alert('❌ Cuenta deshabilitada\n\n' + result.message);
          } else {
            setError(result.message || 'No tienes permiso para acceder');
          }
        } else if (response.status === 400) {
          setError(result.message || 'Datos inválidos');
          alert('❌ ' + (result.message || 'Verifica que el RUC tenga 11 dígitos'));
        } else if (response.status === 401) {
          setError('RUC o contraseña incorrectos');
          alert('❌ Credenciales incorrectas\n\nVerifica tu RUC y contraseña');
        } else {
          setError(result.message || 'Error al iniciar sesión');
          alert('❌ Error: ' + (result.message || 'Error desconocido'));
        }
        setIsLoading(false);
        return;
      }

      if (response.ok && result.token) {
        // Guardar token y usuario en localStorage
        localStorage.setItem('auth_token', result.token.token);
        localStorage.setItem('user', JSON.stringify(result.usuario));

        // Actualizar contexto de usuario
        if (setUser) {
          setUser(result.usuario);
        }

        alert('¡Inicio de sesión exitoso!');
        router.push('/organizer');
      } else {
        setError(result.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      console.error('💥 [LOGIN] Error:', error);
      setError('Error al iniciar sesión');
      if (setUser) {
        setUser(null);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div
          style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}
      <div className='form-elements'>
        <Input label='RUC' type='text' error={errors.ruc?.message} {...register('ruc')} />
        <Input
          label='Contraseña'
          type='password'
          isPassword
          error={errors.password?.message}
          {...register('password')}
        />
        <div className='form-buttons'>
          <Button
            type='submit'
            text='Iniciar Sesión como Organizador'
            color='yellow-filled'
            disabled={isSubmitting}
          />
        </div>
      </div>
    </form>
  );
};

const RucSignIn: React.FC = () => {
  return (
    <div className='signin-container'>
      <RucSignInForm />
    </div>
  );
};

export default RucSignIn;
