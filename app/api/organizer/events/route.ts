import { NextRequest, NextResponse } from 'next/server';

type EventState = 'BORRADOR' | 'PUBLICADO' | 'CANCELADO';

type EventDate = {
  idFechaEvento: number;
  idFecha: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
};

type Profile = { id: string; label: string };
type Sector = { id: string; nombre: string; capacidad: number };
type TicketType = { id: string; label: string };
type PriceMatrix = Record<string, Record<string, Record<string, number>>>;

type OrganizerEventMetadata = {
  version: string;
  lastUpdated: string;
  creadoPor?: string;
  fechaCreacion?: string;
  ultimaActualizacion?: string;
};

export type OrganizerEvent = {
  idEvento: number;
  idOrganizador: number;
  idCategoria: number;
  titulo: string;
  descripcion: string;
  lugar: string;
  estado: EventState;
  likes: number;
  noInteres: number;
  cantVendidasTotal: number;
  totalRecaudado: number;
  imagenPortada: string;
  imagenLugar: string;
  videoUrl: string;
  fechas: EventDate[];
  perfiles: Profile[];
  sectores: Sector[];
  tiposTicket: TicketType[];
  precios: PriceMatrix;
  metadata: OrganizerEventMetadata;
};

type OrganizerEventPayloadMetadata = Partial<Omit<OrganizerEventMetadata, 'version'>> & {
  version?: string | number;
};

type OrganizerEventPayload = Partial<Omit<OrganizerEvent, 'fechas' | 'metadata'>> & {
  metadata?: OrganizerEventPayloadMetadata;
  eventDates?: EventDate[];
  fechas?: EventDate[];
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

const isOrganizerEvent = (value: unknown): value is OrganizerEvent =>
  typeof value === 'object' &&
  value !== null &&
  'idEvento' in value &&
  'fechas' in value &&
  'titulo' in value;

const normalizeEventPayload = (payload: OrganizerEventPayload): OrganizerEvent => {
  const now = new Date();
  const fallbackId = payload.idEvento ?? now.getTime();
  const rawDates = (payload.eventDates ?? payload.fechas ?? []) as EventDate[];
  const resolvedDates = rawDates.length > 0 ? rawDates : [];

  const metadataSource = payload.metadata ?? {};
  const versionValue = metadataSource.version ?? '1';
  const version =
    typeof versionValue === 'number' ? versionValue.toString() : String(versionValue);
  const nowIso = now.toISOString();
  const lastUpdated =
    metadataSource.lastUpdated ??
    metadataSource.ultimaActualizacion ??
    metadataSource.fechaCreacion ??
    nowIso;
  const createdAt = metadataSource.fechaCreacion ?? lastUpdated;
  const updatedAt = metadataSource.ultimaActualizacion ?? lastUpdated;
  const createdBy =
    metadataSource.creadoPor ?? baseEvent.metadata.creadoPor ?? 'organizer@nexivent.com';

  return {
    idEvento: fallbackId,
    idOrganizador: payload.idOrganizador ?? baseEvent.idOrganizador,
    idCategoria: payload.idCategoria ?? baseEvent.idCategoria,
    titulo: payload.titulo ?? '',
    descripcion: payload.descripcion ?? '',
    lugar: payload.lugar ?? '',
    estado: payload.estado ?? 'BORRADOR',
    likes: payload.likes ?? 0,
    noInteres: payload.noInteres ?? 0,
    cantVendidasTotal: payload.cantVendidasTotal ?? 0,
    totalRecaudado: payload.totalRecaudado ?? 0,
    imagenPortada: payload.imagenPortada ?? '',
    imagenLugar: payload.imagenLugar ?? '',
    videoUrl: payload.videoUrl ?? '',
    fechas: resolvedDates.map((date, index) => ({
      idFechaEvento: date.idFechaEvento ?? fallbackId + index,
      idFecha: date.idFecha ?? fallbackId + index,
      fecha: date.fecha,
      horaInicio: date.horaInicio,
      horaFin: date.horaFin,
    })),
    perfiles: payload.perfiles ?? [],
    sectores: payload.sectores ?? [],
    tiposTicket: payload.tiposTicket ?? [],
    precios: payload.precios ?? {},
    metadata: {
      version,
      lastUpdated,
      creadoPor: createdBy,
      fechaCreacion: createdAt,
      ultimaActualizacion: updatedAt,
    },
  };
};

const parseResponseBody = async (response: Response) => {
  const text = await response.text();
  if (text.length === 0) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const resolveMetadataVersionValue = (value?: string | number) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? value : numeric;
  }
  return 1;
};

