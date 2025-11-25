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
      console.log('🔐 [LOGIN] Iniciando proceso de login...');
      console.log('📧 [LOGIN] Email ingresado:', data.email);
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
      console.log('📥 [LOGIN] Response status:', response.status);
      const result = await response.json();
      console.log('📦 [LOGIN] Response completa:', result);
      if (response.ok && result.token) {
        console.log('✅ [LOGIN] Autenticación exitosa');
        console.log('👤 [LOGIN] Usuario recibido:', result.usuario);
        console.log('🎭 [LOGIN] Rol principal:', result.usuario.rol_principal);
        console.log('🔑 [LOGIN] Token generado:', result.token.token.substring(0, 20) + '...');
        // Guardar token y usuario en localStorage
        localStorage.setItem('auth_token', result.token.token);
        localStorage.setItem('user', JSON.stringify(result.usuario));
        console.log('💾 [LOGIN] Datos guardados en localStorage');
        // Actualizar contexto de usuario
        if (setUser) {
          setUser(result.usuario);
          console.log('🔄 [LOGIN] Contexto de usuario actualizado');
        }

        const rolPrincipal = result.usuario.rol_principal?.toUpperCase();
        console.log('🎯 [LOGIN] Rol principal normalizado:', rolPrincipal);

        if (rolPrincipal === 'ADMINISTRADOR') {
          console.log('🔴 [LOGIN] Usuario es ADMINISTRADOR - Redirigiendo a /administrator');
          alert('¡Bienvenido Administrador!');
          router.push('/administrator');
        } else {
          console.log('🟢 [LOGIN] Usuario es CLIENTE/ORGANIZADOR - Redirigiendo a /');
          alert('¡Inicio de sesión exitoso!');
          router.push('/');
        }
      } else {
        console.error('❌ [LOGIN] Error en respuesta:', result);
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
