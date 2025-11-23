'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';
import Button from '@components/Button/Button';

type EventDateRange = {
  idFechaEvento: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
};

type ReportSummary = {
  eventosActivos: number;
  ingresosTotales: number;
  ticketsVendidos: number;
  promedioOcupacion: number;
};

type EventReport = {
  idEvento: number;
  nombre: string;
  ubicacion: string;
  capacidad: number;
  estado: 'EN_VENTA' | 'AGOTADO' | 'FINALIZADO' | 'CANCELADO';
  ingresosTotales: number;
  ticketsVendidos: number;
  ventasPorTipo: Array<{ tipo: string; vendidos: number; ingresos: number }>;
  fechas: EventDateRange[];
  cargosServicio: number;
  comisiones: number;
};

type ReportResponse = {
  resumen: ReportSummary;
  eventos: EventReport[];
};

const statusCopy: Record<EventReport['estado'], string> = {
  EN_VENTA: 'En venta',
  AGOTADO: 'Agotado',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
};

const statusColor: Record<EventReport['estado'], string> = {
  EN_VENTA: 'publicado',
  AGOTADO: 'yellow',
  FINALIZADO: 'gray',
  CANCELADO: 'cancelado',
};

const formatCurrency = (value: number) => `S/ ${value.toLocaleString()}`;

const resolveOrganizerUserId = () => {
  const envValue = Number(process.env.NEXT_PUBLIC_ORGANIZER_ID);
  if (!Number.isNaN(envValue) && envValue > 0) return envValue;
  const serverValue = Number(process.env.ORGANIZER_ID);
  if (!Number.isNaN(serverValue) && serverValue > 0) return serverValue;
  return 1;
};

const organizerUserId = resolveOrganizerUserId();