const buildUpstreamPayload = (payload: OrganizerEventPayload, normalized: OrganizerEvent) => {
  const metadataSource = payload.metadata ?? {};
  return {
    idEvento: normalized.idEvento,
    idOrganizador: normalized.idOrganizador,
    idCategoria: normalized.idCategoria,
    titulo: normalized.titulo,
    descripcion: normalized.descripcion,
    lugar: normalized.lugar,
    estado: normalized.estado,
    likes: normalized.likes,
    noInteres: normalized.noInteres,
    cantVendidasTotal: normalized.cantVendidasTotal,
    totalRecaudado: normalized.totalRecaudado,
    imagenPortada: normalized.imagenPortada,
    imagenLugar: normalized.imagenLugar,
    videoUrl: normalized.videoUrl,
    eventDates: normalized.fechas.map((date) => ({
      idFechaEvento: date.idFechaEvento,
      idFecha: date.idFecha,
      fecha: date.fecha,
      horaInicio: date.horaInicio,
      horaFin: date.horaFin,
    })),
    perfiles: normalized.perfiles,
    sectores: normalized.sectores,
    tiposTicket: normalized.tiposTicket,
    precios: normalized.precios,
    metadata: {
      version: resolveMetadataVersionValue(
        metadataSource.version ?? normalized.metadata.version
      ),
      creadoPor: metadataSource.creadoPor ?? normalized.metadata.creadoPor,
      fechaCreacion:
        metadataSource.fechaCreacion ??
        normalized.metadata.fechaCreacion ??
        normalized.metadata.lastUpdated,
      ultimaActualizacion:
        metadataSource.ultimaActualizacion ??
        normalized.metadata.ultimaActualizacion ??
        normalized.metadata.lastUpdated,
    },
  };
};

const resolveUpstreamEvent = (candidate: unknown, fallback: OrganizerEvent): OrganizerEvent => {
  if (isOrganizerEvent(candidate)) {
    return candidate;
  }

  if (typeof candidate === 'object' && candidate !== null) {
    const maybeEvent = candidate as OrganizerEventPayload;
    if ('eventDates' in maybeEvent || 'fechas' in maybeEvent) {
      return normalizeEventPayload(maybeEvent);
    }
  }

  return fallback;
};

const baseMetadataTimestamp = new Date().toISOString();

const baseEvent: OrganizerEvent = {
  idEvento: 1,
  idOrganizador: 1,
  idCategoria: 1,
  titulo: 'Showcase de bandas indie',
  descripcion:
    'Una noche para presentar proyectos emergentes en Lima con experiencias inmersivas y visuales.',
  lugar: 'Teatro Canout',
  estado: 'BORRADOR',
  likes: 120,
  noInteres: 12,
  cantVendidasTotal: 0,
  totalRecaudado: 0,
  imagenPortada:
    'https://images.unsplash.com/photo-1470223991234-ebd0ac801d66?w=900&auto=format&fit=crop&q=80',
  imagenLugar:
    'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=900&auto=format&fit=crop&q=80',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  fechas: [
    {
      idFechaEvento: 1,
      idFecha: 1,
      fecha: '2025-03-21',
      horaInicio: '18:00',
      horaFin: '22:30',
    },
    {
      idFechaEvento: 2,
      idFecha: 2,
      fecha: '2025-03-22',
      horaInicio: '18:00',
      horaFin: '22:30',
    },
  ],
  perfiles: [
    { id: 'adulto', label: 'Adulto' },
    { id: 'nino', label: 'Niño' },
  ],
  sectores: [
    { id: 'vip', nombre: 'VIP', capacidad: 180 },
    { id: 'regular', nombre: 'Regular', capacidad: 420 },
    { id: 'platea', nombre: 'Planta baja', capacidad: 200 },
  ],
  tiposTicket: [
    { id: 'regular', label: 'Regular' },
    { id: 'preventa', label: 'Preventa' },
    { id: 'conadis', label: 'Preventa CONADIS' },
  ],
  precios: {
    vip: {
      adulto: { regular: 160, preventa: 145, conadis: 120 },
      nino: { regular: 120, preventa: 110, conadis: 90 },
    },
    regular: {
      adulto: { regular: 90, preventa: 80, conadis: 60 },
      nino: { regular: 70, preventa: 60, conadis: 45 },
    },
    platea: {
      adulto: { regular: 120, preventa: 110, conadis: 95 },
      nino: { regular: 95, preventa: 80, conadis: 65 },
    },
  },
  metadata: {
    version: '1',
    lastUpdated: baseMetadataTimestamp,
    fechaCreacion: baseMetadataTimestamp,
    ultimaActualizacion: baseMetadataTimestamp,
    creadoPor: 'organizer@nexivent.com',
  },
};

