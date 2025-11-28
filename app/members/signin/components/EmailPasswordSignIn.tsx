// app/members/signin/components/EmailPasswordSignIn.tsx
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { emailLoginSchema } from '@components/Form/validationSchemas';
import { useUser } from '@contexts/UserContext';

// Componentes
import Input from '@components/Form/Input';
import Button from '@components/Button/Button';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useState } from 'react';

type FormInputs = z.infer<typeof emailLoginSchema>;

const EmailPasswordSignInForm: React.FC = () => {
  const { setUser } = useUser();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    resolver: zodResolver(emailLoginSchema),
  });

  const onSubmit = async (data: FormInputs) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098';
      const requestBody = {
        correo: data.email,
        contrasenha: data.password,
      };

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      // Manejar cuenta deshabilitada
      if (result.error === 'ACCOUNT_DISABLED') {
        setError(result.message || 'Tu cuenta ha sido deshabilitada. Contacta al soporte.');
        return;
      }

      if (response.ok && result.token) {
        localStorage.setItem('auth_token', result.token.token);
        localStorage.setItem('user', JSON.stringify(result.usuario));

        // Actualizar contexto
        if (setUser) {
          setUser(result.usuario);
        }

        // Determinar redirección
        const rolPrincipal = result.usuario.rol_principal;

        if (!rolPrincipal) {
          console.error('⚠️ [LOGIN] rol_principal es undefined o null');
        }

        if (rolPrincipal === 'ADMINISTRADOR') {
          alert('¡Bienvenido Administrador!');
          router.push('/administrator');
        } else {
          alert('¡Inicio de sesión exitoso!');
          router.push('/');
        }
      } else {
        console.error('❌ [LOGIN] Error en respuesta:', result);
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
        <Input
          label='Correo electrónico'
          type='email'
          error={errors.email?.message}
          {...register('email')}
        />
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
            text='Iniciar Sesión'
            color='yellow-filled'
            disabled={isSubmitting}
          />
        </div>
      </div>
    </form>
  );
};

const EmailPasswordSignIn: React.FC = () => (
  <GoogleOAuthProvider
    clientId={
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '357817738890-4psm8ecl33dpmjv8339m8duvcdg3adii.apps.googleusercontent.com'
    }
  >
    <EmailPasswordSignInForm />
  </GoogleOAuthProvider>
);

export default EmailPasswordSignIn;
