'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  };
}

type PaymentMethod = 'card' | 'yape' | null;

const Page: React.FC = () => {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reservationData, setReservationData] = useState<ReservationData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

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

  // Contador de tiempo
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

  const handlePayment = async () => {
    if (!selectedMethod) {
      showAlert({ 
        type: 'error', 
        text: 'Por favor selecciona un método de pago.' 
      });
      return;
    }

    if (!reservationData) return;

    setSubmitting(true);

    // ========================================================
    // SIMULACIÓN (sin backend)
    // Para probar con las APIs, cambiar USE_SIMULATION a false
    // =========================================================
    const USE_SIMULATION = true; // ← Cambiar a false cuando tengas el backend

    if (USE_SIMULATION) {
      try {
        console.log('🧪 Modo simulación activado');
        
        console.log('📡 Paso 1: Registrando intento de pago...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const intentData = {
          paymentId: 'PAY-' + Date.now(),
          estado: 'PENDIENTE',
          metodoPago: selectedMethod === 'card' ? 'TARJETA' : 'YAPE',
        };
        console.log('✅ Intento simulado:', intentData);

        console.log('📡 Paso 2: Confirmando orden...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const confirmData = {
          orderId: reservationData.orderId,
          estado: 'CONFIRMADA',
          message: 'Compra confirmada',
        };
        console.log('✅ Orden simulada confirmada:', confirmData);

        console.log('📡 Paso 3: Generando tickets...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // ⚠️ CORRECCIÓN: Generar tickets según la cantidad total con tipo explícito
        const allTickets: Array<{
          idTicket: string;
          codigoQR: string;
          estado: string;
          zona: string;
        }> = [];
        let ticketCounter = 1;
        
        // Por cada tipo de ticket, generar la cantidad especificada
        reservationData.purchaseData.tickets.forEach(ticketType => {
          for (let i = 0; i < ticketType.quantity; i++) {
            allTickets.push({
              idTicket: `TICKET-${String(ticketCounter).padStart(3, '0')}`,
              codigoQR: `QR-${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
              estado: 'Disponible',
              zona: ticketType.name,
            });
            ticketCounter++;
          }
        });
        
        const ticketsData = {
          tickets: allTickets, // ← Ahora tiene la cantidad correcta
          orderId: reservationData.orderId,
        };
        
        console.log(`✅ ${allTickets.length} tickets simulados generados:`, ticketsData);

        sessionStorage.setItem('ticketsData', JSON.stringify({
          tickets: ticketsData.tickets,
          orderId: reservationData.orderId,
          timestamp: Date.now(),
        }));

        sessionStorage.removeItem('purchaseData');
        sessionStorage.removeItem('reservationData');

        router.push('/buy/success');

      } catch (error) {
        console.error('❌ Error en simulación:', error);
        setSubmitting(false);
        showAlert({ 
          type: 'error', 
          text: 'Error en la simulación. Intenta nuevamente.' 
        });
      }
      return;
    }

    // =========
    // CON API 
    // =========
    try {
      // ==============================
      // Registrar intento de pago 
      // POST /api/payments/intent
      // ==============================
      console.log('📡 Paso 1: Registrando intento de pago...');
      
      const intentResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Si tienes autenticación:
            // 'Authorization': `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({
            orderId: reservationData.orderId,
            idMetodoPago: selectedMethod === 'card' ? 1 : 2, // Ajustar según tu BD
          }),
        }
      );

      if (!intentResponse.ok) {
        const errorData = await intentResponse.json();
        throw new Error(errorData.error || 'Error al registrar el intento de pago');
      }

      const intentData = await intentResponse.json();
      console.log('✅ Intento de pago registrado:', intentData);

      const paymentId = intentData.paymentId;

      // ===================================
      // Confirmar la orden
      // POST /api/orders/{orderId}/confirm
      // ===================================
      console.log('📡 Paso 2: Confirmando orden...');

      const confirmResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${reservationData.orderId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId: paymentId,
          }),
        }
      );

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        
        if (confirmResponse.status === 410 || confirmResponse.status === 402 || confirmResponse.status === 409) {
          throw new Error(errorData.error || 'Error al confirmar la orden');
        }
        
        throw new Error(errorData.error || 'Error al procesar el pago');
      }

      const confirmData = await confirmResponse.json();
      console.log('✅ Orden confirmada:', confirmData);

      // =======================
      // Generar tickets
      // POST /api/tickets/issue
      // ========================
      console.log('📡 Paso 3: Generando tickets...');

      const ticketsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/issue`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: reservationData.orderId,
          }),
        }
      );

      if (!ticketsResponse.ok) {
        const errorData = await ticketsResponse.json();
        throw new Error(errorData.error || 'Error al generar los tickets');
      }

      const ticketsData = await ticketsResponse.json();
      console.log('✅ Tickets generados:', ticketsData);

      // Guardar información de los tickets
      sessionStorage.setItem('ticketsData', JSON.stringify({
        tickets: ticketsData.tickets,
        orderId: reservationData.orderId,
        timestamp: Date.now(),
      }));

      // Limpiar datos de reserva
      sessionStorage.removeItem('purchaseData');
      sessionStorage.removeItem('reservationData');

      // Navegar a página de éxito
      router.push('/buy/success');

    } catch (error) {
      console.error('Error en el proceso de pago:', error);
      
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
            {/* Header con botón volver */}
            <div className='checkout-header'>
              <button onClick={handleBack} className='back-button'>
                <span className='material-symbols-outlined'>arrow_back</span>
                Volver
              </button>
            </div>

            {/* Título */}
            <Heading type={1} color='white' text='Método de pago' />

            {/* Contador de tiempo */}
            <div className='timer-box'>
              <span className='material-symbols-outlined'>schedule</span>
              <span>Tiempo restante: <strong>{formatTime(timeRemaining)}</strong></span>
            </div>

            {/* Métodos de pago */}
            <div className='payment-methods'>
              <p className='payment-label'>Selecciona tu método de pago:</p>

              {/* Tarjeta */}
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

              {/* Yape */}
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
            </div>

            {/* Botón de pagar */}
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
        }
      `}</style>
    </Master>
  );
};

export default Page;