let events: OrganizerEvent[] = [baseEvent];

export const dynamic = 'force-dynamic';

const normalizeUpstreamEvent = (payload: Partial<OrganizerEvent>): OrganizerEvent => {
  const now = new Date();
  const fallbackId = payload.idEvento ?? (payload as { ID?: number }).ID ?? payload.idOrganizador ?? now.getTime();
  const rawDates =
    (payload as { eventDates?: EventDate[]; fechas?: EventDate[]; Fechas?: EventDate[] }).fechas ??
    (payload as { eventDates?: EventDate[] }).eventDates ??
    (payload as { Fechas?: EventDate[] }).Fechas ??
    [];
  return {
    idEvento:
      payload.idEvento ??
      (payload as { id?: number }).id ??
      (payload as { ID?: number }).ID ??
      fallbackId,
    idOrganizador:
      payload.idOrganizador ??
      (payload as { OrganizadorID?: number }).OrganizadorID ??
      baseEvent.idOrganizador,
    idCategoria: payload.idCategoria ?? (payload as { CategoriaID?: number }).CategoriaID ?? baseEvent.idCategoria,
    titulo: payload.titulo ?? (payload as { nombre?: string }).nombre ?? (payload as { Titulo?: string }).Titulo ?? '',
    descripcion: payload.descripcion ?? (payload as { Descripcion?: string }).Descripcion ?? '',
    lugar: payload.lugar ?? (payload as { Lugar?: string }).Lugar ?? '',
    estado:
      (payload.estado as OrganizerEvent['estado']) ??
      ((payload as { EventoEstado?: number }).EventoEstado === 1)
  ? 'PUBLICADO'
  : ((payload as { EventoEstado?: number }).EventoEstado === 2)
    ? 'CANCELADO'
    : 'BORRADOR',

    likes: payload.likes ?? (payload as { CantMeGusta?: number }).CantMeGusta ?? 0,
    noInteres: payload.noInteres ?? (payload as { CantNoInteresa?: number }).CantNoInteresa ?? 0,
    cantVendidasTotal: payload.cantVendidasTotal ?? (payload as { CantVendidoTotal?: number }).CantVendidoTotal ?? 0,
    totalRecaudado: payload.totalRecaudado ?? (payload as { TotalRecaudado?: number }).TotalRecaudado ?? 0,
    imagenPortada: payload.imagenPortada ?? (payload as { ImagenPortada?: string }).ImagenPortada ?? '',
    imagenLugar: payload.imagenLugar ?? (payload as { ImagenEscenario?: string }).ImagenEscenario ?? '',
    videoUrl: payload.videoUrl ?? (payload as { VideoPresentacion?: string }).VideoPresentacion ?? '',
    fechas: rawDates.map((date, index) => ({
      idFechaEvento: date.idFechaEvento ?? fallbackId + index,
      idFecha: date.idFecha ?? fallbackId + index,
      fecha: date.fecha,
      horaInicio: date.horaInicio,
      horaFin: date.horaFin,
    })),
    perfiles:
      (payload as { perfiles?: Profile[] }).perfiles ?? (payload as { Perfiles?: Profile[] }).Perfiles ?? [],
    sectores: (payload as { sectores?: Sector[] }).sectores ?? (payload as { Sectores?: Sector[] }).Sectores ?? [],
    tiposTicket:
      (payload as { tiposTicket?: TicketType[] }).tiposTicket ??
      (payload as { TiposTicket?: TicketType[] }).TiposTicket ??
      [],
    precios: (payload as { precios?: PriceMatrix }).precios ?? {},
    metadata: {
      version: '1',
      lastUpdated: now.toISOString(),
      creadoPor: baseEvent.metadata.creadoPor,
      fechaCreacion: baseEvent.metadata.fechaCreacion,
      ultimaActualizacion: now.toISOString(),
    },
  };
};

