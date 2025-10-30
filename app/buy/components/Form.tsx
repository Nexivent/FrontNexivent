'use client';

import { useState } from 'react';

// hooks
import useAlert from '@hooks/useAlert';

// components
import Input from '@components/Form/Input';
import Button from '@components/Button/Button';
import Loader from '@components/Loader/Loader';
import Heading from '@components/Heading/Heading';

// utils
import Request, { type IRequest, type IResponse } from '@utils/Request';

// interfaces
interface IFormProps {
  name: string;
  email: string;
  cardCvc: string;
  cardName: string;
  cardNumber: string;
  cardExpiration: string;
}

const Form: React.FC = () => {
  const { showAlert, hideAlert } = useAlert();

  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<IFormProps>({
    name: '',
    email: '',
    cardCvc: '',
    cardName: '',
    cardNumber: '',
    cardExpiration: '',
  });

  /**
   * Handles changes to form input fields.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input change.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  /**
   * Handles form submission.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The event object from the form submission.
   * @return {Promise<any>} - The result of the form submission.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<any> => {
    e.preventDefault();

    hideAlert();

    setLoading(true);

    const parameters: IRequest = {
      url: 'v1/signin/password',
      method: 'POST',
      postData: {
        email: '',
        password: '',
      },
    };

    const req: IResponse = await Request.getResponse(parameters);

    const { status, data } = req;

    if (status === 200) {
      //
    } else {
      showAlert({ type: 'error', text: data.title ?? '' });
    }

    setLoading(false);
  };

  if (loading) {
    return <Loader type='inline' color='gray' text='Procesando tu pago...' />;
  }

  return (
    <form
      className='form shrink'
      noValidate
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
    >
      <div className='form-elements'>
        <div className='form-line padding-top'>
          <Heading type={5} color='gray' text='Información del comprador' />
        </div>
        <div className='form-line'>
          <div className='flex flex-v-center flex-space-between'>
            <div className='two-line'>
              <div className='label-line'>
                <label htmlFor='name'>Nombre</label>
              </div>
              <Input
                type='text'
                name='name'
                value={formValues.name}
                maxLength={48}
                placeholder='Ingresa tu nombre'
                required
                onChange={handleChange}
              />
            </div>
            <div className='two-line'>
              <div className='label-line'>
                <label htmlFor='email'>Correo electrónico</label>
              </div>
              <Input
                type='email'
                name='email'
                value={formValues.email}
                maxLength={64}
                placeholder='Ingresa tu correo electrónico'
                required
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className='form-line padding-top'>
          <Heading type={5} color='gray' text='Detalles de pago' />
        </div>
        <div className='form-line'>
          <div className='flex flex-v-center flex-space-between'>
            <div className='two-line'>
              <div className='label-line'>
                <label htmlFor='cardName'>Nombre en la tarjeta</label>
              </div>
              <Input
                type='text'
                name='cardName'
                value={formValues.cardName}
                maxLength={48}
                placeholder='Nombre como aparece en la tarjeta'
                required
                onChange={handleChange}
              />
            </div>
            <div className='two-line'>
              <div className='label-line'>
                <label htmlFor='cardNumber'>Número de tarjeta</label>
              </div>
              <Input
                type='text'
                name='cardNumber'
                value={formValues.cardNumber}
                maxLength={16}
                placeholder='Ingresa el número de tarjeta'
                required
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className='form-line'>
          <div className='flex flex-v-center flex-space-between'>
            <div className='two-line'>
              <div className='label-line'>
                <label htmlFor='cardExpiration'>Fecha de expiración</label>
              </div>
              <Input
                type='text'
                name='cardExpiration'
                value={formValues.cardExpiration}
                maxLength={5}
                placeholder='MM/AA'
                required
                onChange={handleChange}
              />
            </div>
            <div className='two-line'>
              <div className='label-line'>
                <label htmlFor='cardCvc'>Código de seguridad (CVV)</label>
              </div>
              <Input
                type='text'
                name='cardCvc'
                value={formValues.cardCvc}
                maxLength={4}
                placeholder='CVV'
                required
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className='form-buttons'>
          <Button type='submit' color='blue-filled' text='Realizar pago y emitir tickets' />
        </div>
      </div>
    </form>
  );
};

export default Form;
