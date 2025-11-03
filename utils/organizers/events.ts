type EventStatus = 'BORRADOR' | 'PUBLICADO' | 'CANCELADO';

type TicketPhaseStatus =
  | 'BORRADOR'
  | 'ACTIVO'
  | 'PAUSADO'
  | 'AGOTADO'
  | 'FINALIZADO';

type TicketPhaseVisibility = 'PUBLICO' | 'OCULTO' | 'BLOQUEADO';

type DiscountType = 'PORCENTAJE' | 'FIJO';

type AdjustmentType = 'PORCENTAJE' | 'FIJO';

type SoldOutAction = 'DETENER' | 'LISTA_ESPERA';

interface BuyerProfile {
  id: string;
  nombre: string;
  descripcion?: string;
}

interface TicketSectorAccessibility {
  sillaRuedas: boolean;
  acompaniamientoPermitido: boolean;
  acompaniamientoObligatorio: boolean;
  sectorVinculadoId?: string;
}

interface TicketSector {
  id: string;
  nombre: string;
  capacidad: number;
  accesibilidad: TicketSectorAccessibility;
}

interface TicketPhase {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  visibilidad: TicketPhaseVisibility;
  bloqueadoHasta?: string;
  estado: TicketPhaseStatus;
}

interface TicketPriceCombination {
  id: string;
  sectorId: string;
  perfilId: string;
  faseId: string;
  disponible: boolean;
  precio: number;
  mensajeAgotado?: string;
  accionAgotado: SoldOutAction;
}

interface CouponConfig {
  id: string;
  codigo: string;
  tipo: DiscountType;
  valor: number;
  requisito?: string;
  descripcion?: string;
}

interface PriceAdjustmentConfig {
  tipo: AdjustmentType;
  valor: number;
}

interface AdminEventBase {
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
  moneda: 'PEN';
  impuestos: PriceAdjustmentConfig;
  comisiones: PriceAdjustmentConfig;
  perfilesComprador: BuyerProfile[];
  sectores: TicketSector[];
  fases: TicketPhase[];
  precios: TicketPriceCombination[];
  cupones: CouponConfig[];
  imagenDestacada?: string;
}

interface AdminEvent extends AdminEventBase {
  idEvento: number;
}

type AdminEventPayload = AdminEventBase;

interface AdminEventCategory {
  idCategoria: number;
  nombre: string;
  descripcion: string;
}

