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

const EVENT_DRAFT_STORAGE_KEY = 'organizer-event-drafts';

const baseReports: EventReport[] = [
  {
    idEvento: 1024,
    nombre: 'Showcase de bandas indie',
    ubicacion: 'Teatro Canout',
    capacidad: 800,
    estado: 'EN_VENTA',
    ingresosTotales: 90500,
    ticketsVendidos: 640,
    ventasPorTipo: [
      { tipo: 'General', vendidos: 320, ingresos: 32000 },
      { tipo: 'VIP', vendidos: 180, ingresos: 36000 },
      { tipo: 'Preventa', vendidos: 110, ingresos: 14300 },
      { tipo: 'Cortesia', vendidos: 30, ingresos: 0 },
    ],
    fechas: [
      { idFechaEvento: 1, fecha: '2025-03-21', horaInicio: '18:00', horaFin: '22:30' },
      { idFechaEvento: 2, fecha: '2025-03-22', horaInicio: '18:00', horaFin: '22:30' },
    ],
    cargosServicio: 5200,
    comisiones: 3600,
  },
  {
    idEvento: 2048,
    nombre: 'Festival gastronomico Lima Fusion',
    ubicacion: 'Parque de la Exposicion',
    capacidad: 1200,
    estado: 'AGOTADO',
    ingresosTotales: 135400,
    ticketsVendidos: 1200,
    ventasPorTipo: [
      { tipo: 'General', vendidos: 700, ingresos: 70000 },
      { tipo: 'VIP', vendidos: 300, ingresos: 45000 },
      { tipo: 'Preventa', vendidos: 150, ingresos: 19500 },
      { tipo: 'Cortesia', vendidos: 50, ingresos: 0 },
    ],
    fechas: [
      { idFechaEvento: 3, fecha: '2025-04-12', horaInicio: '12:00', horaFin: '23:30' },
      { idFechaEvento: 4, fecha: '2025-04-13', horaInicio: '12:00', horaFin: '23:30' },
    ],
    cargosServicio: 8200,
    comisiones: 6100,
  },
  {
    idEvento: 4096,
    nombre: 'Conferencia de tecnologia FutureStack',
    ubicacion: 'Centro de Convenciones de Lima',
    capacidad: 1500,
    estado: 'EN_VENTA',
    ingresosTotales: 60200,
    ticketsVendidos: 480,
    ventasPorTipo: [
      { tipo: 'General', vendidos: 250, ingresos: 25000 },
      { tipo: 'VIP', vendidos: 90, ingresos: 22500 },
      { tipo: 'Early-bird', vendidos: 120, ingresos: 11000 },
      { tipo: 'Cortesia', vendidos: 20, ingresos: 0 },
    ],
    fechas: [
      { idFechaEvento: 5, fecha: '2025-05-05', horaInicio: '09:00', horaFin: '18:00' },
      { idFechaEvento: 6, fecha: '2025-05-06', horaInicio: '09:00', horaFin: '18:00' },
      { idFechaEvento: 7, fecha: '2025-05-07', horaInicio: '09:00', horaFin: '18:00' },
    ],
    cargosServicio: 3800,
    comisiones: 2700,
  },
];

const getReportEventOptions = (): Array<{ id: number; nombre: string }> => {
  const fallback = Array.from(
    new Map(baseReports.map((event) => [event.idEvento, event.nombre])).entries()
  ).map(([id, nombre]) => ({ id, nombre }));

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(EVENT_DRAFT_STORAGE_KEY);
    const stored = raw ? (JSON.parse(raw) as Array<{ idEvento?: number; titulo?: string }>) : [];
    const merged = new Map<number, string>();
    fallback.forEach((event) => merged.set(event.id, event.nombre));
    stored.forEach((event) => {
      if (typeof event.idEvento === 'number' && event.idEvento > 0) {
        const title =
          typeof event.titulo === 'string' && event.titulo.trim().length > 0
            ? event.titulo
            : `Evento #${event.idEvento}`;
        merged.set(event.idEvento, title);
      }
    });
    return Array.from(merged.entries()).map(([id, nombre]) => ({ id, nombre }));
  } catch (error) {
    console.error('No se pudieron leer los eventos almacenados para reportes.', error);
    return fallback;
  }
};

const getReportData = (
  start?: string,
  end?: string,
  eventId: 'all' | number = 'all'
): ReportResponse => {
  let eventos = [...baseReports];

  if (start !== undefined || end !== undefined) {
    eventos = eventos.filter((event) =>
      event.fechas.some((date) => {
        const dateValue = new Date(date.fecha).getTime();
        const afterStart = start === undefined ? true : dateValue >= new Date(start).getTime();
        const beforeEnd = end === undefined ? true : dateValue <= new Date(end).getTime();
        return afterStart && beforeEnd;
      })
    );
  }

  if (eventId !== 'all') {
    eventos = eventos.filter((event) => event.idEvento === eventId);
  }

  const resumen = {
    eventosActivos: eventos.filter((event) => event.estado === 'EN_VENTA').length,
    ingresosTotales: eventos.reduce((sum, event) => sum + event.ingresosTotales, 0),
    ticketsVendidos: eventos.reduce((sum, event) => sum + event.ticketsVendidos, 0),
    promedioOcupacion:
      eventos.length === 0
        ? 0
        : Math.round(
            (eventos.reduce((sum, event) => sum + event.ticketsVendidos / event.capacidad, 0) /
              eventos.length) *
              100
          ),
  };

  return { resumen, eventos };
};

const simulateReportDelay = () => new Promise((resolve) => setTimeout(resolve, 350));

const ReportsDashboard: React.FC = () => {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [events, setEvents] = useState<EventReport[]>([]);
  const [filters, setFilters] = useState<{ start: string; end: string; event: 'all' | number }>({
    start: '',
    end: '',
    event: 'all',
  });
  const [eventOptions, setEventOptions] = useState<Array<{ id: number; nombre: string }>>(
    () => getReportEventOptions()
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    const refreshOptions = () => setEventOptions(getReportEventOptions());
    refreshOptions();
    window.addEventListener('focus', refreshOptions);
    return () => {
      window.removeEventListener('focus', refreshOptions);
    };
  }, []);

  const fetchReports = useCallback(
    async (start?: string, end?: string, eventId: 'all' | number = 'all') => {
      try {
        setStatus('loading');
        await simulateReportDelay();
        const data = getReportData(start, end, eventId);
        setSummary(data.resumen);
        setEvents(data.eventos);
        setStatus('idle');
      } catch {
        setStatus('error');
      }
    },
    []
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
              <ButtonLink
                color='gray-overlay'
                text='Crear eventos'
                rightIcon='arrow_forward'
                url='organizer/events'
              />
              <ButtonLink
                color='yellow-overlay'
                text='Cupones'
                rightIcon='arrow_outward'
                url='organizer/coupons'
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

            return (
              <div key={event.idEvento} className='event-report'>
                <div className='event-header'>
                  <div>
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

                <div className='event-details-grid'>
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
