export type EventStatus = 'BORRADOR' | 'PUBLICADO' | 'CANCELADO';

export type DiscountType = 'PORCENTAJE' | 'MONTO';

export type TicketPhaseState = 'BORRADOR' | 'ACTIVO' | 'PAUSADO' | 'AGOTADO' | 'FINALIZADO';

export interface BuyerProfile {
  id: string;
  name: string;
  description?: string;
}

export interface TicketSector {
  id: string;
  name: string;
  capacity: number;
}

export interface DiscountCoupon {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  limitPerUser: number;
  isActive: boolean;
}

export interface TaxConfig {
  currency: 'PEN';
  taxType: DiscountType;
  taxValue: number;
  feeType: DiscountType;
  feeValue: number;
}

export interface TicketPhaseCombination {
  id: string;
  sectorId: string;
  profileId: string;
  basePrice: number;
  allocation: number;
}

export interface TicketPhase {
  id: string;
  name: string;
  ticketType: string;
  startDate: string;
  endDate: string;
  state: TicketPhaseState;
  combinations: TicketPhaseCombination[];
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
  currency: 'PEN';
  buyerProfiles: BuyerProfile[];
  ticketSectors: TicketSector[];
  ticketPhases: TicketPhase[];
  discounts: DiscountCoupon[];
  taxConfig: TaxConfig;
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
    currency: 'PEN',
    buyerProfiles: [
      { id: 'adulto', name: 'Adulto', description: 'Mayores de 18 años' },
      { id: 'conadis', name: 'CONADIS', description: 'Beneficio para personas registradas' },
    ],
    ticketSectors: [
      { id: 'backstage', name: 'Backstage', capacity: 90 },
      { id: 'lounge', name: 'Zona Lounge', capacity: 340 },
      { id: 'general', name: 'Acceso General', capacity: 850 },
    ],
    ticketPhases: [
      {
        id: 'preventavip',
        name: 'Fase 1',
        ticketType: 'Preventa',
        startDate: '2024-07-01T10:00',
        endDate: '2024-09-01T23:59',
        state: 'ACTIVO',
        combinations: [
          {
            id: 'backstage-adulto-preventa',
            sectorId: 'backstage',
            profileId: 'adulto',
            basePrice: 520,
            allocation: 60,
          },
          {
            id: 'lounge-adulto-preventa',
            sectorId: 'lounge',
            profileId: 'adulto',
            basePrice: 320,
            allocation: 280,
          },
          {
            id: 'general-adulto-preventa',
            sectorId: 'general',
            profileId: 'adulto',
            basePrice: 150,
            allocation: 700,
          },
          {
            id: 'general-conadis-preventa',
            sectorId: 'general',
            profileId: 'conadis',
            basePrice: 90,
            allocation: 60,
          },
        ],
      },
      {
        id: 'regularvip',
        name: 'Fase 2',
        ticketType: 'Regular',
        startDate: '2024-09-02T00:00',
        endDate: '2024-11-14T23:59',
        state: 'BORRADOR',
        combinations: [
          {
            id: 'backstage-adulto-regular',
            sectorId: 'backstage',
            profileId: 'adulto',
            basePrice: 580,
            allocation: 90,
          },
          {
            id: 'lounge-adulto-regular',
            sectorId: 'lounge',
            profileId: 'adulto',
            basePrice: 360,
            allocation: 340,
          },
          {
            id: 'general-adulto-regular',
            sectorId: 'general',
            profileId: 'adulto',
            basePrice: 190,
            allocation: 850,
          },
          {
            id: 'general-conadis-regular',
            sectorId: 'general',
            profileId: 'conadis',
            basePrice: 110,
            allocation: 80,
          },
        ],
      },
    ],
    discounts: [
      {
        id: 'fan10',
        code: 'FAN10',
        type: 'PORCENTAJE',
        value: 10,
        limitPerUser: 2,
        isActive: true,
      },
      {
        id: 'vip-30',
        code: 'VIP30',
        type: 'MONTO',
        value: 30,
        limitPerUser: 1,
        isActive: false,
      },
    ],
    taxConfig: {
      currency: 'PEN',
      taxType: 'PORCENTAJE',
      taxValue: 18,
      feeType: 'PORCENTAJE',
      feeValue: 6,
    },
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
    currency: 'PEN',
    buyerProfiles: [
      {
        id: 'ejecutivo',
        name: 'Ejecutivo',
        description: 'Acceso completo a conferencias y workshops',
      },
      {
        id: 'startup',
        name: 'Startup',
        description: 'Programa preferencial para emprendimientos registrados',
      },
    ],
    ticketSectors: [
      { id: 'auditorio', name: 'Auditorio Principal', capacity: 500 },
      { id: 'workshop', name: 'Salas Workshop', capacity: 160 },
    ],
    ticketPhases: [
      {
        id: 'preventa-summit',
        name: 'Lanzamiento',
        ticketType: 'Preventa',
        startDate: '2024-05-15T09:00',
        endDate: '2024-07-31T23:59',
        state: 'ACTIVO',
        combinations: [
          {
            id: 'auditorio-ejecutivo-preventa',
            sectorId: 'auditorio',
            profileId: 'ejecutivo',
            basePrice: 820,
            allocation: 320,
          },
          {
            id: 'auditorio-startup-preventa',
            sectorId: 'auditorio',
            profileId: 'startup',
            basePrice: 540,
            allocation: 120,
          },
          {
            id: 'workshop-ejecutivo-preventa',
            sectorId: 'workshop',
            profileId: 'ejecutivo',
            basePrice: 650,
            allocation: 120,
          },
          {
            id: 'workshop-startup-preventa',
            sectorId: 'workshop',
            profileId: 'startup',
            basePrice: 430,
            allocation: 40,
          },
        ],
      },
    ],
    discounts: [
      {
        id: 'team5',
        code: 'TEAM5',
        type: 'PORCENTAJE',
        value: 5,
        limitPerUser: 4,
        isActive: true,
      },
    ],
    taxConfig: {
      currency: 'PEN',
      taxType: 'PORCENTAJE',
      taxValue: 18,
      feeType: 'MONTO',
      feeValue: 15,
    },
    imagenDestacada: '/images/events/innovation-summit.jpg',
  },
];

