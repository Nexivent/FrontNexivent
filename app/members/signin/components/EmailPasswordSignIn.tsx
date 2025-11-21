// app/members/signin/components/EmailPasswordSignIn.tsx
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { emailLoginSchema } from '@components/Form/validationSchemas';
import api from '@utils/api';
import { useUser } from '@contexts/UserContext';

// Componentes
import Input from '@components/Form/Input';
import Button from '@components/Button/Button';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

type FormInputs = z.infer<typeof emailLoginSchema>;

const GoogleIcon = () => (
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
      ></path>
      <path
        fill='#4285F4'
        d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'
      ></path>
      <path
        fill='#FBBC05'
        d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'
      ></path>
      <path
        fill='#34A853'
        d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'
      ></path>
      <path fill='none' d='M0 0h48v48H0z'></path>
    </g>
  </svg>
);

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
      const response = await fetch('http://localhost:8098/login', {
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
        router.push('/');
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

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await api.post('/login/google', { accessToken: tokenResponse.access_token });
        window.location.href = '/';
      } catch (error) {
        console.error('Google login failed:', error);
      }
    },
    onError: () => {
      console.error('Google Login Failed');
    },
  });
  return (
    <>
      <div className='google-signin-container'>
        <button type='button' className='google-signin-button' onClick={() => handleGoogleLogin()}>
          <GoogleIcon />
          <span>Iniciar sesión con Google</span>
        </button>
      </div>
      {/*espacio para separar or-line de boton superior */}
      <div style={{ height: '40px' }}></div>
      <div className='or-line'>
        <hr />
      </div>
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
    </>
  );
};

const EmailPasswordSignIn: React.FC = () => (
  <GoogleOAuthProvider
    clientId={
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '357817738890-69lfoqffbuj9r3ku3bdtc1ah3no5jc6s.apps.googleusercontent.com'
    }
  >
    <EmailPasswordSignInForm />
  </GoogleOAuthProvider>
);

export default EmailPasswordSignIn;
