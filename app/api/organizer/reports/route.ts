import { NextRequest, NextResponse } from 'next/server';

type EventDateRange = {
  idFechaEvento: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
};

type TicketBreakdown = { tipo: string; vendidos: number; ingresos: number };

export type EventReport = {
  idEvento: number;
  nombre: string;
  ubicacion: string;
  capacidad: number;
  estado: 'EN_VENTA' | 'AGOTADO' | 'FINALIZADO' | 'CANCELADO';
  ingresosTotales: number;
  ticketsVendidos: number;
  ventasPorTipo: TicketBreakdown[];
  fechas: EventDateRange[];
  cargosServicio: number;
  comisiones: number;
};

type ReportPayload = {
  resumen: {
    eventosActivos: number;
    ingresosTotales: number;
    ticketsVendidos: number;
    promedioOcupacion: number;
  };
  eventos: EventReport[];
};

type UpstreamTicket = {
  sector?: string;
  tipo?: string;
  vendidos?: number;
  ingresos?: number;
};

type UpstreamDate = {
  idFechaEvento?: number;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
};

type UpstreamEventReport = {
  idEvento?: number | string;
  nombre?: string;
  ubicacion?: string;
  capacidad?: number | string;
  estado?: string;
  ingresosTotales?: number;
  ticketsVendidos?: number;
  ventasPorSector?: UpstreamTicket[];
  ventasPorTipo?: UpstreamTicket[];
  fechas?: UpstreamDate[];
  cargosServicio?: number;
  comisiones?: number;
};

const getOrganizerApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_URL ??
    process.env.NEXIVENT_API_URL ??
    '') as string;

