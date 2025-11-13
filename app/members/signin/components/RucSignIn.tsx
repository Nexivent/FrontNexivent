// app/members/signin/components/RucSignIn.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { rucLoginSchema } from '@components/Form/validationSchemas';
import api from '@utils/api';

import Input from '@components/Form/Input';
import Button from '@components/Button/Button';

type FormInputs = z.infer<typeof rucLoginSchema>;

const RucSignIn: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    resolver: zodResolver(rucLoginSchema),
  });

  const onSubmit = async (data: FormInputs) => {
    try {
      await api.post('/api/auth/login', {
        identifier: data.ruc,
        password: data.password,
      });
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error al iniciar sesión como organizador:', error);
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

export default RucSignIn;
