'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// hooks
import useAlert from '@hooks/useAlert';

// components
import Button from '@components/Button/Button';
import Loader from '@components/Loader/Loader';

// interfaces
interface IData {
  id: number;
  name: string;
  price: string;
  ordering: number;
  soldout?: boolean;
  quantity?: number;
  information?: string;
}

interface IFecha {
  idFechaEvento: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

interface IProps {
  data: IData[];
  eventId?: number;
  fechas?: IFecha[];
  eventData?: any;
}

const TicketForm: React.FC<IProps> = ({ data, eventId, fechas = [], eventData }) => {
  const { showAlert, hideAlert } = useAlert();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [formValues, setFormValues] = useState<IData[]>(data || []);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<number | null>(
    fechas.length > 0 ? fechas[0].idFechaEvento : null
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (data && data.length > 0) {
      setFormValues(data);
    }
  }, [data]);

  useEffect(() => {
    if (data && data.length > 0) {
      const updatedData = data.map(ticket => {
        if (fechaSeleccionada === 1) {
          return {
            ...ticket,
            soldout: false,
            quantity: 0,
          };
        } else if (fechaSeleccionada === 2) {
          return {
            ...ticket,
            soldout: ticket.id !== 2,
            quantity: 0,
            information: ticket.id === 2 
              ? 'Stock disponible para esta fecha'
              : 'Agotado para esta fecha',
          };
        }
        return ticket;
      });
      
      setFormValues(updatedData);
    }
  }, [fechaSeleccionada, data]);