interface AdminOrganizer {
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
    moneda: 'PEN',
    impuestos: {
      tipo: 'PORCENTAJE',
      valor: 18,
    },
    comisiones: {
      tipo: 'PORCENTAJE',
      valor: 6,
    },
    perfilesComprador: [
      { id: 'adulto', nombre: 'Adulto' },
      { id: 'vip-corporate', nombre: 'Corporativo', descripcion: 'Paquetes empresariales.' },
    ],
    sectores: [
      {
        id: 'vip',
        nombre: 'VIP',
        capacidad: 450,
        accesibilidad: {
          sillaRuedas: true,
          acompaniamientoPermitido: true,
          acompaniamientoObligatorio: false,
        },
      },
      {
        id: 'general',
        nombre: 'General',
        capacidad: 1200,
        accesibilidad: {
          sillaRuedas: true,
          acompaniamientoPermitido: true,
          acompaniamientoObligatorio: true,
        },
      },
    ],
    fases: [
      {
        id: 'preventavip',
        nombre: 'Preventa',
        fechaInicio: '2024-07-01T09:00',
        fechaFin: '2024-08-15T23:59',
        visibilidad: 'PUBLICO',
        estado: 'ACTIVO',
      },
      {
        id: 'generalnight',
        nombre: 'Regular',
        fechaInicio: '2024-08-16T00:00',
        fechaFin: '2024-11-14T23:59',
        visibilidad: 'PUBLICO',
        estado: 'BORRADOR',
      },
    ],
    precios: [
      {
        id: 'vip-adulto-preventa',
        sectorId: 'vip',
        perfilId: 'adulto',
        faseId: 'preventavip',
        disponible: true,
        precio: 420,
        accionAgotado: 'LISTA_ESPERA',
        mensajeAgotado: 'Únete a la lista de espera para nuevas liberaciones.',
      },
      {
        id: 'vip-adulto-regular',
        sectorId: 'vip',
        perfilId: 'adulto',
        faseId: 'generalnight',
        disponible: true,
        precio: 520,
        accionAgotado: 'DETENER',
      },
      {
        id: 'general-adulto-preventa',
        sectorId: 'general',
        perfilId: 'adulto',
        faseId: 'preventavip',
        disponible: true,
        precio: 160,
        accionAgotado: 'LISTA_ESPERA',
      },
      {
        id: 'general-corporativo-regular',
        sectorId: 'general',
        perfilId: 'vip-corporate',
        faseId: 'generalnight',
        disponible: false,
        precio: 0,
        accionAgotado: 'DETENER',
      },
    ],
    cupones: [
      {
        id: 'conadis',
        codigo: 'CONADIS',
        tipo: 'PORCENTAJE',
        valor: 50,
        requisito: 'Presentar documento CONADIS al ingresar.',
        descripcion: 'Descuento especial para personas con discapacidad.',
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
    moneda: 'PEN',
    impuestos: {
      tipo: 'FIJO',
      valor: 12,
    },
    comisiones: {
      tipo: 'PORCENTAJE',
      valor: 4,
    },
    perfilesComprador: [
      { id: 'corporativo', nombre: 'Corporativo' },
      { id: 'startup', nombre: 'Startup', descripcion: 'Equipos pequeños y emprendedores.' },
    ],
    sectores: [
      {
        id: 'auditorio',
        nombre: 'Auditorio Principal',
        capacidad: 900,
        accesibilidad: {
          sillaRuedas: true,
          acompaniamientoPermitido: true,
          acompaniamientoObligatorio: false,
        },
      },
      {
        id: 'workshop',
        nombre: 'Salas Workshop',
        capacidad: 250,
        accesibilidad: {
          sillaRuedas: true,
          acompaniamientoPermitido: true,
          acompaniamientoObligatorio: false,
          sectorVinculadoId: 'auditorio',
        },
      },
    ],
    fases: [
      {
        id: 'temprana',
        nombre: 'Preventas',
        fechaInicio: '2024-05-01T09:00',
        fechaFin: '2024-06-15T23:59',
        visibilidad: 'PUBLICO',
        estado: 'ACTIVO',
      },
      {
        id: 'regular',
        nombre: 'Regular',
        fechaInicio: '2024-06-16T00:00',
        fechaFin: '2024-09-04T23:59',
        visibilidad: 'BLOQUEADO',
        bloqueadoHasta: '2024-06-16T00:00',
        estado: 'BORRADOR',
      },
    ],
    precios: [
      {
        id: 'auditorio-corporativo-temprana',
        sectorId: 'auditorio',
        perfilId: 'corporativo',
        faseId: 'temprana',
        disponible: true,
        precio: 620,
        accionAgotado: 'DETENER',
      },
      {
        id: 'auditorio-startup-temprana',
        sectorId: 'auditorio',
        perfilId: 'startup',
        faseId: 'temprana',
        disponible: true,
        precio: 320,
        accionAgotado: 'LISTA_ESPERA',
        mensajeAgotado: 'Únete a la lista de espera corporativa.',
      },
      {
        id: 'workshop-corporativo-regular',
        sectorId: 'workshop',
        perfilId: 'corporativo',
        faseId: 'regular',
        disponible: false,
        precio: 0,
        accionAgotado: 'DETENER',
      },
    ],
    cupones: [
      {
        id: 'allystart',
        codigo: 'ALLYSTART',
        tipo: 'FIJO',
        valor: 120,
        requisito: 'Disponible solo para startups invitadas.',
      },
    ],
    imagenDestacada: '/images/events/innovation-summit.jpg',
  },
];

const cloneEvents = (events: AdminEvent[]): AdminEvent[] => {
  return events.map((event) => ({
    ...event,
    perfilesComprador: event.perfilesComprador.map((perfil) => ({ ...perfil })),
    sectores: event.sectores.map((sector) => ({
      ...sector,
      accesibilidad: { ...sector.accesibilidad },
    })),
    fases: event.fases.map((fase) => ({ ...fase })),
    precios: event.precios.map((precio) => ({ ...precio })),
    cupones: event.cupones.map((cupon) => ({ ...cupon })),
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
        perfilesComprador: payload.perfilesComprador.map((perfil) => ({ ...perfil })),
        sectores: payload.sectores.map((sector) => ({
          ...sector,
          accesibilidad: { ...sector.accesibilidad },
        })),
        fases: payload.fases.map((fase) => ({ ...fase })),
        precios: payload.precios.map((precio) => ({ ...precio })),
        cupones: payload.cupones.map((cupon) => ({ ...cupon })),
      };

      eventsDb = [newEvent, ...eventsDb];

      resolve({
        ...newEvent,
        perfilesComprador: newEvent.perfilesComprador.map((perfil) => ({ ...perfil })),
        sectores: newEvent.sectores.map((sector) => ({
          ...sector,
          accesibilidad: { ...sector.accesibilidad },
        })),
        fases: newEvent.fases.map((fase) => ({ ...fase })),
        precios: newEvent.precios.map((precio) => ({ ...precio })),
        cupones: newEvent.cupones.map((cupon) => ({ ...cupon })),
      });
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
        perfilesComprador: eventsDb[index].perfilesComprador.map((perfil) => ({ ...perfil })),
        sectores: eventsDb[index].sectores.map((sector) => ({
          ...sector,
          accesibilidad: { ...sector.accesibilidad },
        })),
        fases: eventsDb[index].fases.map((fase) => ({ ...fase })),
        precios: eventsDb[index].precios.map((precio) => ({ ...precio })),
        cupones: eventsDb[index].cupones.map((cupon) => ({ ...cupon })),
      });
    }, 320);
  });
};

const adminEventApi = {
  listEvents,
  createEvent,
  updateEventStatus,
};

export {
  adminEventApi,
  eventCategories,
  organizers,
  type AdjustmentType,
  type AdminEvent,
  type AdminEventPayload,
  type BuyerProfile,
  type CouponConfig,
  type DiscountType,
  type EventStatus,
  type PriceAdjustmentConfig,
  type SoldOutAction,
  type TicketPhase,
  type TicketPhaseStatus,
  type TicketPhaseVisibility,
  type TicketPriceCombination,
  type TicketSector,
  type TicketSectorAccessibility,
};
