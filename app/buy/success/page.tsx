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

interface TicketInfo {
  idTicket: string;
  codigoQR: string;
  estado: string;
  zona?: string;
}

interface ConfirmedOrderData {
  orderId: string;
  estado: string;
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
      idFechaEvento: number;
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
  timestamp: number;
}

const Page: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  
  const [loading, setLoading] = useState(true);
  const [generatingTickets, setGeneratingTickets] = useState(true);
  const [tickets, setTickets] = useState<TicketInfo[]>([]);
  const [orderData, setOrderData] = useState<ConfirmedOrderData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  useEffect(() => {
    const initializeSuccess = async () => {
      const storedData = sessionStorage.getItem('confirmedOrder');

      if (!storedData) {
        console.error('No confirmed order data found');
        router.push('/');
        return;
      }

      try {
        const confirmedOrder: ConfirmedOrderData = JSON.parse(storedData);
        console.log('✅ Orden confirmada cargada:', confirmedOrder);
        setOrderData(confirmedOrder);
        setLoading(false);

        // Generar tickets llamando al API
        await generateTickets(confirmedOrder);

      } catch (error) {
        console.error('Error al procesar la orden:', error);
        setError('Error al procesar la orden confirmada');
        setLoading(false);
        setGeneratingTickets(false);
      }
    };

    initializeSuccess();
  }, [router]);

  const generateTickets = async (confirmedOrder: ConfirmedOrderData) => {
    try {
      console.log('🎫 Generando tickets...');

      const { orderId, purchaseData } = confirmedOrder;

      // Preparar datos para /api/tickets/issue
      const ticketsPayload = {
        orderId: parseInt(orderId) || orderId,
        userId: user?.id ? parseInt(user.id) : 1,
        idEvento: purchaseData.event.idEvento,
        idFechaEvento: purchaseData.fecha.idFechaEvento,
        tickets: purchaseData.tickets.map((ticket, idx) => {
          const entradaInfo = purchaseData.entradas?.[idx];
          const precio = parseFloat(ticket.price.replace('S/.', '').replace(',', '').trim());
          
          return {
            idTarifa: ticket.id,
            idSector: entradaInfo?.idSector || 1,
            idPerfil: entradaInfo?.idPerfil || 1,
            idTipoTicket: entradaInfo?.idTipoTicket || 1,
            cantidad: ticket.quantity,
            precio: precio,
            nombreZona: entradaInfo?.nombreZona || ticket.name,
          };
        }),
      };

      console.log('📤 Request a /api/tickets/issue:', ticketsPayload);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098'}/api/tickets/issue`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ticketsPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al generar tickets');
      }

      const ticketsData = await response.json();
      console.log('✅ Tickets generados:', ticketsData);

      setTickets(ticketsData.tickets || []);
      setGeneratingTickets(false);

      // Guardar tickets en sessionStorage
      sessionStorage.setItem('ticketsData', JSON.stringify({
        tickets: ticketsData.tickets,
        orderId: orderId,
        timestamp: Date.now(),
        eventName: purchaseData.event.titulo,
        eventDate: purchaseData.fecha.fecha,
        eventVenue: purchaseData.event.lugar,
      }));

    } catch (error) {
      console.error('❌ Error al generar tickets:', error);
      setError(error instanceof Error ? error.message : 'Error al generar tickets');
      setGeneratingTickets(false);
    }
  };

  const handleGoHome = () => {
    sessionStorage.removeItem('confirmedOrder');
    sessionStorage.removeItem('ticketsData');
    router.push('/');
  };

  const handleViewTickets = () => {
    router.push('/members/account/tickets');
  };

  const handleSendEmail = async () => {
    if (!orderData) {
      setEmailStatus('Error: No se encontraron datos de la compra.');
      return;
    }

    if (!user || !user.email) {
      setEmailStatus('Error: Debes iniciar sesión para enviar el correo.');
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus('Enviando...');

    try {
      const payload = {
        eventDate: orderData.purchaseData.fecha.fecha,
        eventName: orderData.purchaseData.event.titulo,
        eventVenue: orderData.purchaseData.event.lugar,
        orderId: orderData.orderId,
        userEmail: user.email,
        userName: user.nombre || 'Usuario',
      };

      const response = await fetch('/api/tickets/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error al enviar correo');
      }

      setEmailStatus('¡Correo enviado con éxito!');
    } catch (error: any) {
      setEmailStatus('Error al enviar el correo.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (loading || generatingTickets) {
    return (
      <Master>
        <Section className='gray-background hero-offset'>
          <div className='container'>
            <div className='success-container'>
              <Loader type='inline' color='gray' text={
                loading ? 'Cargando...' : 'Generando tus tickets...'
              } />
            </div>
          </div>
        </Section>
      </Master>
    );
  }

  if (error) {
    return (
      <Master>
        <Section className='gray-background hero-offset'>
          <div className='container'>
            <div className='success-container'>
              <div className='error-icon'>
                <span className='material-symbols-outlined'>error</span>
              </div>
              <Heading type={1} color='white' text='Error' />
              <p className='error-message'>{error}</p>
              <Button
                type='button'
                color='yellow-filled'
                text='Volver al inicio'
                onClick={handleGoHome}
              />
            </div>
          </div>
        </Section>
      </Master>
    );
  }

  return (
    <Master>
      <Section className='gray-background hero-offset'>
        <div className='container'>
          <div className='success-container'>
            <div className='success-icon'>
              <span className='material-symbols-outlined'>check_circle</span>
            </div>

            <Heading type={1} color='white' text='¡Compra exitosa!' />

            <div className='success-message'>
              <p>¡Tu compra se ha procesado correctamente!</p>
              {tickets.length > 0 && (
                <p>
                  Se generaron <strong>{tickets.length} ticket(s)</strong> con código QR único.
                </p>
              )}
              <p>
                Puedes ver y descargar tus entradas en <strong>"Mis entradas"</strong>.
              </p>
            </div>

            {orderData && (
              <div className='order-info'>
                <p><strong>ID de orden:</strong> {orderData.orderId}</p>
                <p><strong>Evento:</strong> {orderData.purchaseData.event.titulo}</p>
              </div>
            )}

            <div className='info-box'>
              <span className='material-symbols-outlined'>info</span>
              <div>
                <strong>Importante:</strong> Presenta tu código QR en el evento para acceder.
              </div>
            </div>

            <div className='form-buttons'>
              <Button
                type='button'
                color='yellow-filled'
                text={isSendingEmail ? 'Enviando...' : 'Enviar entradas a mi correo'}
                onClick={handleSendEmail}
                disabled={isSendingEmail || !user}
                leftIcon='forward_to_inbox'
              />
              <Button
                type='button'
                color='yellow-filled'
                text='Ver mis entradas'
                onClick={handleViewTickets}
                rightIcon='confirmation_number'
              />
              <Button
                type='button'
                color='white-outlined'
                text='Volver al inicio'
                onClick={handleGoHome}
              />
            </div>

            {emailStatus && (
              <div className='email-status-message'>
                <p>{emailStatus}</p>
              </div>
            )}
          </div>
        </div>
      </Section>

      <style jsx>{`
        .success-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 3rem 1rem;
          text-align: center;
        }

        .success-icon .material-symbols-outlined {
          font-size: 5rem;
          color: #cddc39;
          animation: scaleIn 0.5s ease-out;
        }

        .error-icon .material-symbols-outlined {
          font-size: 5rem;
          color: #ff5252;
        }

        .error-message {
          color: #ff5252;
          font-size: 1.1rem;
          margin: 2rem 0;
        }

        @keyframes scaleIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .success-message p {
          color: #ccc;
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .success-message strong {
          color: #cddc39;
        }

        .order-info {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 2rem 0;
          text-align: left;
        }

        .order-info p {
          color: #999;
          margin: 0.5rem 0;
        }

        .order-info strong {
          color: #fff;
        }

        .info-box {
          display: flex;
          gap: 1rem;
          background: rgba(205, 220, 57, 0.1);
          border: 2px solid #cddc39;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 2rem 0;
          text-align: left;
          color: #cddc39;
        }

        .info-box .material-symbols-outlined {
          font-size: 1.5rem;
        }

        .form-buttons {
          margin-top: 3rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .email-status-message {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(205, 220, 57, 0.1);
          border: 1px solid #cddc39;
          border-radius: 8px;
          color: #cddc39;
        }
      `}</style>
    </Master>
  );
};

export default Page;