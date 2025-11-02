'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FC } from 'react';

// hooks
import useAlert from '@hooks/useAlert';

// components
import Input from '@components/Form/Input';
import Heading from '@components/Heading/Heading';
import Switch from '@components/Form/Switch';

// utils
import {
  adminEventApi,
  defaultTicketTiers,
  eventCategories,
  organizers,
  type AdminEvent,
  type AdminEventPayload,
  type EventStatus,
} from '@utils/admin/events';

interface EventFormState {
  titulo: string;
  descripcion: string;
  lugar: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  idOrganizador: number;
  idCategoria: number;
}

interface TicketTierDraft {
  id: string;
  name: string;
  currency: string;
  price: string;
  available: string;
  maxPerOrder: string;
}

const createEmptyTicketDrafts = (): TicketTierDraft[] =>
  defaultTicketTiers.map((tier) => ({
    id: tier.id,
    name: tier.name,
    currency: tier.currency,
    price: tier.price > 0 ? tier.price.toString() : '',
    available: tier.available > 0 ? tier.available.toString() : '',
    maxPerOrder: tier.maxPerOrder.toString(),
  }));

const formatDateTimePreview = (value: string): string => {
  if (!value) {
    return 'Por definir';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Fecha inválida';
  }

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
};

const statusLabels: Record<EventStatus, string> = {
  BORRADOR: 'Borrador',
  PUBLICADO: 'Publicado',
  CANCELADO: 'Cancelado',
};