const cloneEvents = (events: AdminEvent[]): AdminEvent[] => {
  return events.map((event) => ({
    ...event,
    comentario: [...event.comentario],
    buyerProfiles: event.buyerProfiles.map((profile) => ({ ...profile })),
    ticketSectors: event.ticketSectors.map((sector) => ({ ...sector })),
    ticketPhases: event.ticketPhases.map((phase) => ({
      ...phase,
      combinations: phase.combinations.map((combination) => ({ ...combination })),
    })),
    discounts: event.discounts.map((discount) => ({ ...discount })),
    taxConfig: { ...event.taxConfig },
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
        buyerProfiles: payload.buyerProfiles.map((profile) => ({ ...profile })),
        ticketSectors: payload.ticketSectors.map((sector) => ({ ...sector })),
        ticketPhases: payload.ticketPhases.map((phase) => ({
          ...phase,
          combinations: phase.combinations.map((combination) => ({ ...combination })),
        })),
        discounts: payload.discounts.map((discount) => ({ ...discount })),
        taxConfig: { ...payload.taxConfig },
      };

      eventsDb = [newEvent, ...eventsDb];

      resolve({ ...newEvent, ticketPhases: newEvent.ticketPhases.map((phase) => ({
        ...phase,
        combinations: phase.combinations.map((combination) => ({ ...combination })),
      })) });
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

      resolve({
        ...eventsDb[index],
        ticketPhases: eventsDb[index].ticketPhases.map((phase) => ({
          ...phase,
          combinations: phase.combinations.map((combination) => ({ ...combination })),
        })),
      });
    }, 320);
  });
};

const adminEventApi = {
  listEvents,
  createEvent,
  updateEventStatus,
};

export { adminEventApi, eventCategories, organizers };