const ReportsDashboard: React.FC = () => {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [events, setEvents] = useState<EventReport[]>([]);
  const [filters, setFilters] = useState<{ start: string; end: string; event: 'all' | number }>({
    start: '',
    end: '',
    event: 'all',
  });
  const [eventOptions, setEventOptions] = useState<Array<{ id: number; nombre: string }>>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const fetchReports = useCallback(
    async (start?: string, end?: string, eventId: 'all' | number = 'all') => {
      try {
        setStatus('loading');
        const params = new URLSearchParams();
        params.set('organizerId', String(organizerUserId));
        if (start) params.set('fechaDesde', start);
        if (end) params.set('fechaHasta', end);
        if (eventId !== 'all') params.set('eventId', String(eventId));
        const response = await fetch(
          `/api/organizer/reports${params.size > 0 ? `?${params.toString()}` : ''}`,
          { cache: 'no-store' }
        );
        if (!response.ok) throw new Error('No se pudieron obtener los reportes');
        const data = (await response.json()) as ReportResponse;
        const eventsList = data.eventos ?? [];
        setSummary(
          data.resumen ?? {
            eventosActivos: 0,
            ingresosTotales: 0,
            ticketsVendidos: 0,
            promedioOcupacion: 0,
          }
        );
        setEvents(eventsList);
        setEventOptions((previous) => {
          const merged = new Map<number, string>();
          [
            ...previous,
            ...eventsList.map((event) => ({ id: event.idEvento, nombre: event.nombre })),
          ].forEach((entry) => merged.set(entry.id, entry.nombre));
          return Array.from(merged, ([id, nombre]) => ({ id, nombre }));
        });
        setStatus('idle');
      } catch (error) {
        console.error('Organizer reports fetch failed', error);
        setStatus('error');
      }
    },
    [organizerUserId]
  );

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const handleFilter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void fetchReports(filters.start || undefined, filters.end || undefined, filters.event);
  };

  const capacityUsage = useMemo(() => {
    const totalCapacidad = events.reduce((sum, current) => sum + current.capacidad, 0);
    const totalVendidos = events.reduce((sum, current) => sum + current.ticketsVendidos, 0);
    return totalCapacidad === 0 ? 0 : Math.round((totalVendidos / totalCapacidad) * 100);
  }, [events]);
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());
  const toggleEvent = (eventId: number) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };
  return (
    <Master>
      <Section className='organizer-hero hero-offset'>
        <div className='container'>
          <div className='organizer-hero__content'>
            <Heading type={1} color='white' text='Reportes de eventos' />
            <p className='gray'>
              Analiza el desempeño de tus eventos filtrando por fecha o evento para entender
              ingresos, ocupación y ventas por tipo de ticket.
            </p>
            <div className='organizer-cta-row'>
              <ButtonLink
                color='yellow-filled'
                text='Volver al inicio'
                leftIcon='chevron_left'
                url='organizer'
              />
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className='container'>
          <div className='report-filters'>
            <form className='field-grid report-filter-grid' onSubmit={handleFilter}>
              <label className='field'>
                <span className='field-label'>Desde</span>
                <input
                  className='input-text'
                  type='date'
                  value={filters.start}
                  onChange={(event) =>
                    setFilters((previous) => ({ ...previous, start: event.target.value }))
                  }
                />
              </label>
              <label className='field'>
                <span className='field-label'>Hasta</span>
                <input
                  className='input-text'
                  type='date'
                  value={filters.end}
                  onChange={(event) =>
                    setFilters((previous) => ({ ...previous, end: event.target.value }))
                  }
                />
              </label>
              <label className='field'>
                <span className='field-label'>Evento</span>
                <select
                  className='input-text'
                  value={filters.event === 'all' ? 'all' : filters.event}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      event: event.target.value === 'all' ? 'all' : Number(event.target.value),
                    }))
                  }
                >
                  <option value='all'>Todos los eventos</option>
                  {eventOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <div className='field report-filter-actions'>
                <span className='field-label'>&nbsp;</span>
                <Button
                  type='button'
                  color='gray-overlay'
                  text='Limpiar'
                  leftIcon='backspace'
                  onClick={() => {
                    setFilters({ start: '', end: '', event: 'all' });
                    void fetchReports();
                  }}
                />
                <Button type='submit' color='yellow-filled' text='Aplicar' rightIcon='filter_alt' />
              </div>
            </form>
          </div>
          
          {status === 'loading' && <p className='gray'>Cargando reportes...</p>}
          {status === 'error' && (
            <p className='field-hint'>No se pudieron cargar los reportes. Intenta nuevamente.</p>
          )}

          {summary !== null && (
            <div className='report-summary-grid'>
              <div className='report-summary-card'>
                <span className='label'>Eventos activos</span>
                <strong>{summary.eventosActivos}</strong>
              </div>
              <div className='report-summary-card'>
                <span className='label'>Ingresos totales</span>
                <strong>{formatCurrency(summary.ingresosTotales)}</strong>
              </div>
              <div className='report-summary-card'>
                <span className='label'>Tickets vendidos</span>
                <strong>{summary.ticketsVendidos.toLocaleString()}</strong>
              </div>
              <div className='report-summary-card'>
                <span className='label'>Ocupación promedio</span>
                <strong>{summary.promedioOcupacion}%</strong>
              </div>
              <div className='report-summary-card'>
                <span className='label'>Uso de capacidad</span>
                <strong>{capacityUsage}%</strong>
              </div>
            </div>
          )}

          {events.map((event) => {
  const primaryDate = event.fechas[0];
  const dateLabel =
    primaryDate !== undefined
      ? `${new Date(primaryDate.fecha).toLocaleDateString('es-PE')} · ${primaryDate.horaInicio} - ${primaryDate.horaFin}`
      : 'Fechas por definir';
  
  const isExpanded = expandedEvents.has(event.idEvento);

  return (
    <div key={event.idEvento} className='event-report'>
      {/* Encabezado clickeable */}
      <button
        type='button'
        className='event-collapse-trigger'
        onClick={() => toggleEvent(event.idEvento)}
        aria-expanded={isExpanded}
      >
        <div className='event-header'>
          <div className='event-header-info'>
            <h3>{event.nombre}</h3>
            <p className='gray'>
              {dateLabel} · {event.ubicacion} · Capacidad:{' '}
              {event.capacidad.toLocaleString()}
            </p>
          </div>
          <span className={`status-pill ${statusColor[event.estado]}`}>
            {statusCopy[event.estado]}
          </span>
        </div>

        <div className='event-summary-grid'>
          <div>
            <span className='label'>Ingresos totales</span>
            <strong>{formatCurrency(event.ingresosTotales)}</strong>
          </div>
          <div>
            <span className='label'>Tickets vendidos</span>
            <strong>{event.ticketsVendidos.toLocaleString()}</strong>
          </div>
          <div>
            <span className='label'>Cargos de servicio</span>
            <strong>{formatCurrency(event.cargosServicio)}</strong>
          </div>
          <div>
            <span className='label'>Comisiones</span>
            <strong>{formatCurrency(event.comisiones)}</strong>
          </div>
        </div>

        {/* Indicador de expandir/colapsar */}
        <div className={`collapse-icon ${isExpanded ? 'expanded' : ''}`}>
          <span className='material-symbols-outlined'>expand_more</span>
        </div>
      </button>

      {/* Contenido desplegable */}
      <div className={`event-details-grid ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className='event-card'>
          <h4>Ventas por tipo</h4>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Vendidos</th>
                <th>Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {event.ventasPorTipo.map((ticket) => (
                <tr key={ticket.tipo}>
                  <td>{ticket.tipo}</td>
                  <td>{ticket.vendidos.toLocaleString()}</td>
                  <td>{formatCurrency(ticket.ingresos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='event-card'>
          <h4>Calendario</h4>
          <ul className='event-date-list'>
            {event.fechas.map((date) => (
              <li key={date.idFechaEvento}>
                <div>
                  <strong>{new Date(date.fecha).toLocaleDateString('es-PE')}</strong>
                  <span>
                    {date.horaInicio} - {date.horaFin}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className='event-card'>
          <h4>Distribución vs capacidad</h4>
          <div className='ticket-share'>
            {event.ventasPorTipo.map((ticket) => {
              const percent = Math.min(
                100,
                Math.round((ticket.vendidos / event.capacidad) * 100)
              );
              return (
                <div key={ticket.tipo} className='ticket-share__item'>
                  <div className='ticket-share__label'>
                    <span>{ticket.tipo}</span>
                    <strong>
                      {ticket.vendidos.toLocaleString()} /{' '}
                      {event.capacidad.toLocaleString()}
                    </strong>
                  </div>
                  <div className='ticket-share__bar'>
                    <div style={{ width: `${percent}%` }} />
                  </div>
                  <small>{percent}% de la capacidad total</small>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
})}
        </div>
      </Section>
    </Master>
  );
};

const ReportsPage: React.FC = () => <ReportsDashboard />;

export default ReportsPage;
