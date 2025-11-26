'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@contexts/UserContext';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import Button from '@components/Button/Button';
import Loader from '@components/Loader/Loader';

// hooks
import useAlert from '@hooks/useAlert';

interface ReservationData {
  orderId: string;
  estado: string;
  remainingSeconds: number;
  expiresAt: number;
  purchaseData: {
    event: {
      idEvento: number;
      titulo: string;
      lugar: string;
    };
    tickets: Array<{
      id: number;
      name: string;
      price: string;
      quantity: number;
    }>;
    fecha: {
      fecha: string;
      horaInicio: string;
    };
    entradas?: Array<{
      idTarifa: number;
      idSector: number;
      idPerfil: number;
      idTipoTicket: number;
      cantidad: number;
      precio: number;
      nombreZona: string;
    }>;
  };
  cuponAplicado?: {
    id: number;
    codigo: string;
    tipo: number;
    valor: number;
    cantUsadaPorElUsuario: number;
  } | null;
}

type PaymentMethod = 'card' | 'yape' | null;

const Page: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const { showAlert, hideAlert } = useAlert();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reservationData, setReservationData] = useState<ReservationData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  useEffect(() => {
    const storedData = sessionStorage.getItem('reservationData');
    
    if (!storedData) {
      console.log('No reservation data found, redirecting to home');
      router.push('/');
      return;
    }

    try {
      const data: ReservationData = JSON.parse(storedData);
      console.log('Reservation data loaded:', data);
      
      if (!data.orderId || !data.purchaseData) {
        console.error('Invalid reservation data structure:', data);
        router.push('/');
        return;
      }

      const remaining = Math.floor((data.expiresAt - Date.now()) / 1000);
      
      if (remaining <= 0) {
        showAlert({ 
          type: 'error', 
          text: 'Tu reserva ha expirado. Por favor, intenta nuevamente.' 
        });
        setTimeout(() => router.push('/'), 2000);
        return;
      }

      setReservationData(data);
      setTimeRemaining(remaining);
      setLoading(false);
    } catch (error) {
      console.error('Error parsing reservation data:', error);
      router.push('/');
    }
  }, [router, showAlert]);

  useEffect(() => {
    if (!reservationData || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        if (newTime <= 0) {
          showAlert({ 
            type: 'error', 
            text: 'Tu reserva ha expirado.' 
          });
          setTimeout(() => router.push('/'), 2000);
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reservationData, timeRemaining, router, showAlert]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 16) {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCardExpiry(value);
    }
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCardCVV(value);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      showAlert({ 
        type: 'error', 
        text: 'Por favor selecciona un método de pago.' 
      });
      return;
    }

    if (selectedMethod === 'card') {
      if (!cardNumber || !cardName || !cardExpiry || !cardCVV) {
        showAlert({ 
          type: 'error', 
          text: 'Por favor completa todos los campos de la tarjeta.' 
        });
        return;
      }
      
      if (cardNumber.length !== 16) {
        showAlert({ 
          type: 'error', 
          text: 'El número de tarjeta debe tener 16 dígitos.' 
        });
        return;
      }
      
      if (cardExpiry.length !== 4) {
        showAlert({ 
          type: 'error', 
          text: 'La fecha de expiración debe tener formato MM/YY.' 
        });
        return;
      }
      
      if (cardCVV.length !== 3) {
        showAlert({ 
          type: 'error', 
          text: 'El CVV debe tener 3 dígitos.' 
        });
        return;
      }
    }

    if (!reservationData) return;

    setSubmitting(true);
    hideAlert();

    try {
      const paymentMethodId = selectedMethod === 'card' ? '1' : '2';
      
      console.log('PAYMENT: Método seleccionado:', selectedMethod);
      console.log('PAYMENT: Payment ID a enviar:', paymentMethodId);

      if (reservationData.cuponAplicado && user?.id) {
        try {
          console.log('CUPON: Registrando uso del cupón...');
          
          const cuponPayload = {
            cuponId: reservationData.cuponAplicado.id,
            usuarioId: parseInt(user.id),
            cantUsada: reservationData.cuponAplicado.cantUsadaPorElUsuario + 1
          };

          console.log('API: Enviando a /cupon/usuario:', cuponPayload);

          const cuponResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098'}/cupon/usuario`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(cuponPayload),
            }
          );

          if (!cuponResponse.ok) {
            const errorData = await cuponResponse.json();
            console.warn('WARNING: Error al registrar cupón:', errorData);
          } else {
            const cuponResult = await cuponResponse.json();
            console.log('SUCCESS: Cupón registrado:', cuponResult);
          }
        } catch (cuponError) {
          console.error('ERROR: Error al registrar cupón:', cuponError);
        }
      }

      console.log('API: Confirmando orden:', reservationData.orderId);

      const confirmResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098'}/orden_de_compra/${reservationData.orderId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId: paymentMethodId,
            idEvento: reservationData.purchaseData.event.idEvento,
            fechaEvento: reservationData.purchaseData.fecha.fecha,
          }),
        }
      );

      console.log('INFO: Payload enviado:', {
        paymentId: paymentMethodId,
        idEvento: reservationData.purchaseData.event.idEvento,
        fechaEvento: reservationData.purchaseData.fecha.fecha,
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.message || 'Error al confirmar la orden');
      }

      const confirmData = await confirmResponse.json();
      console.log('SUCCESS: Orden confirmada:', confirmData);

      sessionStorage.setItem('confirmedOrder', JSON.stringify({
        orderId: reservationData.orderId,
        estado: 'CONFIRMADA',
        purchaseData: reservationData.purchaseData,
        paymentMethod: selectedMethod,
        paymentMethodId: paymentMethodId,
        timestamp: Date.now(),
        cuponUsado: reservationData.cuponAplicado || null,
      }));

      console.log('CLEANUP: Limpiando sessionStorage...');
      sessionStorage.removeItem('purchaseData');
      sessionStorage.removeItem('reservationData');
      sessionStorage.removeItem('ticketsData');
      console.log('SUCCESS: SessionStorage limpio');

      router.push('/buy/success');

    } catch (error) {
      console.error('ERROR: Error en el proceso de pago:', error);
      
      setSubmitting(false);
      
      showAlert({ 
        type: 'error', 
        text: error instanceof Error 
          ? error.message 
          : 'Error al procesar el pago. Por favor, intenta nuevamente.' 
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <Master>
        <Section className='gray-background hero-offset'>
          <div className='container'>
            <Loader type='inline' color='gray' text='Cargando...' />
          </div>
        </Section>
      </Master>
    );
  }

  if (!reservationData) {
    return null;
  }

  return (
    <Master>
      <Section className='gray-background hero-offset'>
        <div className='container'>
          <div className='checkout-container'>
            <div className='checkout-header'>
              <button onClick={handleBack} className='back-button'>
                <span className='material-symbols-outlined'>arrow_back</span>
                Volver
              </button>
            </div>

            <Heading type={1} color='white' text='Método de pago' />

            <div className='timer-box'>
              <span className='material-symbols-outlined'>schedule</span>
              <span>Tiempo restante: <strong>{formatTime(timeRemaining)}</strong></span>
            </div>

            <div className='payment-methods'>
              <p className='payment-label'>Selecciona tu método de pago:</p>

              <button
                className={`payment-option ${selectedMethod === 'card' ? 'selected' : ''}`}
                onClick={() => setSelectedMethod('card')}
                disabled={submitting}
              >
                <div className='payment-radio'>
                  <span className='radio-outer'>
                    {selectedMethod === 'card' && <span className='radio-inner' />}
                  </span>
                </div>
                <span className='material-symbols-outlined payment-icon'>credit_card</span>
                <span className='payment-text'>Visa / Mastercard</span>
              </button>

              {selectedMethod === 'card' && (
                <div className='payment-form card-form'>
                  <div className='form-group'>
                    <label htmlFor='cardNumber'>Número de tarjeta</label>
                    <input
                      id='cardNumber'
                      type='text'
                      placeholder='1234 5678 9012 3456'
                      value={formatCardNumber(cardNumber)}
                      onChange={handleCardNumberChange}
                      disabled={submitting}
                      maxLength={19}
                    />
                  </div>

                  <div className='form-group'>
                    <label htmlFor='cardName'>Nombre en la tarjeta</label>
                    <input
                      id='cardName'
                      type='text'
                      placeholder='JUAN GARCIA'
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      disabled={submitting}
                    />
                  </div>

                  <div className='form-row'>
                    <div className='form-group'>
                      <label htmlFor='cardExpiry'>Fecha de expiración</label>
                      <input
                        id='cardExpiry'
                        type='text'
                        placeholder='MM/YY'
                        value={formatExpiry(cardExpiry)}
                        onChange={handleExpiryChange}
                        disabled={submitting}
                        maxLength={5}
                      />
                    </div>

                    <div className='form-group'>
                      <label htmlFor='cardCVV'>CVV</label>
                      <input
                        id='cardCVV'
                        type='text'
                        placeholder='123'
                        value={cardCVV}
                        onChange={handleCVVChange}
                        disabled={submitting}
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div className='payment-info'>
                    <span className='material-symbols-outlined'>lock</span>
                    <span>Tus datos están protegidos</span>
                  </div>
                </div>
              )}

              <button
                className={`payment-option ${selectedMethod === 'yape' ? 'selected' : ''}`}
                onClick={() => setSelectedMethod('yape')}
                disabled={submitting}
              >
                <div className='payment-radio'>
                  <span className='radio-outer'>
                    {selectedMethod === 'yape' && <span className='radio-inner' />}
                  </span>
                </div>
                <span className='material-symbols-outlined payment-icon'>smartphone</span>
                <span className='payment-text'>Yape</span>
              </button>

              {selectedMethod === 'yape' && (
                <div className='payment-form yape-form'>
                  <div className='yape-instructions'>
                    <p>Escanea el código QR con tu app de Yape:</p>
                  </div>
                  <div className='yape-qr-container'>
                    <img 
                      src='https://nexivent-multimedia.s3.us-east-2.amazonaws.com/yape.jpg' 
                      alt='QR de Yape' 
                      className='yape-qr'
                    />
                  </div>
                  <div className='payment-info'>
                    <span className='material-symbols-outlined'>info</span>
                    <span>Después de yapear, presiona &quot;Pagar&quot; para confirmar tu compra</span>
                  </div>
                </div>
              )}
            </div>

            <div className='form-buttons'>
              <Button
                type='button'
                color={submitting || !selectedMethod ? 'disabled' : 'yellow-filled'}
                text={submitting ? 'Procesando pago...' : 'Pagar'}
                onClick={handlePayment}
                disabled={submitting || !selectedMethod}
              />
            </div>

            {submitting && (
              <div className='processing-info'>
                <Loader type='inline' color='gray' text='Procesando tu pago, por favor espera...' />
              </div>
            )}
          </div>
        </div>
      </Section>

      <style jsx>{`
        .checkout-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 2rem 0;
        }

        .checkout-header {
          margin-bottom: 2rem;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          color: #999;
          font-size: 1rem;
          cursor: pointer;
          transition: color 0.3s ease;
          padding: 0;
        }

        .back-button:hover {
          color: #cddc39;
        }

        .back-button .material-symbols-outlined {
          font-size: 1.2rem;
        }

        .timer-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          background: rgba(205, 220, 57, 0.1);
          border: 2px solid #cddc39;
          border-radius: 8px;
          padding: 1rem;
          margin: 2rem 0;
          color: #cddc39;
          font-size: 1.1rem;
        }

        .timer-box .material-symbols-outlined {
          font-size: 1.5rem;
        }

        .timer-box strong {
          font-size: 1.3rem;
          font-weight: 700;
        }

        .payment-methods {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 2rem;
          margin: 2rem 0;
        }

        .payment-label {
          color: #999;
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .payment-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
          background: #000;
          border: 2px solid #333;
          border-radius: 8px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #fff;
          font-size: 1rem;
        }

        .payment-option:hover:not(:disabled) {
          border-color: #cddc39;
          background: rgba(205, 220, 57, 0.05);
        }

        .payment-option.selected {
          border-color: #cddc39;
          background: rgba(205, 220, 57, 0.1);
        }

        .payment-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .payment-radio {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .radio-outer {
          width: 20px;
          height: 20px;
          border: 2px solid #999;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.3s ease;
        }

        .payment-option.selected .radio-outer {
          border-color: #cddc39;
        }

        .radio-inner {
          width: 10px;
          height: 10px;
          background: #cddc39;
          border-radius: 50%;
        }

        .payment-icon {
          font-size: 1.5rem;
          color: #999;
        }

        .payment-option.selected .payment-icon {
          color: #cddc39;
        }

        .payment-text {
          flex: 1;
          text-align: left;
          font-weight: 500;
        }

        .payment-form {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background: #000;
          border: 1px solid #333;
          border-radius: 8px;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card-form .form-group {
          margin-bottom: 1.25rem;
        }

        .card-form .form-group:last-of-type {
          margin-bottom: 0;
        }

        .card-form label {
          display: block;
          color: #999;
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .card-form input {
          width: 100%;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 0.875rem;
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s ease;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.5px;
        }

        .card-form input:focus {
          outline: none;
          border-color: #cddc39;
          background: rgba(205, 220, 57, 0.05);
        }

        .card-form input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .card-form input::placeholder {
          color: #555;
        }

        .form-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
        }

        .yape-form {
          text-align: center;
        }

        .yape-instructions {
          margin-bottom: 1.5rem;
        }

        .yape-instructions p {
          color: #999;
          font-size: 0.95rem;
        }

        .yape-qr-container {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .yape-qr {
          max-width: 300px;
          width: 100%;
          height: auto;
          border-radius: 8px;
          border: 2px solid #333;
        }

        .payment-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #333;
          color: #999;
          font-size: 0.85rem;
        }

        .payment-info .material-symbols-outlined {
          font-size: 1rem;
          color: #cddc39;
        }

        .form-buttons {
          margin-top: 2rem;
        }

        .processing-info {
          margin-top: 2rem;
          text-align: center;
        }

        @media (max-width: 768px) {
          .checkout-container {
            padding: 1rem;
          }

          .payment-methods {
            padding: 1.5rem;
          }

          .payment-option {
            padding: 1rem;
          }

          .payment-form {
            padding: 1rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .yape-qr {
            max-width: 250px;
          }
        }
      `}</style>
    </Master>
  );
};

export default Page;