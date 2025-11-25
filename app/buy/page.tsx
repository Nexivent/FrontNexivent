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
  const { showAlert, hideAlert } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);
  
  // Estados para el cupón
  const [codigoCupon, setCodigoCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState<{
    id: number;
    tipo: number;
    valor: number;
    cantUsadaPorElUsuario: number;
  } | null>(null);
  const [validandoCupon, setValidandoCupon] = useState(false);

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
    
    const subtotal = purchaseData.tickets.reduce((total, ticket) => {
      const price = parseFloat(ticket.price.replace('S/.', '').replace(',', '').trim());
      return total + (price * ticket.quantity);
    }, 0);
    
    // Aplicar descuento si hay cupón
    if (cuponAplicado) {
      const descuento = (subtotal * cuponAplicado.valor) / 100;
      return subtotal - descuento;
    }
    
    return subtotal;
  };
  
  const calculateSubtotal = (): number => {
    if (!purchaseData || !purchaseData.tickets) return 0;
    
    return purchaseData.tickets.reduce((total, ticket) => {
      const price = parseFloat(ticket.price.replace('S/.', '').replace(',', '').trim());
      return total + (price * ticket.quantity);
    }, 0);
  };
  
  const calculateDescuento = (): number => {
    if (!cuponAplicado) return 0;
    const subtotal = calculateSubtotal();
    return (subtotal * cuponAplicado.valor) / 100;
  };

  const handleValidarCupon = async () => {
    if (!codigoCupon.trim()) {
      window.alert('Por favor ingresa un código de cupón.');
      return;
    }

    if (!purchaseData || !user?.id) {
      window.alert('Faltan datos necesarios para validar el cupón.');
      return;
    }

    setValidandoCupon(true);

    try {
      const userId = user?.id ? parseInt(user.id) : 0;
      const eventoId = purchaseData.event.idEvento;

      console.log('INFO: Validando cupón...', { userId, eventoId, codigo: codigoCupon });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cupon/validar?usuarioId=${userId}&eventoId=${eventoId}&codigo=${encodeURIComponent(codigoCupon)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('INFO: Response status:', response.status);

      if (!response.ok) {
        // Cupón no válido - esto NO es un error de la app
        let errorMessage = 'Cupón no válido o expirado.';
        try {
          const errorData = await response.json();
          // El backend devuelve "Message" con mayúscula
          errorMessage = errorData.Message || errorData.message || errorData.error || errorMessage;
          console.log('INFO: Respuesta del servidor:', errorData);
          console.log('INFO: Mensaje de error a mostrar:', errorMessage);
        } catch (parseError) {
          console.log('INFO: No se pudo parsear respuesta del servidor');
        }
        
        // Mostrar alerta usando alert() del navegador
        console.log('INFO: Mostrando alerta...');
        window.alert(errorMessage);
        console.log('INFO: Alerta mostrada');
        
        setValidandoCupon(false);
        return;
      }

      const cuponData = await response.json();
      console.log('SUCCESS: Cupón validado:', cuponData);

      setCuponAplicado(cuponData);
      console.log('INFO: Mostrando alerta de éxito...');
      window.alert(`¡Cupón aplicado! Descuento del ${cuponData.valor}%`);
      console.log('INFO: Alerta mostrada');
      setValidandoCupon(false);
      
    } catch (error) {
      // Solo llegamos aquí si hay un error de RED o JavaScript
      console.log('INFO: Error de conexión:', error);
      window.alert('Error de conexión. Por favor intenta nuevamente.');
      setValidandoCupon(false);
    }
  };

  const handleRemoverCupon = () => {
    setCuponAplicado(null);
    setCodigoCupon('');
    window.alert('Cupón removido');
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

            {/* Sección de cupón */}
            <div className='cupon-section'>
              <Heading type={5} color='gray' text='¿Tienes un cupón de descuento?' />
              {!cuponAplicado ? (
                <div className='cupon-input-group'>
                  <input
                    type='text'
                    className='cupon-input'
                    placeholder='Ingresa tu código'
                    value={codigoCupon}
                    onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                    disabled={validandoCupon}
                    maxLength={20}
                  />
                  <Button
                    type='button'
                    color={validandoCupon ? 'disabled' : 'yellow-outlined'}
                    text={validandoCupon ? 'Validando...' : 'Aplicar'}
                    onClick={handleValidarCupon}
                    disabled={validandoCupon || !codigoCupon.trim()}
                  />
                </div>
              ) : (
                <div className='cupon-aplicado'>
                  <div className='cupon-info'>
                    <span className='material-symbols-outlined'>check_circle</span>
                    <div>
                      <strong>Cupón aplicado: {codigoCupon}</strong>
                      <p>Descuento del {cuponAplicado.valor}%</p>
                    </div>
                  </div>
                  <button className='remover-cupon' onClick={handleRemoverCupon}>
                    <span className='material-symbols-outlined'>close</span>
                  </button>
                </div>
              )}
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
                {cuponAplicado ? (
                  <>
                    <tr>
                      <td colSpan={3}><strong>Subtotal</strong></td>
                      <td align='right'><strong>S/. {calculateSubtotal().toFixed(2)}</strong></td>
                    </tr>
                    <tr className='descuento-row'>
                      <td colSpan={3}>
                        <strong>Descuento ({cuponAplicado.valor}%)</strong>
                      </td>
                      <td align='right'>
                        <strong className='descuento-text'>-S/. {calculateDescuento().toFixed(2)}</strong>
                      </td>
                    </tr>
                    <tr className='total-row'>
                      <td colSpan={3}><strong>Total</strong></td>
                      <td align='right'><strong>S/. {total.toFixed(2)}</strong></td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={3}><strong>Total</strong></td>
                    <td align='right'><strong>S/. {total.toFixed(2)}</strong></td>
                  </tr>
                )}
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

      <style jsx>{`
        .cupon-section {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
        }

        .cupon-input-group {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .cupon-input {
          flex: 1;
          padding: 0.75rem 1rem;
          background: #000;
          border: 2px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 1rem;
          text-transform: uppercase;
          transition: border-color 0.3s ease;
        }

        .cupon-input:focus {
          outline: none;
          border-color: #cddc39;
        }

        .cupon-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cupon-aplicado {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(205, 220, 57, 0.1);
          border: 2px solid #cddc39;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .cupon-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .cupon-info .material-symbols-outlined {
          color: #cddc39;
          font-size: 2rem;
        }

        .cupon-info strong {
          color: #cddc39;
          display: block;
          margin-bottom: 0.25rem;
        }

        .cupon-info p {
          color: #999;
          margin: 0;
          font-size: 0.9rem;
        }

        .remover-cupon {
          background: transparent;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .remover-cupon:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .remover-cupon .material-symbols-outlined {
          font-size: 1.5rem;
        }

        .descuento-row {
          background: rgba(205, 220, 57, 0.05);
        }

        .descuento-text {
          color: #cddc39;
        }

        .total-row {
          background: rgba(205, 220, 57, 0.1);
          font-size: 1.1rem;
        }
      `}</style>
    </Master>
  );
};

export default Page;