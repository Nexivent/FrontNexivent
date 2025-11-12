import { NextRequest, NextResponse } from 'next/server';

export type EventReport = {
  idEvento: number;
  nombre: string;
  fecha: string;
  ubicacion: string;
  capacidad: number;
  estado: 'EN_VENTA' | 'AGOTADO' | 'FINALIZADO' | 'CANCELADO';
  ingresosTotales: number;
  ticketsVendidos: number;
  ventasPorTipo: Array<{ tipo: string; vendidos: number; ingresos: number }>;
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

const mockReports: EventReport[] = [
  {
    idEvento: 1024,
    nombre: 'Showcase de bandas indie',
    fecha: '2025-03-21',
    ubicacion: 'Teatro Canout',
    capacidad: 800,
    estado: 'EN_VENTA',
    ingresosTotales: 90500,
    ticketsVendidos: 640,
    ventasPorTipo: [
      { tipo: 'General', vendidos: 320, ingresos: 32000 },
      { tipo: 'VIP', vendidos: 180, ingresos: 36000 },
      { tipo: 'Preventa', vendidos: 110, ingresos: 14300 },
      { tipo: 'Cortesía', vendidos: 30, ingresos: 0 },
    ],
    cargosServicio: 5200,
    comisiones: 3600,
  },
  {
    idEvento: 2048,
    nombre: 'Festival gastronómico Lima Fusión',
    fecha: '2025-04-12',
    ubicacion: 'Parque de la Exposición',
    capacidad: 1200,
    estado: 'AGOTADO',
    ingresosTotales: 135400,
    ticketsVendidos: 1200,
    ventasPorTipo: [
      { tipo: 'General', vendidos: 700, ingresos: 70000 },
      { tipo: 'VIP', vendidos: 300, ingresos: 45000 },
      { tipo: 'Preventa', vendidos: 150, ingresos: 19500 },
      { tipo: 'Cortesía', vendidos: 50, ingresos: 0 },
    ],
    cargosServicio: 8200,
    comisiones: 6100,
  },
  {
    idEvento: 4096,
    nombre: 'Conferencia de tecnología FutureStack',
    fecha: '2025-05-05',
    ubicacion: 'Centro de Convenciones de Lima',
    capacidad: 1500,
    estado: 'EN_VENTA',
    ingresosTotales: 60200,
    ticketsVendidos: 480,
    ventasPorTipo: [
      { tipo: 'General', vendidos: 250, ingresos: 25000 },
      { tipo: 'VIP', vendidos: 90, ingresos: 22500 },
      { tipo: 'Early-bird', vendidos: 120, ingresos: 11000 },
      { tipo: 'Cortesía', vendidos: 20, ingresos: 0 },
    ],
    cargosServicio: 3800,
    comisiones: 2700,
  },
];

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const eventId = searchParams.get('eventId');

  let eventos = mockReports;

  if (start !== null || end !== null) {
    eventos = eventos.filter((event) => {
      const eventDate = new Date(event.fecha).getTime();
      const afterStart = start === null ? true : eventDate >= new Date(start).getTime();
      const beforeEnd = end === null ? true : eventDate <= new Date(end).getTime();
      return afterStart && beforeEnd;
    });
  }

  if (eventId !== null) {
    const parsed = Number(eventId);
    if (!Number.isNaN(parsed)) {
      eventos = eventos.filter((event) => event.idEvento === parsed);
    }
  }

  const response: ReportPayload = {
    resumen: {
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
    },
    eventos,
  };

  return NextResponse.json(response);
}
