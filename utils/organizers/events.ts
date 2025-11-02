export type EventStatus = 'BORRADOR' | 'PUBLICADO' | 'CANCELADO';

export interface TicketTierBase {
  id: string;
  name: string;
  currency: string;
  price: number;
  available: number;
}

export interface AdminEventBase {
  idOrganizador: number;
  idCategoria: number;
  titulo: string;
  descripcion: string;
  lugar: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  estado: EventStatus;
  like: number;
  noInteres: number;
  comentario: string[];
  ticketTiers: TicketTierBase[];
  imagenDestacada?: string;
}

export interface AdminEvent extends AdminEventBase {
  idEvento: number;
}

export type AdminEventPayload = AdminEventBase;

export interface AdminEventCategory {
  idCategoria: number;
  nombre: string;
  descripcion: string;
}

export interface AdminOrganizer {
  idOrganizador: number;
  nombre: string;
  contacto: string;
}

const eventCategories: AdminEventCategory[] = [
  {
    idCategoria: 10,
    nombre: 'Conciertos',
    descripcion: 'Presentaciones musicales y shows en vivo.',
  },
  {
    idCategoria: 11,
    nombre: 'Festivales',
    descripcion: 'Eventos de varios días con múltiples experiencias.',
  },
  {
    idCategoria: 12,
    nombre: 'Corporativos',
    descripcion: 'Congresos, lanzamientos y conferencias empresariales.',
  },
  {
    idCategoria: 13,
    nombre: 'Deportes',
    descripcion: 'Partidos, torneos y experiencias deportivas.',
  },
];

const organizers: AdminOrganizer[] = [
  {
    idOrganizador: 201,
    nombre: 'Nexivent Live',
    contacto: 'live@nexivent.io',
  },
  {
    idOrganizador: 202,
    nombre: 'Aurora Entertainment',
    contacto: 'contacto@auroraentertainment.com',
  },
  {
    idOrganizador: 203,
    nombre: 'Festival Makers',
    contacto: 'hola@festivalmakers.pe',
  },
];

let eventsDb: AdminEvent[] = [
  {
    idEvento: 501,
    idOrganizador: 201,
    idCategoria: 10,
    titulo: 'Sunset Electro Night',
    descripcion:
      'Experiencia inmersiva con DJs internacionales, mapping y zonas lounge. Incluye barra premium y áreas temáticas.',
    lugar: 'Costa Verde Arena, Lima',
    fechaHoraInicio: '2024-11-15T19:30',
    fechaHoraFin: '2024-11-16T02:30',
    estado: 'PUBLICADO',
    like: 2410,
    noInteres: 62,
    comentario: [],
    ticketTiers: [
      {
        id: 'backstage',
        name: 'Backstage Experience',
        currency: 'PEN',
        price: 520,
        available: 90,
      },
      {
        id: 'lounge',
        name: 'Zona Lounge',
        currency: 'PEN',
        price: 320,
        available: 340,
      },
      {
        id: 'general',
        name: 'Acceso General',
        currency: 'PEN',
        price: 180,
        available: 850,
      },
    ],
    imagenDestacada: '/images/events/sunset-electro.jpg',
  },
  {
    idEvento: 502,
    idOrganizador: 202,
    idCategoria: 12,
    titulo: 'Summit Innovación 2024',
    descripcion:
      'Encuentro corporativo con charlas magistrales, sesiones hands-on y networking para líderes de tecnología.',
    lugar: 'Centro de Convenciones de Lima',
    fechaHoraInicio: '2024-09-05T08:00',
    fechaHoraFin: '2024-09-05T19:30',
    estado: 'BORRADOR',
    like: 185,
    noInteres: 12,
    comentario: [],
    ticketTiers: [
      {
        id: 'platinum',
        name: 'Networking Platinum',
        currency: 'PEN',
        price: 940,
        available: 60,
      },
      {
        id: 'business',
        name: 'Pase Corporativo',
        currency: 'PEN',
        price: 620,
        available: 220,
      },
      {
        id: 'daypass',
        name: 'Day Pass Innovación',
        currency: 'PEN',
        price: 420,
        available: 450,
      },
    ],
    imagenDestacada: '/images/events/innovation-summit.jpg',
  },
];

const cloneEvents = (events: AdminEvent[]): AdminEvent[] => {
  return events.map((event) => ({
    ...event,
    ticketTiers: event.ticketTiers.map((tier) => ({ ...tier })),
    comentario: [...event.comentario],
  }));
};

const listEvents = async (): Promise<AdminEvent[]> => {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve(cloneEvents(eventsDb));
    }, 420);
  });
};

const createEvent = async (payload: AdminEventPayload): Promise<AdminEvent> => {
  return await new Promise((resolve) => {
    setTimeout(() => {
      const newEvent: AdminEvent = {
        ...payload,
        idEvento: Date.now(),
        comentario: [...payload.comentario],
        ticketTiers: payload.ticketTiers.map((tier) => ({ ...tier })),
      };

      eventsDb = [newEvent, ...eventsDb];

      resolve({ ...newEvent, ticketTiers: newEvent.ticketTiers.map((tier) => ({ ...tier })) });
    }, 420);
  });
};

const updateEventStatus = async (idEvento: number, estado: EventStatus): Promise<AdminEvent | null> => {
  return await new Promise((resolve) => {
    setTimeout(() => {
      const index = eventsDb.findIndex((event) => event.idEvento === idEvento);

      if (index === -1) {
        resolve(null);

        return;
      }

      eventsDb[index] = {
        ...eventsDb[index],
        estado,
      };

      resolve({ ...eventsDb[index], ticketTiers: eventsDb[index].ticketTiers.map((tier) => ({ ...tier })) });
    }, 320);
  });
};

const adminEventApi = {
  listEvents,
  createEvent,
  updateEventStatus,
};

export { adminEventApi, eventCategories, organizers };