export async function GET(request: NextRequest) {
  const organizerId =
    resolveNumeric(request.nextUrl.searchParams.get('organizerId')) ??
    resolveNumeric(request.nextUrl.searchParams.get('organizadorId')) ??
    resolveNumeric(process.env.NEXT_PUBLIC_ORGANIZER_ID) ??
    resolveNumeric(process.env.ORGANIZER_ID) ??
    baseEvent.idOrganizador;

  const apiBaseUrl = getOrganizerApiBaseUrl();
  const endpoint =
    organizerId > 0 ? buildEndpoint(apiBaseUrl, `/evento/filter?organizadorId=${organizerId}`) : '';

  if (apiBaseUrl.length === 0 || endpoint.length === 0) {
    // Return base event in mock mode, ensuring we always have at least one event
    const mockEvents = events.length > 0 ? events : [baseEvent];
    return NextResponse.json({
      data: mockEvents,
      metadata: {
        serverTime: new Date().toISOString(),
        source: 'mock:organizer-events',
      },
    });
  }

  try {
    const upstreamResponse = await fetch(endpoint, { cache: 'no-store' });
    const upstreamBody = await parseResponseBody(upstreamResponse);

    if (!upstreamResponse.ok) {
      // fallback to mock if upstream fails but return error status
      if (events.length > 0) {
        return NextResponse.json(
          {
            message: 'La API real respondio con un error al listar los eventos.',
            details: upstreamBody,
            data: events,
          },
          { status: upstreamResponse.status }
        );
      }

      return NextResponse.json(
        {
          message: 'La API real respondio con un error al listar los eventos.',
          details: upstreamBody,
        },
        { status: upstreamResponse.status }
      );
    }

    const isEventLike = (value: unknown) =>
      typeof value === 'object' &&
      value !== null &&
      ('idEvento' in (value as Record<string, unknown>) ||
        'ID' in (value as Record<string, unknown>) ||
        'Titulo' in (value as Record<string, unknown>) ||
        'titulo' in (value as Record<string, unknown>));

    let rawEvents: unknown[] = [];

    const dataField = (upstreamBody as { data?: unknown }).data;
    const eventosField = (upstreamBody as { eventos?: unknown }).eventos;

    if (Array.isArray(dataField) && !Array.isArray(upstreamBody)) {
      rawEvents = dataField as unknown[];
    } else if (!Array.isArray(dataField) && isEventLike(dataField)) {
      rawEvents = [dataField as unknown];
    } else if (Array.isArray(eventosField) && !Array.isArray(upstreamBody)) {
      rawEvents = eventosField as unknown[];
    } else if (!Array.isArray(eventosField) && isEventLike(eventosField)) {
      rawEvents = [eventosField as unknown];
    } else if (Array.isArray(upstreamBody)) {
      rawEvents = upstreamBody as unknown[];
    } else if (isEventLike(upstreamBody)) {
      rawEvents = [upstreamBody];
    }
    const normalizedEvents = rawEvents.map((event) =>
      normalizeUpstreamEvent(event as Partial<OrganizerEvent>)
    );

    events = normalizedEvents.length > 0 ? normalizedEvents : events;
    return NextResponse.json({
      data: normalizedEvents,
      metadata: {
        serverTime: new Date().toISOString(),
        source: endpoint,
        upstreamStatus: upstreamResponse.status,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'No se pudo obtener los eventos desde la API real.',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as OrganizerEventPayload;
    const normalized = normalizeEventPayload(payload);
    const upstreamPayload = buildUpstreamPayload(payload, normalized);
    const apiBaseUrl = getOrganizerApiBaseUrl();

    if (apiBaseUrl.length === 0) {
      return NextResponse.json(
        {
          message: 'NEXT_PUBLIC_API_URL o API_URL no esta configurada. No se pudo sincronizar el evento.',
        },
        { status: 500 }
      );
    }

    const endpoint = buildEndpoint(apiBaseUrl, '/evento/');
    const upstreamResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(upstreamPayload),
      cache: 'no-store',
    });

    const upstreamBody = await parseResponseBody(upstreamResponse);

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          message: 'La API real respondio con un error al crear el evento.',
          details: upstreamBody,
        },
        { status: upstreamResponse.status }
      );
    }

    const candidateData =
      upstreamBody !== null &&
        typeof upstreamBody === 'object' &&
        'data' in (upstreamBody as Record<string, unknown>)
        ? (upstreamBody as Record<string, unknown>).data
        : upstreamBody;

    const storedEvent = resolveUpstreamEvent(candidateData, normalized);

    events = [storedEvent, ...events.filter((event) => event.idEvento !== storedEvent.idEvento)];

    return NextResponse.json(
      {
        message: 'Evento sincronizado con la API real',
        data: upstreamBody ?? storedEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'No se pudo procesar el evento',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