const EventCreator: FC = () => {
  const { showAlert, hideAlert } = useAlert();

  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [autoCloseSales, setAutoCloseSales] = useState<boolean>(true);
  const [allowComments, setAllowComments] = useState<boolean>(true);
  const [moderatorMessage, setModeratorMessage] = useState<string>('');
  const [ticketDrafts, setTicketDrafts] = useState<TicketTierDraft[]>(createEmptyTicketDrafts);
  const [formState, setFormState] = useState<EventFormState>(() => ({
    titulo: '',
    descripcion: '',
    lugar: '',
    fechaHoraInicio: '',
    fechaHoraFin: '',
    idOrganizador: organizers[0]?.idOrganizador ?? 0,
    idCategoria: eventCategories[0]?.idCategoria ?? 0,
  }));

  useEffect(() => {
    const fetchEvents = async (): Promise<void> => {
      const data = await adminEventApi.listEvents();

      setEvents(data);
    };

    void fetchEvents();
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    const { name, value } = event.target;

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const { name, value } = event.target;

    setFormState((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleTicketDraftChange = (
    tierId: string,
    field: 'price' | 'available' | 'maxPerOrder',
    value: string
  ): void => {
    setTicketDrafts((prev) =>
      prev.map((tier) =>
        tier.id === tierId
          ? {
              ...tier,
              [field]: value,
            }
          : tier
      )
    );
  };

  const resetForm = (): void => {
    setFormState({
      titulo: '',
      descripcion: '',
      lugar: '',
      fechaHoraInicio: '',
      fechaHoraFin: '',
      idOrganizador: organizers[0]?.idOrganizador ?? 0,
      idCategoria: eventCategories[0]?.idCategoria ?? 0,
    });
    setTicketDrafts(createEmptyTicketDrafts());
    setModeratorMessage('');
    setAutoCloseSales(true);
    setAllowComments(true);
  };

  const toPayload = (status: EventStatus): AdminEventPayload => {
    const ticketTiers = ticketDrafts.map((tier) => ({
      id: tier.id,
      name: tier.name,
      currency: tier.currency,
      price: Number(tier.price) || 0,
      available: Number(tier.available) || 0,
      maxPerOrder: Number(tier.maxPerOrder) || 0,
    }));

    return {
      ...formState,
      estado: status,
      like: 0,
      noInteres: 0,
      comentario: allowComments && moderatorMessage.trim() !== '' ? [moderatorMessage.trim()] : [],
      ticketTiers,
      imagenDestacada: undefined,
    };
  };

  const validateForm = (): string | null => {
    if (formState.titulo.trim() === '') {
      return 'Debes ingresar un título para el evento.';
    }

    if (formState.descripcion.trim() === '') {
      return 'Completa la descripción del evento para continuar.';
    }

    if (formState.lugar.trim() === '') {
      return 'Especifica el lugar del evento.';
    }

    if (formState.fechaHoraInicio === '' || formState.fechaHoraFin === '') {
      return 'Selecciona la fecha y hora de inicio y fin.';
    }

    const startDate = new Date(formState.fechaHoraInicio);
    const endDate = new Date(formState.fechaHoraFin);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return 'Las fechas proporcionadas no son válidas.';
    }

    if (endDate <= startDate) {
      return 'La fecha de fin debe ser posterior a la fecha de inicio.';
    }

    const hasPositiveTickets = ticketDrafts.some(
      (tier) => Number(tier.price) > 0 && Number(tier.available) > 0
    );

    if (!hasPositiveTickets) {
      return 'Configura al menos una categoría de tickets con precio y stock disponible.';
    }

    return null;
  };

  const handleSave = async (status: EventStatus): Promise<void> => {
    hideAlert();

    const validationMessage = validateForm();

    if (validationMessage !== null) {
      showAlert({ type: 'error', text: validationMessage });

      return;
    }

    setLoading(true);

    const payload: AdminEventPayload = toPayload(status);

    try {
      const created = await adminEventApi.createEvent(payload);

      setEvents((prev) => [created, ...prev]);
      showAlert({
        type: 'success',
        text:
          status === 'PUBLICADO'
            ? 'Evento publicado correctamente. Ya aparece en la cartelera.'
            : 'Borrador guardado. Podrás continuar editando cuando lo necesites.',
      });
      resetForm();
    } catch {
      showAlert({
        type: 'error',
        text: 'No pudimos guardar el evento. Intenta nuevamente en unos minutos.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (idEvento: number, status: EventStatus): Promise<void> => {
    setLoading(true);

    try {
      const updated = await adminEventApi.updateEventStatus(idEvento, status);

      if (updated === null) {
        showAlert({ type: 'error', text: 'El evento ya no existe en la bandeja.' });
      } else {
        setEvents((prev) => prev.map((event) => (event.idEvento === idEvento ? updated : event)));
        showAlert({ type: 'success', text: `Estado actualizado a ${statusLabels[status]}.` });
      }
    } catch {
      showAlert({ type: 'error', text: 'No se pudo actualizar el estado. Inténtalo nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  const previewTicketSummary = useMemo(
    () =>
      ticketDrafts.map((tier) => ({
        ...tier,
        priceNumber: Number(tier.price) || 0,
        availableNumber: Number(tier.available) || 0,
      })),
    [ticketDrafts]
  );

  const estimatedRevenue = useMemo(() => {
    return previewTicketSummary.reduce(
      (acc, tier) => acc + tier.priceNumber * tier.availableNumber,
      0
    );
  }, [previewTicketSummary]);

  const previewStatus: EventStatus = 'BORRADOR';

  return (
    <div className='admin-event-grid'>
      <div>
        <div className='admin-card'>
          <Heading type={3} color='white' text='Información general' />
          <p className='gray'>
            Define la información base del evento. Estos campos serán visibles para el público.
          </p>
          <div className='admin-field'>
            <label htmlFor='titulo'>Título del evento</label>
            <Input
              type='text'
              name='titulo'
              value={formState.titulo}
              maxLength={100}
              placeholder='Ej: Festival de verano Nexivent'
              required
              onChange={handleInputChange}
            />
          </div>
          <div className='admin-field'>
            <label htmlFor='descripcion'>Descripción</label>
            <textarea
              id='descripcion'
              name='descripcion'
              value={formState.descripcion}
              onChange={handleTextAreaChange}
              className='admin-input'
              placeholder='Describe la experiencia, artistas invitados y servicios incluidos.'
              rows={6}
            />
          </div>
          <div className='admin-field'>
            <label htmlFor='lugar'>Lugar</label>
            <Input
              type='text'
              name='lugar'
              value={formState.lugar}
              maxLength={120}
              placeholder='Ingresa el recinto o dirección del evento'
              required
              onChange={handleInputChange}
            />
          </div>
          <div className='admin-field admin-field-grid'>
            <div>
              <label htmlFor='idOrganizador'>Organizador</label>
              <select
                id='idOrganizador'
                name='idOrganizador'
                className='select admin-select'
                value={formState.idOrganizador}
                onChange={handleSelectChange}
              >
                {organizers.map((organizer) => (
                  <option key={organizer.idOrganizador} value={organizer.idOrganizador}>
                    {organizer.nombre} · {organizer.contacto}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor='idCategoria'>Categoría principal</label>
              <select
                id='idCategoria'
                name='idCategoria'
                className='select admin-select'
                value={formState.idCategoria}
                onChange={handleSelectChange}
              >
                {eventCategories.map((category) => (
                  <option key={category.idCategoria} value={category.idCategoria}>
                    {category.nombre} · {category.descripcion}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className='admin-field admin-field-grid'>
            <div>
              <label htmlFor='fechaHoraInicio'>Inicio</label>
              <input
                id='fechaHoraInicio'
                name='fechaHoraInicio'
                type='datetime-local'
                className='input-text admin-input'
                value={formState.fechaHoraInicio}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor='fechaHoraFin'>Fin</label>
              <input
                id='fechaHoraFin'
                name='fechaHoraFin'
                type='datetime-local'
                className='input-text admin-input'
                value={formState.fechaHoraFin}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className='admin-card'>
          <Heading type={3} color='white' text='Entradas y aforo' />
          <p className='gray'>Define los precios y capacidad disponible para cada categoría.</p>
          <div className='admin-ticket-grid'>
            {ticketDrafts.map((tier) => (
              <div key={tier.id} className='admin-ticket-card'>
                <div className='admin-ticket-card__header'>
                  <span className='badge blue'>{tier.name}</span>
                  <span className='admin-ticket-card__currency'>{tier.currency}</span>
                </div>
                <div className='admin-ticket-card__field'>
                  <label htmlFor={`price-${tier.id}`}>Precio</label>
                  <input
                    id={`price-${tier.id}`}
                    type='number'
                    inputMode='decimal'
                    min='0'
                    name='price'
                    className='input-text admin-input'
                    value={tier.price}
                    placeholder='0.00'
                    onChange={(event) => {
                      handleTicketDraftChange(tier.id, 'price', event.target.value);
                    }}
                  />
                </div>
                <div className='admin-ticket-card__field'>
                  <label htmlFor={`available-${tier.id}`}>Stock disponible</label>
                  <input
                    id={`available-${tier.id}`}
                    type='number'
                    inputMode='numeric'
                    min='0'
                    name='available'
                    className='input-text admin-input'
                    value={tier.available}
                    placeholder='Cantidad total'
                    onChange={(event) => {
                      handleTicketDraftChange(tier.id, 'available', event.target.value);
                    }}
                  />
                </div>
                <div className='admin-ticket-card__field'>
                  <label htmlFor={`max-${tier.id}`}>Máx. por compra</label>
                  <input
                    id={`max-${tier.id}`}
                    type='number'
                    inputMode='numeric'
                    min='1'
                    name='maxPerOrder'
                    className='input-text admin-input'
                    value={tier.maxPerOrder}
                    placeholder='Ej: 4'
                    onChange={(event) => {
                      handleTicketDraftChange(tier.id, 'maxPerOrder', event.target.value);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className='admin-card__footer'>
            <Switch
              name='autoCloseSales'
              color='blue'
              checked={autoCloseSales}
              onChange={(event) => {
                setAutoCloseSales(event.target.checked);
              }}
            >
              Cerrar automáticamente las ventas cuando se agote el stock
            </Switch>
            <Switch
              name='allowComments'
              color='blue'
              checked={allowComments}
              onChange={(event) => {
                setAllowComments(event.target.checked);
              }}
            >
              Habilitar comentarios de asistentes
            </Switch>
            {allowComments && (
              <div className='admin-field admin-field--inline'>
                <label htmlFor='moderatorMessage'>Mensaje destacado</label>
                <input
                  id='moderatorMessage'
                  name='moderatorMessage'
                  type='text'
                  className='input-text admin-input'
                  placeholder='Ej: ¡Gracias por formar parte de esta experiencia!'
                  value={moderatorMessage}
                  onChange={(event) => {
                    setModeratorMessage(event.target.value);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className='admin-actions'>
          <button
            type='button'
            className='button gray-overlay'
            disabled={loading}
            onClick={() => {
              handleSave('BORRADOR').catch(() => {});
            }}
          >
            <span className='material-symbols-outlined left-icon'>draft</span>
            Guardar borrador
          </button>
          <button
            type='button'
            className='button yellow-filled'
            disabled={loading}
            onClick={() => {
              handleSave('PUBLICADO').catch(() => {});
            }}
          >
            {loading ? (
              <span className='material-symbols-outlined left-icon'>hourglass_top</span>
            ) : (
              <span className='material-symbols-outlined left-icon'>rocket_launch</span>
            )}
            Publicar evento
          </button>
        </div>
      </div>

      <div className='admin-preview-column'>
        <div className='admin-card sticky'>
          <Heading type={4} color='white' text='Vista previa para asistentes' />
          <div className='admin-preview-card'>
            <div className='admin-preview-card__header'>
              <span className={`admin-status admin-status--${previewStatus.toLowerCase()}`}>
                {statusLabels[previewStatus]}
              </span>
              <span className='admin-preview-card__category'>
                {eventCategories.find((category) => category.idCategoria === formState.idCategoria)
                  ?.nombre ?? ''}
              </span>
            </div>
            <h3>{formState.titulo !== '' ? formState.titulo : 'Nuevo evento Nexivent'}</h3>
            <p className='admin-preview-card__location'>
              <span className='material-symbols-outlined'>location_on</span>
              {formState.lugar !== '' ? formState.lugar : 'Por confirmar'}
            </p>
            <p className='admin-preview-card__datetime'>
              <span className='material-symbols-outlined'>event</span>
              {formatDateTimePreview(formState.fechaHoraInicio)}
              <span className='admin-preview-card__separator'>→</span>
              {formatDateTimePreview(formState.fechaHoraFin)}
            </p>
            <p className='admin-preview-card__description'>
              {formState.descripcion !== ''
                ? formState.descripcion
                : 'Comparte aquí los highlights del evento, servicios incluidos y horarios especiales.'}
            </p>
            <div className='admin-preview-card__tickets'>
              <table>
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Precio</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {previewTicketSummary.map((tier) => (
                    <tr key={tier.id}>
                      <td>{tier.name}</td>
                      <td>
                        {tier.priceNumber > 0
                          ? `${tier.currency} ${tier.priceNumber.toLocaleString('es-PE')}`
                          : 'Por definir'}
                      </td>
                      <td>{tier.availableNumber > 0 ? tier.availableNumber : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className='admin-preview-card__footer'>
              <div>
                <span className='material-symbols-outlined'>paid</span>
                Ingreso potencial estimado:{' '}
                <strong>
                  PEN {estimatedRevenue.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                </strong>
              </div>
              <div>
                <span className='material-symbols-outlined'>group</span>
                Venta múltiple activa hasta{' '}
                {autoCloseSales ? 'agotar stock' : 'que la cierres manualmente'}
              </div>
            </div>
            {allowComments && (
              <div className='admin-preview-card__comments'>
                <h5>Lo que verán los asistentes</h5>
                <div className='admin-comment'>
                  <span className='material-symbols-outlined'>chat</span>
                  <div>
                    <p className='admin-comment__author'>Equipo del organizador</p>
                    <p>
                      {moderatorMessage !== ''
                        ? moderatorMessage
                        : '¡Déjanos tus dudas en los comentarios!'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='admin-card'>
          <Heading type={4} color='white' text='Eventos en gestión' />
          <p className='gray'>
            Supervisa el estado actual y actúa rápidamente sobre los eventos existentes.
          </p>
          <ul className='admin-event-list'>
            {events.map((event) => (
              <li key={event.idEvento} className='admin-event-list__item'>
                <div>
                  <p className='admin-event-list__title'>{event.titulo}</p>
                  <p className='admin-event-list__meta'>
                    {formatDateTimePreview(event.fechaHoraInicio)} · {event.lugar}
                  </p>
                </div>
                <div className='admin-event-list__actions'>
                  <span className={`admin-status admin-status--${event.estado.toLowerCase()}`}>
                    {statusLabels[event.estado]}
                  </span>
                  <div className='admin-event-list__buttons'>
                    {event.estado !== 'PUBLICADO' && (
                      <button
                        type='button'
                        className='admin-status-button admin-status-button--publish'
                        disabled={loading}
                        onClick={() => {
                          handleStatusUpdate(event.idEvento, 'PUBLICADO').catch(() => {});
                        }}
                      >
                        <span className='material-symbols-outlined'>done</span>
                      </button>
                    )}
                    {event.estado !== 'BORRADOR' && (
                      <button
                        type='button'
                        className='admin-status-button admin-status-button--draft'
                        disabled={loading}
                        onClick={() => {
                          handleStatusUpdate(event.idEvento, 'BORRADOR').catch(() => {});
                        }}
                      >
                        <span className='material-symbols-outlined'>edit_note</span>
                      </button>
                    )}
                    {event.estado !== 'CANCELADO' && (
                      <button
                        type='button'
                        className='admin-status-button admin-status-button--cancel'
                        disabled={loading}
                        onClick={() => {
                          handleStatusUpdate(event.idEvento, 'CANCELADO').catch(() => {});
                        }}
                      >
                        <span className='material-symbols-outlined'>close</span>
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EventCreator;
