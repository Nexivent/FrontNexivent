import { NextRequest, NextResponse } from 'next/server';

type EventDateRange = {
  idFechaEvento: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
};

export type EventReport = {
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
    fechas: [
      { idFechaEvento: 1, fecha: '2025-03-21', horaInicio: '18:00', horaFin: '22:30' },
      { idFechaEvento: 2, fecha: '2025-03-22', horaInicio: '18:00', horaFin: '22:30' },
    ],
    cargosServicio: 5200,
    comisiones: 3600,
  },
  {
    idEvento: 2048,
    nombre: 'Festival gastronómico Lima Fusión',
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
    fechas: [
      { idFechaEvento: 3, fecha: '2025-04-12', horaInicio: '12:00', horaFin: '23:30' },
      { idFechaEvento: 4, fecha: '2025-04-13', horaInicio: '12:00', horaFin: '23:30' },
    ],
    cargosServicio: 8200,
    comisiones: 6100,
  },
  {
    idEvento: 4096,
    nombre: 'Conferencia de tecnología FutureStack',
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
    fechas: [
      { idFechaEvento: 5, fecha: '2025-05-05', horaInicio: '09:00', horaFin: '18:00' },
      { idFechaEvento: 6, fecha: '2025-05-06', horaInicio: '09:00', horaFin: '18:00' },
      { idFechaEvento: 7, fecha: '2025-05-07', horaInicio: '09:00', horaFin: '18:00' },
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
      const matchesRange = event.fechas.some((date) => {
        const dateValue = new Date(date.fecha).getTime();
        const afterStart = start === null ? true : dateValue >= new Date(start).getTime();
        const beforeEnd = end === null ? true : dateValue <= new Date(end).getTime();
        return afterStart && beforeEnd;
      });
      return matchesRange;
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
