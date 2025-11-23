// app/members/signin/components/RucSignIn.tsx
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { set, z } from 'zod';
import { rucLoginSchema } from '@components/Form/validationSchemas';
import api from '@utils/api';
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
      const response = await fetch('http://localhost:8098/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: data.ruc,
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
      console.error('Error al iniciar sesión como organizador:', error);
      if (setUser) {
        setUser(null);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