const buildEndpoint = (baseUrl: string, path: string) => {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const resolveNumeric = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const resolveStatus = (value?: string | null): EventReport['estado'] => {
  const normalized = (value ?? '').toUpperCase();
  if (normalized === 'AGOTADO') return 'AGOTADO';
  if (normalized === 'FINALIZADO') return 'FINALIZADO';
  if (normalized === 'CANCELADO') return 'CANCELADO';
  return 'EN_VENTA';
};

const normalizeTicket = (ticket: UpstreamTicket, index: number): TicketBreakdown => {
  const sold = Number(ticket.vendidos ?? 0);
  const revenue = Number(ticket.ingresos ?? 0);
  return {
    tipo: ticket.tipo ?? ticket.sector ?? `Sector ${index + 1}`,
    vendidos: Number.isNaN(sold) ? 0 : sold,
    ingresos: Number.isNaN(revenue) ? 0 : revenue,
  };
};

const normalizeDate = (date: UpstreamDate, fallbackId: number): EventDateRange => {
  const dateValue = date.fecha ?? '';
  return {
    idFechaEvento: date.idFechaEvento ?? fallbackId,
    fecha: dateValue,
    horaInicio: date.horaInicio ?? '',
    horaFin: date.horaFin ?? '',
  };
};

const normalizeEvent = (payload: UpstreamEventReport, fallbackId: number): EventReport => {
  const eventId = resolveNumeric(payload.idEvento) ?? fallbackId;
  const capacity = Number(payload.capacidad ?? 0);
  const tickets = Number(payload.ticketsVendidos ?? 0);
  const revenue = Number(payload.ingresosTotales ?? 0);

  const ticketsBreakdown = Array.isArray(payload.ventasPorSector)
    ? payload.ventasPorSector
    : Array.isArray(payload.ventasPorTipo)
      ? payload.ventasPorTipo
      : [];

  const dates = Array.isArray(payload.fechas) ? payload.fechas : [];

  return {
    idEvento: eventId,
    nombre: payload.nombre ?? `Evento ${eventId}`,
    ubicacion: payload.ubicacion ?? '',
    capacidad: Number.isNaN(capacity) ? 0 : capacity,
    estado: resolveStatus(payload.estado),
    ingresosTotales: Number.isNaN(revenue) ? 0 : revenue,
    ticketsVendidos: Number.isNaN(tickets) ? 0 : tickets,
    ventasPorTipo: ticketsBreakdown.map((ticket, index) => normalizeTicket(ticket, index)),
    fechas: dates.map((date, index) => normalizeDate(date, eventId + index)),
    cargosServicio: Number(payload.cargosServicio ?? 0),
    comisiones: Number(payload.comisiones ?? 0),
  };
};

const buildSummary = (events: EventReport[]): ReportPayload['resumen'] => {
  const ingresosTotales = events.reduce((sum, event) => sum + event.ingresosTotales, 0);
  const ticketsVendidos = events.reduce((sum, event) => sum + event.ticketsVendidos, 0);
  const eventosActivos = events.filter((event) => event.estado === 'EN_VENTA' || event.estado === 'AGOTADO').length;
  const promedioOcupacion =
    events.length === 0
      ? 0
      : Math.round(
          (events.reduce((sum, event) => {
            const capacidad = Math.max(1, event.capacidad);
            return sum + event.ticketsVendidos / capacidad;
          }, 0) / events.length) *
            100
        );

  return { eventosActivos, ingresosTotales, ticketsVendidos, promedioOcupacion };
};

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const organizerId =
    resolveNumeric(searchParams.get('organizerId')) ??
    resolveNumeric(searchParams.get('organizadorId')) ??
    resolveNumeric(process.env.NEXT_PUBLIC_ORGANIZER_ID) ??
    resolveNumeric(process.env.ORGANIZER_ID);

  if (organizerId === null) {
    return NextResponse.json(
      { message: 'organizerId no es valido. Configura NEXT_PUBLIC_ORGANIZER_ID o envia el parametro.' },
      { status: 400 }
    );
  }

  const apiBaseUrl = getOrganizerApiBaseUrl();
  if (apiBaseUrl.length === 0) {
    return NextResponse.json(
      { message: 'NEXT_PUBLIC_API_URL o API_URL no esta configurada. No se pudo obtener reportes.' },
      { status: 500 }
    );
  }

  const fechaDesde = searchParams.get('fechaDesde') ?? searchParams.get('start');
  const fechaHasta = searchParams.get('fechaHasta') ?? searchParams.get('end');
  const eventId = resolveNumeric(searchParams.get('eventId'));

  const upstreamQuery = new URLSearchParams();
  if (fechaDesde) upstreamQuery.set('fechaDesde', fechaDesde);
  if (fechaHasta) upstreamQuery.set('fechaHasta', fechaHasta);

  const upstreamUrl = `${buildEndpoint(apiBaseUrl, `/organizador/${organizerId}/eventos/reporte`)}${
    upstreamQuery.size > 0 ? `?${upstreamQuery.toString()}` : ''
  }`;

  try {
    const upstreamResponse = await fetch(upstreamUrl, { cache: 'no-store' });
    if (!upstreamResponse.ok) {
      const detail = await upstreamResponse.text();
      return NextResponse.json(
        {
          message: 'No se pudo obtener el reporte del organizador.',
          detail: detail.length > 0 ? detail : upstreamResponse.statusText,
        },
        { status: upstreamResponse.status }
      );
    }

    const rawPayload = (await upstreamResponse.json()) as unknown;
    const upstreamEvents = Array.isArray(rawPayload)
      ? rawPayload
      : Array.isArray((rawPayload as { data?: unknown })?.data)
        ? ((rawPayload as { data?: unknown[] }).data as unknown[])
        : [];

    const normalizedEvents = upstreamEvents.map((event, index) =>
      normalizeEvent((event ?? {}) as UpstreamEventReport, Date.now() + index)
    );

    const filteredEvents =
      eventId === null ? normalizedEvents : normalizedEvents.filter((event) => event.idEvento === eventId);

    const response: ReportPayload = {
      resumen: buildSummary(filteredEvents),
      eventos: filteredEvents,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Ocurrio un error al obtener los reportes del organizador.',
        detail: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
