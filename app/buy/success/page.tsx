'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
}

interface TicketsData {
  tickets: TicketInfo[];
  orderId: string;
  timestamp: number;
}

const Page: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ticketsData, setTicketsData] = useState<TicketsData | null>(null);

  useEffect(() => {
    // Recuperar datos de los tickets
    const storedData = sessionStorage.getItem('ticketsData');
    
    if (storedData) {
      try {
        const data: TicketsData = JSON.parse(storedData);
        console.log('Tickets data loaded:', data);
        setTicketsData(data);
      } catch (error) {
        console.error('Error parsing tickets data:', error);
      }
    }

    // Limpiar sessionStorage
    sessionStorage.removeItem('purchaseData');
    sessionStorage.removeItem('reservationData');
    // Mantener ticketsData por si el usuario quiere verlos

    setLoading(false);
  }, []);

  const handleGoHome = () => {
    // Limpiar todo al volver al inicio
    sessionStorage.removeItem('ticketsData');
    router.push('/');
  };

  const handleViewTickets = () => {
    // Navegar a página de "Mis Entradas"
    // Ajusta la ruta según tu estructura
    router.push('/members/account/tickets'); 
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

  return (
    <Master>
      <Section className='gray-background hero-offset'>
        <div className='container'>
          <div className='success-container'>
            {/* Icono de éxito */}
            <div className='success-icon'>
              <span className='material-symbols-outlined'>check_circle</span>
            </div>

            {/* Título */}
            <Heading type={1} color='white' text='¡Compra exitosa!' />

            {/* Mensaje */}
            <div className='success-message'>
              <p>
                ¡Tu compra se ha procesado correctamente!
              </p>
              {ticketsData && ticketsData.tickets && ticketsData.tickets.length > 0 && (
                <p>
                  Se generaron <strong>{ticketsData.tickets.length} ticket(s)</strong> con código QR único.
                </p>
              )}
              <p>
                Puedes ver y descargar tus entradas en la sección <strong>"Mis entradas"</strong> de tu perfil.
              </p>
            </div>

            {/* Información de tickets */}
            {ticketsData && ticketsData.orderId && (
              <div className='order-info'>
                <p className='order-id'>
                  <strong>ID de orden:</strong> {ticketsData.orderId}
                </p>
              </div>
            )}

            {/* Información adicional */}
            <div className='info-box'>
              <span className='material-symbols-outlined'>info</span>
              <div>
                <strong>Importante:</strong> Presenta tu código QR en el evento para acceder.
              </div>
            </div>

            {/* Botones */}
            <div className='form-buttons'>
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

        .success-icon {
          margin-bottom: 2rem;
        }

        .success-icon .material-symbols-outlined {
          font-size: 5rem;
          color: #cddc39;
          animation: scaleIn 0.5s ease-out;
        }

        @keyframes scaleIn {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        .success-message {
          margin: 2rem 0;
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
          padding: 1rem;
          margin: 2rem 0;
        }

        .order-id {
          color: #999;
          font-size: 0.95rem;
          margin: 0;
        }

        .order-id strong {
          color: #fff;
        }

        .info-box {
          display: flex;
          align-items: flex-start;
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
          flex-shrink: 0;
          margin-top: 0.2rem;
        }

        .info-box strong {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }

        .info-box div {
          line-height: 1.5;
        }

        .form-buttons {
          margin-top: 3rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .success-container {
            padding: 2rem 1rem;
          }

          .success-icon .material-symbols-outlined {
            font-size: 4rem;
          }

          .success-message p {
            font-size: 1rem;
          }

          .info-box {
            padding: 1rem;
          }
        }
      `}</style>
    </Master>
  );
};

export default Page;