  const formatFecha = (fechaString: string): string => {
    const date = new Date(fechaString);
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    return `${dias[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
  };

  const orderTickets = (array: IData[]): IData[] => {
    return array.sort((a, b) => {
      return a.ordering - b.ordering;
    });
  };

  const countTickets = (array: IData[]): number => {
    return array.reduce((sum, curr): number => {
      let q: number = 0;

      if (curr.quantity != null && !isNaN(curr.quantity)) {
        q = sum + curr.quantity;
      } else {
        q = sum;
      }

      return q;
    }, 0);
  };

  const handleDecrease = (ticket: IData): void => {
    const tickets: IData[] = formValues.filter((e: IData) => e.id !== ticket.id);

    let newTicket: IData;

    if (ticket?.quantity == null || isNaN(ticket.quantity)) {
      newTicket = { ...ticket, quantity: 0 };
    } else {
      if (ticket.quantity > 0) {
        const newQuantity: number = (ticket.quantity -= 1);

        newTicket = { ...ticket, quantity: newQuantity };
      } else {
        newTicket = { ...ticket, quantity: 0 };
      }
    }

    tickets.push(newTicket);

    setFormValues(orderTickets(tickets));
  };

  const handleIncrease = (ticket: IData): void => {
    if (ticket.soldout) {
      showAlert({ type: 'error', text: 'Este tipo de entrada está agotado para esta fecha.' });
      return;
    }

    const tickets: IData[] = formValues.filter((e: IData) => e.id !== ticket.id);

    let newTicket: IData;

    if (ticket?.quantity == null || isNaN(ticket.quantity)) {
      newTicket = { ...ticket, quantity: 1 };
    } else {
      if (ticket.quantity < 9) {
        const newQuantity: number = (ticket.quantity += 1);

        newTicket = { ...ticket, quantity: newQuantity };
      } else {
        newTicket = { ...ticket, quantity: 9 };
      }
    }

    tickets.push(newTicket);

    setFormValues(orderTickets(tickets));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<any> => {
    e.preventDefault();

    hideAlert();

    const quantity: number = countTickets(formValues);

    if (quantity === 0) {
      showAlert({ 
        type: 'error', 
        text: 'Debes seleccionar al menos una entrada para este evento.' 
      });
      return;
    }

    if (!fechaSeleccionada) {
      showAlert({ 
        type: 'error', 
        text: 'Por favor selecciona una fecha para el evento.' 
      });
      return;
    }

    if (!eventData) {
      showAlert({ 
        type: 'error', 
        text: 'Error: No se encontró información del evento.' 
      });
      return;
    }

    setSubmitting(true);

    try {
      // Filtrar solo los tickets con cantidad > 0
      const selectedTickets = formValues
        .filter(ticket => ticket.quantity && ticket.quantity > 0)
        .map(ticket => ({
          id: ticket.id,
          name: ticket.name,
          price: ticket.price,
          quantity: ticket.quantity || 0,
        }));

      // Encontrar la fecha seleccionada
      const fechaSeleccionadaObj = fechas.find(f => f.idFechaEvento === fechaSeleccionada);

      if (!fechaSeleccionadaObj) {
        showAlert({ 
          type: 'error', 
          text: 'Error: No se encontró la fecha seleccionada.' 
        });
        setSubmitting(false);
        return;
      }

      // Crear objeto con toda la información
      const purchaseData = {
        event: {
          idEvento: eventData.idEvento,
          titulo: eventData.titulo,
          lugar: eventData.lugar,
          direccion: eventData.direccion,
          telefono: eventData.telefono,
          imagenPortada: eventData.imagenPortada,
        },
        tickets: selectedTickets,
        fecha: fechaSeleccionadaObj,
        timestamp: Date.now(),
      };

      console.log('Saving purchase data:', purchaseData);

      // Guardar en sessionStorage
      sessionStorage.setItem('purchaseData', JSON.stringify(purchaseData));

      // Verificar que se guardó
      const saved = sessionStorage.getItem('purchaseData');
      console.log('Verified saved data:', saved);

      // Pequeño delay para asegurar que se guardó
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navegar a /buy
      router.push('/buy');

    } catch (error) {
      console.error('Error saving purchase data:', error);
      showAlert({ 
        type: 'error', 
        text: 'Error al procesar tu solicitud. Por favor intenta nuevamente.' 
      });
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader type='inline' color='gray' text='Cargando...' />;
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
    >
      {fechas.length > 1 && (
        <div className='ticket-box-dates'>
          <label htmlFor='fecha-select' className='date-label'>
            Selecciona la fecha:
          </label>
          <select
            id='fecha-select'
            className='date-select'
            value={fechaSeleccionada || ''}
            onChange={(e) => setFechaSeleccionada(Number(e.target.value))}
          >
            {fechas.map((fecha) => (
              <option key={fecha.idFechaEvento} value={fecha.idFechaEvento}>
                {formatFecha(fecha.fecha)} - {fecha.horaInicio}
                {fecha.horaFin && ` a ${fecha.horaFin}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className='ticket-box-content'>
        {formValues && formValues.length > 0 ? (
          formValues.map((ticket) => (
            <div key={ticket.id} className='ticket-box-line'>
              {ticket.soldout === true ? (
                <>
                  <span className='material-symbols-outlined'>lock</span>
                  <span>{ticket.name}</span>
                  <strong>Agotado</strong>
                  {ticket.information != null && (
                    <span className='material-symbols-outlined icon' title={ticket.information}>
                      info
                    </span>
                  )}
                </>
              ) : (
                <>
                  <div className='quantity'>
                    <button
                      type='button'
                      onClick={() => {
                        handleDecrease(ticket);
                      }}
                      disabled={submitting}
                    >
                      -
                    </button>
                    <input
                      readOnly
                      type='text'
                      name={`t-${ticket.id}`}
                      value={ticket.quantity ?? 0}
                      onChange={() => {}}
                    />
                    <button
                      type='button'
                      onClick={() => {
                        handleIncrease(ticket);
                      }}
                      disabled={submitting}
                    >
                      +
                    </button>
                  </div>
                  <span>{ticket.name}</span>
                  <strong>{ticket.price}</strong>
                  {ticket.information != null && (
                    <span className='material-symbols-outlined icon' title={ticket.information}>
                      info
                    </span>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <div className='paragraph-container'>
            <p>No hay entradas disponibles.</p>
          </div>
        )}
      </div>
      
      <div className='ticket-box-buttons'>
        {formValues && formValues.length > 0 ? (
          <Button 
            type='submit' 
            color={submitting ? 'disabled' : 'yellow-filled'}
            text={submitting ? 'Procesando...' : 'Ir a pagar'}
            rightIcon={submitting ? undefined : 'arrow_forward'}
            disabled={submitting}
          />
        ) : (
          <Button type='button' color='disabled' text='No se encontraron entradas' />
        )}
      </div>

      <style jsx>{`
        .ticket-box-dates {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #333;
          background-color: #1a1a1a;
        }

        .date-label {
          display: block;
          color: #999;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .date-select {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: #000;
          color: #fff;
          border: 2px solid #333;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .date-select:hover {
          border-color: #cddc39;
        }

        .date-select:focus {
          outline: none;
          border-color: #cddc39;
          box-shadow: 0 0 0 3px rgba(205, 220, 57, 0.1);
        }

        .date-select option {
          background-color: #000;
          color: #fff;
          padding: 0.5rem;
        }
      `}</style>
    </form>
  );
};

export default TicketForm;