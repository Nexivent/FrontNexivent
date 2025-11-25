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

interface TicketData {
  id: number;
  name: string;
  price: string;
  quantity: number;
  idSector: number;       
  idPerfil: number;       
  idTipoTicket: number;   
}

interface FechaData {
  idFechaEvento: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

interface EventData {
  idEvento: number;
  titulo: string;
  lugar: string;
  direccion?: string;
  telefono?: string;
  imagenPortada?: string;
}

interface PurchaseData {
  event: EventData;
  tickets: TicketData[];
  fecha: FechaData;
  timestamp: number;
}

const Page: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const { showAlert } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('purchaseData');
    
    if (!storedData) {
      console.log('No purchase data found, redirecting to home');
      router.push('/');
      return;
    }

    try {
      const data: PurchaseData = JSON.parse(storedData);
      console.log('Purchase data loaded:', data);
      
      if (!data.event || !data.tickets || !data.fecha) {
        console.error('Invalid purchase data structure:', data);
        router.push('/');
        return;
      }
      
      setPurchaseData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error parsing purchase data:', error);
      router.push('/');
    }
  }, [router]);

  const formatFecha = (fechaString: string): string => {
    const date = new Date(fechaString);
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    return `${dias[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const calculateTotal = (): number => {
    if (!purchaseData || !purchaseData.tickets) return 0;
    
    return purchaseData.tickets.reduce((total, ticket) => {
      const price = parseFloat(ticket.price.replace('S/.', '').replace(',', '').trim());
      return total + (price * ticket.quantity);
    }, 0);
  };

  const handleContinue = async () => {
    if (!purchaseData) return;
  
    const { event, tickets, fecha } = purchaseData;
  
    if (!event.idEvento || !fecha.idFechaEvento || tickets.length === 0) {
      showAlert({ 
        type: 'error', 
        text: 'Faltan datos necesarios para continuar con la compra.' 
      });
      return;
    }
  
    const userId = user?.id ? parseInt(user.id) : 1;
    
    // Calcular el precio total de la orden
    const precioTotal = calculateTotal();
  
    setSubmitting(true);
  
    try {
      
      const orderData = {
        IdEvento: event.idEvento,
        IdFechaEvento: fecha.idFechaEvento,
        IdUsuario: userId,
        Total: precioTotal, // Precio total de la orden
        Entradas: tickets.map(ticket => ({
          idTipoTicket: ticket.idTipoTicket || ticket.id,  
          idPerfil: ticket.idPerfil || 1,                   
          idSector: ticket.idSector || 1,                   
          cantidad: ticket.quantity,
        })),
      };
  
      console.log('API: Enviando solicitud de reserva:', orderData);
      console.log('INFO: Total calculado:', precioTotal);
  
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orden_de_compra/hold`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || errorData.error || 'Error al reservar las entradas');
      }
  
      const reservaData = await response.json();
      console.log('SUCCESS: Reserva exitosa:', reservaData);
  
      const expiresAt = Date.now() + (reservaData.ttlSeconds * 1000);
  
      sessionStorage.setItem('reservationData', JSON.stringify({
        orderId: reservaData.orderId,
        estado: reservaData.estado,
        remainingSeconds: reservaData.ttlSeconds,
        expiresAt: expiresAt,
        purchaseData: purchaseData,
      }));
  
      router.push('/buy/checkout');
  
    } catch (error) {
      console.error('ERROR: Error al reservar tickets:', error);
      
      setSubmitting(false);
      
      showAlert({ 
        type: 'error', 
        text: error instanceof Error 
          ? error.message 
          : 'No se pudieron reservar las entradas. Por favor, intenta nuevamente.' 
      });
    }
  };

  if (loading) {
    return (
      <Master>
        <Section className='gray-background hero-offset'>
          <div className='container'>
            <Loader type='inline' color='gray' text='Cargando información...' />
          </div>
        </Section>
      </Master>
    );
  }

  if (!purchaseData) {
    return null;
  }

  const { event, tickets, fecha } = purchaseData;
  
  if (!event || !tickets || !fecha) {
    return null;
  }

  const total = calculateTotal();

  return (
    <Master>
      <Section className='gray-background hero-offset'>
        <div className='container'>
          <div className='center' style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Heading type={1} color='white' text='Resumen de compra' />
            <p className='gray'>
              Revisa los detalles de tu compra antes de continuar con el pago.
            </p>
          </div>

          <div className='purchase-summary'>
            <Heading type={4} color='gray' text='Detalles de la compra' />
            <div className='details-grid'>
              <div>
                <strong>Evento:</strong> {event.titulo}
              </div>
              <div>
                <strong>Lugar:</strong> {event.lugar}
              </div>
              <div>
                <strong>Fecha:</strong> {formatFecha(fecha.fecha)} {fecha.horaInicio}
                {fecha.horaFin && ` - ${fecha.horaFin}`}
              </div>
            </div>

            <table className='purchase-summary-table'>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th align='center'>Cantidad</th>
                  <th align='right'>Precio Unit.</th>
                  <th align='right'>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, index) => {
                  const price = parseFloat(ticket.price.replace('S/.', '').replace(',', '').trim());
                  const subtotal = price * ticket.quantity;
                  
                  return (
                    <tr key={`ticket-${ticket.id}-${index}`}>
                      <td>{ticket.name}</td>
                      <td align='center'>{ticket.quantity}</td>
                      <td align='right'>{ticket.price}</td>
                      <td align='right'>S/. {subtotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}><strong>Total</strong></td>
                  <td align='right'><strong>S/. {total.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className='form-buttons' style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Button
              type='button'
              color={submitting ? 'disabled' : 'yellow-filled'}
              text={submitting ? 'Reservando...' : 'Continuar con el pago'}
              rightIcon={submitting ? undefined : 'arrow_forward'}
              onClick={handleContinue}
              disabled={submitting}
            />
          </div>

          <div className='center' style={{ marginTop: '20px' }}>
            <p className='gray' style={{ fontSize: '0.9em' }}>
              {submitting 
                ? 'Reservando tus entradas, por favor espera...'
                : 'Al continuar, se reservarán tus entradas por 10 minutos.'
              }
            </p>
          </div>
        </div>
      </Section>
    </Master>
  );
};

export default Page;