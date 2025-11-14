import { NextRequest, NextResponse } from 'next/server';

type EventState = 'BORRADOR' | 'PUBLICADO' | 'CANCELADO';

type EventDate = {
  idFechaEvento: number;
  idFecha: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
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
  perfiles: Array<{ id: string; label: string }>;
  sectores: Array<{ id: string; nombre: string; capacidad: number }>;
  tiposTicket: Array<{ id: string; label: string }>;
  precios: Record<string, Record<string, Record<string, number>>>;
  metadata: {
    version: string;
    lastUpdated: string;
  };
};

const baseEvent: OrganizerEvent = {
  idEvento: 1024,
  idOrganizador: 44,
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
    version: 'v1',
    lastUpdated: new Date().toISOString(),
  },
};

let events: OrganizerEvent[] = [baseEvent];

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    data: events,
    metadata: {
      serverTime: new Date().toISOString(),
      source: 'mock:organizer-events',
    },
  });
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as OrganizerEvent;
  const now = new Date().toISOString();

  const normalized: OrganizerEvent = {
    ...payload,
    idEvento: payload.idEvento ?? Date.now(),
    likes: payload.likes ?? 0,
    noInteres: payload.noInteres ?? 0,
    fechas:
      payload.fechas?.map((fecha) => ({
        ...fecha,
        idFechaEvento: fecha.idFechaEvento ?? Date.now(),
        idFecha: fecha.idFecha ?? Date.now(),
      })) ?? [],
    metadata: {
      version: payload.metadata?.version ?? 'v1',
      lastUpdated: now,
    },
  };

  events = [normalized, ...events.filter((event) => event.idEvento !== normalized.idEvento)];

  return NextResponse.json(
    {
      message: 'Evento recibido en el mock y guardado en memoria',
      data: normalized,
    },
    { status: 201 }
  );
}
