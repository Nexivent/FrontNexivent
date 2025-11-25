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

type FormInputs = z.infer<typeof emailLoginSchema>;

const EmailPasswordSignInForm: React.FC = () => {
  const { setUser } = useUser();
  const router = useRouter();

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
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: data.email,
          contrasenha: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.token) {
        // Guardar token y usuario en localStorage
        localStorage.setItem('auth_token', result.token.token);
        localStorage.setItem('user', JSON.stringify(result.usuario));

        // Actualizar contexto de usuario
        if (setUser) {
          setUser(result.usuario);
        }

        alert('¡Inicio de sesión exitoso!');
        if (result.usuario.rol_principal === 'ADMINISTRADOR') {
          router.push('/administrator');
        } else {
          router.push('/');
        }
      } else {
        throw new Error(result.message || 'Credenciales incorrectas');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      alert(error.message || 'Error al iniciar sesión');
      if (setUser) {
        setUser(null);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
