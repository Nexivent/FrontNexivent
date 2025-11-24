'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@components/Button/Button';

type CategoryOption = {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
};

type Sector = { id: string; nombre: string; capacidad: number };
type Profile = { id: string; label: string };
type TicketType = { id: string; label: string };
type EventState = 'BORRADOR' | 'PUBLICADO' | 'CANCELADO';
type PriceMatrix = Record<string, Record<string, Record<string, number>>>;
type MediaKey = 'imagenPortada' | 'imagenLugar' | 'videoUrl';
type MediaMeta = { name: string | null; size: number | null };
type EventDate = {
  idFechaEvento: number;
  idFecha: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
};

type OrganizerEventForm = {
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
  eventDates: EventDate[];
  perfiles: Profile[];
  sectores: Sector[];
  tiposTicket: TicketType[];
  precios: PriceMatrix;
};

const defaultProfiles: Profile[] = [
  { id: 'adulto', label: 'Adulto' },
  { id: 'nino', label: 'Niño' },
];

const defaultTicketTypes: TicketType[] = [
  { id: 'regular', label: 'Regular' },
  { id: 'preventa', label: 'Preventa' },
  { id: 'conadis', label: 'Preventa CONADIS' },
];

const defaultSectors: Sector[] = [
  { id: 'vip', nombre: 'VIP', capacidad: 160 },
  { id: 'regular', nombre: 'Regular', capacidad: 420 },
  { id: 'platea', nombre: 'Planta baja', capacidad: 220 },
];

const ensureFullPricing = (
  sectores: Sector[],
  perfiles: Profile[],
  tiposTicket: TicketType[],
  base: PriceMatrix = {}
): PriceMatrix =>
  sectores.reduce<PriceMatrix>((acc, sector) => {
    const profiles = perfiles.reduce<Record<string, Record<string, number>>>(
      (profileAcc, profile) => {
        const tickets = tiposTicket.reduce<Record<string, number>>((ticketsAcc, ticket) => {
          const value = base[sector.id]?.[profile.id]?.[ticket.id] ?? 0;
          return { ...ticketsAcc, [ticket.id]: value };
        }, {});
        return { ...profileAcc, [profile.id]: tickets };
      },
      {}
    );
    return { ...acc, [sector.id]: profiles };
  }, {});

const defaultPricePreset: PriceMatrix = {
  vip: {
    adulto: { regular: 190, preventa: 170, conadis: 140 },
    nino: { regular: 150, preventa: 130, conadis: 100 },
  },
  regular: {
    adulto: { regular: 110, preventa: 95, conadis: 80 },
    nino: { regular: 85, preventa: 70, conadis: 55 },
  },
  platea: {
    adulto: { regular: 140, preventa: 125, conadis: 100 },
    nino: { regular: 110, preventa: 90, conadis: 75 },
  },
};

const createInitialForm = (): OrganizerEventForm => ({
  idEvento: 0,
  idOrganizador: 2,
  idCategoria: 0,
  titulo: '',
  descripcion: '',
  lugar: '',
  estado: 'BORRADOR',
  likes: 0,
  noInteres: 0,
  cantVendidasTotal: 0,
  totalRecaudado: 0,
  imagenPortada: '',
  imagenLugar: '',
  videoUrl: '',
  eventDates: [],
  perfiles: defaultProfiles,
  sectores: defaultSectors,
  tiposTicket: defaultTicketTypes,
  precios: ensureFullPricing(
    defaultSectors,
    defaultProfiles,
    defaultTicketTypes,
    defaultPricePreset
  ),
});

const mediaConfig: Record<
  MediaKey,
  { label: string; helper: string; accept: string; icon: string }
> = {
  imagenPortada: {
    label: 'Imagen de portada',
    helper: 'Sube un JPG/PNG o pega un enlace público.',
    accept: 'image/*',
    icon: 'wallpaper',
  },
  imagenLugar: {
    label: 'Imagen del venue',
    helper: 'Ideal para mostrar el espacio físico.',
    accept: 'image/*',
    icon: 'photo_camera',
  },
  videoUrl: {
    label: 'Video promocional',
    helper: 'Acepta MP4 o pegado desde YouTube/Vimeo.',
    accept: 'video/*',
    icon: 'play_circle',
  },
};

const mediaKeys: MediaKey[] = ['imagenPortada', 'imagenLugar', 'videoUrl'];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

const formatSize = (size: number | null) =>
  size !== null ? `${(size / 1024).toFixed(1)} KB` : undefined;

const getApiBaseUrl = () => (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

const buildUploadUrl = (path: string) => {
  const base = getApiBaseUrl();
  if (base.length === 0) {
    throw new Error('Configura NEXT_PUBLIC_API_URL para subir archivos.');
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

const resolveMediaPreviewUrl = (value: string) => {
  if (value.trim().length === 0) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const previewBase = (
    process.env.NEXT_PUBLIC_UPLOAD_BASE_URL ??
    process.env.NEXT_PUBLIC_CDN_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    ''
  ).replace(/\/+$/, '');
  return previewBase.length > 0 ? `${previewBase}/${value.replace(/^\/+/, '')}` : value;
};

const normalizeIdentifier = (label: string, fallbackPrefix: string) => {
  const slug = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return slug.length > 0 ? slug : `${fallbackPrefix}-${Date.now()}`;
};
const EventCreator: React.FC = () => {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  const [form, setForm] = useState<OrganizerEventForm>(() => createInitialForm());
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryStatus, setCategoryStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [loadingEvent, setLoadingEvent] = useState<boolean>(false);

  const [newSectorName, setNewSectorName] = useState('');
  const [newSectorCapacity, setNewSectorCapacity] = useState('');
  const [sectorMessage, setSectorMessage] = useState<string | null>(null);

  const [newProfileLabel, setNewProfileLabel] = useState('');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [newTicketLabel, setNewTicketLabel] = useState('');
  const [ticketMessage, setTicketMessage] = useState<string | null>(null);
  const [newEventDate, setNewEventDate] = useState<{
    fecha: string;
    horaInicio: string;
    horaFin: string;
  }>({
    fecha: '',
    horaInicio: '',
    horaFin: '',
  });
  const [dateMessage, setDateMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [mediaMeta, setMediaMeta] = useState<Record<MediaKey, MediaMeta>>({
    imagenPortada: { name: null, size: null },
    imagenLugar: { name: null, size: null },
    videoUrl: { name: null, size: null },
  });
  const [mediaUploading, setMediaUploading] = useState<Record<MediaKey, boolean>>({
    imagenPortada: false,
    imagenLugar: false,
    videoUrl: false,
  });

  // Load event data if eventId is present in URL
  useEffect(() => {
    if (!eventId) return;

    let mounted = true;
    setLoadingEvent(true);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098';
    const eventEndpoint = `${apiBaseUrl}/evento/${eventId}/`;

    fetch(eventEndpoint)
      .then(async (response) => {
        if (!response.ok) throw new Error('No se pudo obtener el evento');
        return response.json();
      })
      .then((event) => {
        if (!mounted) return;

        if (event) {
          // Map eventDates from API response
          const eventDates = (event.eventDates ?? []).map((fecha: any) => ({
            idFechaEvento: fecha.idFechaEvento ?? fecha.idFecha,
            idFecha: fecha.idFecha,
            fecha: fecha.fecha,
            horaInicio: fecha.horaInicio,
            horaFin: fecha.horaFin === '' ? fecha.horaInicio : fecha.horaFin,
          }));

          setForm({
            idEvento: event.idEvento,
            idOrganizador: event.idOrganizador ?? 2,
            idCategoria: event.idCategoria ?? 0,
            titulo: event.titulo ?? '',
            descripcion: event.descripcion ?? '',
            lugar: event.lugar ?? '',
            estado: event.estado ?? 'BORRADOR',
            likes: event.likes ?? 0,
            noInteres: event.noInteres ?? 0,
            cantVendidasTotal: event.cantVendidasTotal ?? 0,
            totalRecaudado: event.totalRecaudado ?? 0,
            imagenPortada: event.imagenPortada ?? '',
            imagenLugar: event.imagenLugar ?? '',
            videoUrl: event.videoUrl ?? '',
            eventDates,
            perfiles: event.perfiles ?? defaultProfiles,
            sectores: event.sectores ?? defaultSectors,
            tiposTicket: event.tiposTicket ?? defaultTicketTypes,
            precios: event.precios ?? {},
          });
        }
        console.log('Evento recibido del API:', event);
        console.log('Fechas del evento:', event.fechas);
        setLoadingEvent(false);
      })
      .catch((error) => {
        console.error('Error loading event:', error);
        if (mounted) setLoadingEvent(false);
      });

    return () => {
      mounted = false;
    };
  }, [eventId]);

  useEffect(() => {
    let mounted = true;
    setCategoryStatus('loading');
    fetch('/api/categories')
      .then(async (response) => {
        if (!response.ok) throw new Error('No se pudieron obtener las categorías');
        return response.json();
      })
      .then((payload) => {
        if (!mounted) return;
        const data = (payload?.data ?? []) as CategoryOption[];
        setCategories(data);
        setCategoryStatus('idle');
        if (data.length > 0) {
          setForm((previous) =>
            previous.idCategoria === 0 ? { ...previous, idCategoria: data[0].id } : previous
          );
        }
      })
      .catch(() => {
        if (mounted) setCategoryStatus('error');
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setForm((previous) =>
      previous.idEvento === 0 ? { ...previous, idEvento: Date.now() } : previous
    );
  }, []);

  const selectedCategory = categories.find((category) => category.id === form.idCategoria);

  const stats = useMemo(() => {
    const totalCapacity = form.sectores.reduce((sum, sector) => sum + sector.capacidad, 0);
    const allPrices: number[] = [];
    form.sectores.forEach((sector) => {
      form.perfiles.forEach((profile) => {
        form.tiposTicket.forEach((ticket) => {
          const value = form.precios[sector.id]?.[profile.id]?.[ticket.id];
          if (value > 0) allPrices.push(value);
        });
      });
    });

    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

    const potentialRevenue = form.sectores.reduce((total, sector) => {
      const prices = form.perfiles.flatMap((profile) =>
        form.tiposTicket.map((ticket) => form.precios[sector.id]?.[profile.id]?.[ticket.id] ?? 0)
      );
      const sectorMax = prices.length > 0 ? Math.max(...prices) : 0;
      return total + sector.capacidad * sectorMax;
    }, 0);

    const infoComplete =
      form.titulo.trim().length > 0 &&
      form.descripcion.trim().length > 0 &&
      form.lugar.trim().length > 0 &&
      form.idCategoria !== 0;

    const mediaComplete =
      form.imagenPortada.trim().length > 0 &&
      form.imagenLugar.trim().length > 0 &&
      form.videoUrl.trim().length > 0;

    const entitiesReady = form.perfiles.length > 0 && form.tiposTicket.length > 0;

    const ticketMatrixComplete =
      entitiesReady &&
      form.sectores.every((sector) => sector.capacidad > 0) &&
      form.sectores.every((sector) =>
        form.perfiles.every((profile) =>
          form.tiposTicket.every((ticket) => form.precios[sector.id]?.[profile.id]?.[ticket.id] > 0)
        )
      );

    const datesComplete =
      form.eventDates.length > 0 &&
      form.eventDates.every(
        (date) =>
          date.fecha.trim().length > 0 &&
          date.horaInicio.trim().length > 0 &&
          date.horaFin.trim().length > 0
      );

    const publishReady = infoComplete && mediaComplete && ticketMatrixComplete && datesComplete;
    const publishComplete = publishReady && form.estado !== 'BORRADOR';

    return {
      totalCapacity,
      minPrice,
      maxPrice,
      potentialRevenue,
      infoComplete,
      mediaComplete,
      ticketMatrixComplete,
      entitiesReady,
      datesComplete,
      publishReady,
      publishComplete,
    };
  }, [form]);

  const checklist = [
    {
      id: 'info',
      label: 'Información básica',
      description: 'Título, categoría, descripción y lugar.',
      completed: stats.infoComplete,
    },
    {
      id: 'dates',
      label: 'Fechas configuradas',
      description: 'Agrega al menos una fecha con horario definido.',
      completed: stats.datesComplete,
    },
    {
      id: 'media',
      label: 'Medios cargados',
      description: 'Portada, venue y video configurados.',
      completed: stats.mediaComplete,
    },
    {
      id: 'entities',
      label: 'Perfiles y tipos listos',
      description: 'Define combinaciones de perfiles y tickets.',
      completed: stats.entitiesReady,
    },
    {
      id: 'ticketing',
      label: 'Tickets configurados',
      description: 'Stock por sector y precios por combinación.',
      completed: stats.ticketMatrixComplete,
    },
    {
      id: 'publish',
      label: 'Listo para publicar',
      description: 'Estado distinto a borrador y validaciones completas.',
      completed: stats.publishComplete,
    },
  ];
  const handleSectorCapacityChange = (sectorId: string, value: string) => {
    const parsed = Number(value);
    setForm((previous) => ({
      ...previous,
      sectores: previous.sectores.map((sector) =>
        sector.id === sectorId
          ? { ...sector, capacidad: Number.isNaN(parsed) ? 0 : Math.max(0, parsed) }
          : sector
      ),
    }));
  };

  const handlePriceChange = (
    sectorId: string,
    profileId: string,
    ticketId: string,
    value: string
  ) => {
    const parsed = Number(value);
    setForm((previous) => ({
      ...previous,
      precios: {
        ...previous.precios,
        [sectorId]: {
          ...previous.precios[sectorId],
          [profileId]: {
            ...previous.precios[sectorId][profileId],
            [ticketId]: Number.isNaN(parsed) ? 0 : Math.max(0, parsed),
          },
        },
      },
    }));
  };

  const handleAddSector = () => {
    setSectorMessage(null);
    const name = newSectorName.trim();
    const capacityNumber = Number(newSectorCapacity);
    if (!name || Number.isNaN(capacityNumber) || capacityNumber <= 0) {
      setSectorMessage('Completa el nombre y una capacidad mayor a cero.');
      return;
    }

    const sectorId = normalizeIdentifier(name, 'sector');
    let duplicated = false;
    setForm((previous) => {
      if (previous.sectores.some((sector) => sector.id === sectorId)) {
        duplicated = true;
        return previous;
      }
      const updatedSectors = [
        ...previous.sectores,
        { id: sectorId, nombre: name, capacidad: capacityNumber },
      ];
      return {
        ...previous,
        sectores: updatedSectors,
        precios: ensureFullPricing(
          updatedSectors,
          previous.perfiles,
          previous.tiposTicket,
          previous.precios
        ),
      };
    });
    if (duplicated) {
      setSectorMessage('Ya existe un sector con ese identificador.');
      return;
    }

    setNewSectorName('');
    setNewSectorCapacity('');
    setSectorMessage('Sector agregado correctamente.');
  };

  const handleRemoveSector = (sectorId: string) => {
    setSectorMessage(null);
    setForm((previous) => {
      if (previous.sectores.length === 1) {
        setSectorMessage('Necesitas al menos un sector.');
        return previous;
      }
      const updatedSectors = previous.sectores.filter((sector) => sector.id !== sectorId);
      const { [sectorId]: _removed, ...restPrices } = previous.precios;
      void _removed;
      setSectorMessage('Sector eliminado.');
      return {
        ...previous,
        sectores: updatedSectors,
        precios: ensureFullPricing(
          updatedSectors,
          previous.perfiles,
          previous.tiposTicket,
          restPrices
        ),
      };
    });
  };

  const handleAddProfile = () => {
    setProfileMessage(null);
    const label = newProfileLabel.trim();
    if (!label) {
      setProfileMessage('Ingresa un nombre para el perfil.');
      return;
    }
    const profileId = normalizeIdentifier(label, 'perfil');
    let duplicated = false;
    setForm((previous) => {
      if (previous.perfiles.some((profile) => profile.id === profileId)) {
        duplicated = true;
        return previous;
      }
      const updatedProfiles = [...previous.perfiles, { id: profileId, label }];
      return {
        ...previous,
        perfiles: updatedProfiles,
        precios: ensureFullPricing(
          previous.sectores,
          updatedProfiles,
          previous.tiposTicket,
          previous.precios
        ),
      };
    });
    if (duplicated) {
      setProfileMessage('Ya existe un perfil con ese identificador.');
      return;
    }
    setNewProfileLabel('');
    setProfileMessage('Perfil agregado correctamente.');
  };

  const handleRemoveProfile = (profileId: string) => {
    setProfileMessage(null);
    setForm((previous) => {
      if (previous.perfiles.length === 1) {
        setProfileMessage('Necesitas al menos un perfil.');
        return previous;
      }
      const updatedProfiles = previous.perfiles.filter((profile) => profile.id !== profileId);
      const trimmedPrices = Object.entries(previous.precios).reduce<PriceMatrix>(
        (acc, [sectorId, profileMap]) => {
          const { [profileId]: _removed, ...restProfiles } = profileMap;
          void _removed;
          return { ...acc, [sectorId]: restProfiles };
        },
        {}
      );
      setProfileMessage('Perfil eliminado.');
      return {
        ...previous,
        perfiles: updatedProfiles,
        precios: ensureFullPricing(
          previous.sectores,
          updatedProfiles,
          previous.tiposTicket,
          trimmedPrices
        ),
      };
    });
  };

  const handleAddTicketType = () => {
    setTicketMessage(null);
    const label = newTicketLabel.trim();
    if (!label) {
      setTicketMessage('Ingresa un nombre para el tipo de ticket.');
      return;
    }
    const ticketId = normalizeIdentifier(label, 'ticket');
    let duplicated = false;
    setForm((previous) => {
      if (previous.tiposTicket.some((ticket) => ticket.id === ticketId)) {
        duplicated = true;
        return previous;
      }
      const updatedTickets = [...previous.tiposTicket, { id: ticketId, label }];
      return {
        ...previous,
        tiposTicket: updatedTickets,
        precios: ensureFullPricing(
          previous.sectores,
          previous.perfiles,
          updatedTickets,
          previous.precios
        ),
      };
    });
    if (duplicated) {
      setTicketMessage('Ya existe un tipo con ese identificador.');
      return;
    }
    setNewTicketLabel('');
    setTicketMessage('Tipo de ticket agregado.');
  };

  const handleRemoveTicketType = (ticketId: string) => {
    setTicketMessage(null);
    setForm((previous) => {
      if (previous.tiposTicket.length === 1) {
        setTicketMessage('Necesitas al menos un tipo de ticket.');
        return previous;
      }
      const updatedTickets = previous.tiposTicket.filter((ticket) => ticket.id !== ticketId);
      const trimmedPrices = Object.entries(previous.precios).reduce<PriceMatrix>(
        (acc, [sectorId, profileMap]) => {
          const profiles = Object.entries(profileMap).reduce<
            Record<string, Record<string, number>>
          >((profileAcc, [profileId, ticketMap]) => {
            const { [ticketId]: _removed, ...restTickets } = ticketMap;
            void _removed;
            return { ...profileAcc, [profileId]: restTickets };
          }, {});
          return { ...acc, [sectorId]: profiles };
        },
        {}
      );
      setTicketMessage('Tipo de ticket eliminado.');
      return {
        ...previous,
        tiposTicket: updatedTickets,
        precios: ensureFullPricing(
          previous.sectores,
          previous.perfiles,
          updatedTickets,
          trimmedPrices
        ),
      };
    });
  };

  const handleAddEventDate = () => {
    setDateMessage(null);
    const { fecha, horaInicio, horaFin } = newEventDate;
    if (
      fecha.trim().length === 0 ||
      horaInicio.trim().length === 0 ||
      horaFin.trim().length === 0
    ) {
      setDateMessage('Completa la fecha y las horas de inicio y fin.');
      return;
    }
    const idTimestamp = Date.now();
    setForm((previous) => ({
      ...previous,
      eventDates: [
        ...previous.eventDates,
        {
          idFechaEvento: idTimestamp,
          idFecha: idTimestamp,
          fecha,
          horaInicio,
          horaFin,
        },
      ],
    }));
    setNewEventDate({ fecha: '', horaInicio: '', horaFin: '' });
    setDateMessage('Fecha agregada correctamente.');
  };

  const handleRemoveEventDate = (idFechaEvento: number) => {
    setDateMessage(null);
    setForm((previous) => {
      if (previous.eventDates.length === 1) {
        setDateMessage('Debes mantener al menos una fecha.');
        return previous;
      }
      return {
        ...previous,
        eventDates: previous.eventDates.filter((date) => date.idFechaEvento !== idFechaEvento),
      };
    });
  };

  const handleMediaUpload = async (key: MediaKey, file: File | null | undefined) => {
    if (!file) return;
    setMediaUploading((previous) => ({ ...previous, [key]: true }));
    setMediaMeta((previous) => ({ ...previous, [key]: { name: file.name, size: file.size } }));
    try {
      const uploadEndpoint = buildUploadUrl('/media/upload-url');
      const presignResponse = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });

      if (!presignResponse.ok) {
        throw new Error('No se pudo obtener el URL prefirmado.');
      }

      const presign = (await presignResponse.json()) as {
        uploadUrl?: string;
        key?: string;
        fileUrl?: string;
        publicUrl?: string;
      };

      if (typeof presign.uploadUrl !== 'string') {
        throw new Error('Respuesta invalida del servicio de carga.');
      }

      const uploadResponse = await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Error subiendo el archivo a S3.');
      }

      const buildUploadedUrl = () => {
        const explicitUrl =
          typeof presign.fileUrl === 'string' && presign.fileUrl.trim().length > 0
            ? presign.fileUrl
            : typeof presign.publicUrl === 'string' && presign.publicUrl.trim().length > 0
              ? presign.publicUrl
              : '';

        if (explicitUrl.length > 0) return explicitUrl;

        const keyUrl =
          typeof presign.key === 'string' && presign.key.trim().length > 0
            ? resolveMediaPreviewUrl(presign.key)
            : '';

        if (/^https?:\/\//i.test(keyUrl)) return keyUrl;

        return presign.uploadUrl?.split('?')[0];
      };

      const uploadedUrl = buildUploadedUrl();

      if (uploadedUrl?.trim().length === 0) {
        throw new Error('No se obtuvo una URL valida para el archivo subido.');
      }

      setForm((previous) => ({ ...previous, [key]: uploadedUrl }));
    } catch (error) {
      console.error('Error subiendo archivo', error);
      setMediaMeta((previous) => ({
        ...previous,
        [key]: {
          name:
            error instanceof Error
              ? error.message
              : 'No se pudo subir el archivo. Intenta nuevamente.',
          size: null,
        },
      }));
    } finally {
      setMediaUploading((previous) => ({ ...previous, [key]: false }));
    }
  };

  const handleMediaUrlChange = (key: MediaKey, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setMediaMeta((previous) => ({
      ...previous,
      [key]:
        value.trim().length > 0
          ? { name: 'Enlace externo', size: null }
          : { name: null, size: null },
    }));
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingState === 'saving') return;
    const nativeEvent = event.nativeEvent as Event & { submitter?: EventTarget | null };
    const submitter = (nativeEvent.submitter as HTMLButtonElement | null) ?? null;
    const intentState = submitter?.dataset.intent as EventState | undefined;
    const errors: string[] = [];
    if (form.idCategoria === 0) errors.push('Selecciona una categoría para el evento.');
    if (form.titulo.trim().length === 0) errors.push('El título es obligatorio.');
    if (form.descripcion.trim().length === 0) errors.push('La descripción es obligatoria.');
    if (form.lugar.trim().length === 0) errors.push('El lugar del evento es obligatorio.');
    if (form.eventDates.length === 0) {
      errors.push('Agrega al menos una fecha para el evento.');
    } else if (
      form.eventDates.some(
        (date) =>
          date.fecha.trim().length === 0 ||
          date.horaInicio.trim().length === 0 ||
          date.horaFin.trim().length === 0
      )
    ) {
      errors.push('Completa fecha y horarios para cada fecha agregada.');
    }

    if (!stats.entitiesReady) {
      errors.push('Debes mantener al menos un perfil y un tipo de ticket.');
    }
    if (!stats.ticketMatrixComplete) {
      errors.push('Configura los precios para todas las combinaciones de perfil, sector y tipo.');
    }
    if (!stats.mediaComplete) {
      errors.push('Carga la imagen de portada, del lugar y un video promocional.');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    const payload: OrganizerEventForm = {
      ...form,
      estado: intentState ?? form.estado,
    };

    setSavingState('saving');
    try {
      console.log('Payload enviado:', JSON.stringify(payload));
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098';
      const response = await fetch(`${API_URL}/evento/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Error al guardar');
      setSavingState('success');
      setLastSavedAt(new Date().toISOString());
      if (intentState && intentState !== form.estado) {
        setForm((previous) => ({ ...previous, estado: intentState }));
      }
    } catch {
      setSavingState('error');
    } finally {
      setTimeout(() => {
        setSavingState((current) => (current === 'success' ? 'idle' : current));
      }, 2500);
    }
  };

  const savingMessage =
    savingState === 'saving'
      ? 'Guardando cambios...'
      : savingState === 'success'
        ? 'Borrador actualizado.'
        : savingState === 'error'
          ? 'No se pudo guardar el evento.'
          : null;

  if (loadingEvent) {
    return (
      <div className='organizer-builder'>
        <div className='organizer-panel' style={{ marginTop: '100px', textAlign: 'center' }}>
          <p className='gray'>Cargando evento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='organizer-builder'>
      <header className='header'>
        <div className='header-content'>
          <div className='header-top'>
            <div className='header-title'>
              <p className='eyebrow'>Panel de organizadores</p>
              <h1>{eventId ? 'Editar Evento' : 'Crear Nuevo Evento'}</h1>
              <p className='header-subtitle'>
                {eventId
                  ? 'Actualiza los detalles de tu evento y guarda los cambios'
                  : 'Configura todos los detalles de tu evento, define precios y prepáralo para publicar en Nexivent'}
              </p>
            </div>
          </div>
          <div className='stats-grid'>
            <div className='stat-card'>
              <span className='stat-label'>Capacidad Total</span>
              <strong className='stat-value'>{stats.totalCapacity.toLocaleString()}</strong>
            </div>
            <div className='stat-card'>
              <span className='stat-label'>Recaudación Potencial</span>
              <strong className='stat-value'>{formatCurrency(stats.potentialRevenue)}</strong>
            </div>
            <div className='stat-card'>
              <span className='stat-label'>Estado</span>
              <strong className='stat-value'>{form.estado}</strong>
            </div>
          </div>
        </div>
      </header>

      <form className='organizer-form' onSubmit={(event) => void handleSubmit(event)}>
        <div className='organizer-grid'>
          <div className='organizer-main'>
            <section className='organizer-panel'>
              <div className='organizer-panel__header'>
                <h3>Datos generales</h3>
                <span className={`status-pill ${form.estado.toLowerCase()}`}>{form.estado}</span>
              </div>
              <div className='field-grid two-columns'>
                <div className='field'>
                  <span className='field-label'>Estado actual</span>
                  <div className={`status-pill ${form.estado.toLowerCase()}`}>{form.estado}</div>
                  <span className='field-hint'>
                    Se actualiza automáticamente al guardar o publicar.
                  </span>
                </div>
                <label className='field'>
                  <span className='field-label'>Categoría</span>
                  <select
                    className='input-text'
                    value={form.idCategoria === 0 ? '' : form.idCategoria}
                    disabled={categoryStatus === 'loading'}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        idCategoria: event.target.value === '' ? 0 : Number(event.target.value),
                      }))
                    }
                  >
                    <option value='' disabled>
                      {categoryStatus === 'error'
                        ? 'Recarga para reintentar'
                        : 'Selecciona una categoría'}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <span className='field-hint'>
                    {categoryStatus === 'loading'
                      ? 'Cargando categorías...'
                      : (selectedCategory?.description ??
                        'Agrupa tu evento para mejorar la visibilidad.')}
                  </span>
                </label>
              </div>
              <label className='field'>
                <span className='field-label'>Título</span>
                <input
                  className='input-text'
                  type='text'
                  maxLength={160}
                  value={form.titulo}
                  placeholder='Ej. Festival urbano en Lima'
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, titulo: event.target.value }))
                  }
                />
              </label>
              <label className='field'>
                <span className='field-label'>Descripción</span>
                <textarea
                  className='input-textarea'
                  maxLength={1200}
                  value={form.descripcion}
                  placeholder='Cuenta los highlights de la experiencia...'
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, descripcion: event.target.value }))
                  }
                />
              </label>
              <label className='field'>
                <span className='field-label'>Lugar</span>
                <input
                  className='input-text'
                  type='text'
                  maxLength={180}
                  value={form.lugar}
                  placeholder='Av. Arequipa 1234 - Miraflores'
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, lugar: event.target.value }))
                  }
                />
              </label>
            </section>

            <section className='organizer-panel'>
              <div className='organizer-panel__header'>
                <h3>Fechas del evento</h3>
              </div>
              {form.eventDates.length === 0 ? (
                <p className='field-hint'>Aún no has agregado fechas para este evento.</p>
              ) : (
                <div className='event-dates-grid'>
                  {form.eventDates.map((date) => (
                    <div key={date.idFechaEvento} className='event-date-card'>
                      <div>
                        <p className='label'>
                          {new Date(date.fecha).toLocaleDateString('es-PE', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <strong>
                          {date.horaInicio} - {date.horaFin}
                        </strong>
                      </div>
                      <button
                        type='button'
                        className='icon-button danger'
                        onClick={() => handleRemoveEventDate(date.idFechaEvento)}
                        disabled={form.eventDates.length === 1}
                      >
                        <span className='material-symbols-outlined'>close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className='field-grid three-columns new-date'>
                <label className='field'>
                  <span className='field-label'>Fecha</span>
                  <input
                    className='input-text'
                    type='date'
                    value={newEventDate.fecha}
                    onChange={(event) =>
                      setNewEventDate((previous) => ({ ...previous, fecha: event.target.value }))
                    }
                  />
                </label>
                <label className='field'>
                  <span className='field-label'>Hora inicio</span>
                  <input
                    className='input-text'
                    type='time'
                    value={newEventDate.horaInicio}
                    onChange={(event) =>
                      setNewEventDate((previous) => ({
                        ...previous,
                        horaInicio: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className='field'>
                  <span className='field-label'>Hora fin</span>
                  <input
                    className='input-text'
                    type='time'
                    value={newEventDate.horaFin}
                    onChange={(event) =>
                      setNewEventDate((previous) => ({ ...previous, horaFin: event.target.value }))
                    }
                  />
                </label>
              </div>
              <Button
                type='button'
                color='gray-overlay'
                text='Agregar fecha'
                leftIcon='event_available'
                onClick={() => handleAddEventDate()}
              />
              {dateMessage !== null && <p className='field-hint'>{dateMessage}</p>}
            </section>

            <section className='organizer-panel'>
              <div className='organizer-panel__header'>
                <h3>Medios subidos</h3>
              </div>
              <div className='media-upload-grid'>
                {mediaKeys.map((key) => {
                  const previewUrl = resolveMediaPreviewUrl(form[key]);
                  return (
                    <div key={key} className='media-upload-card'>
                      <div
                        className={`media-preview ${key === 'videoUrl' ? 'video' : ''}`}
                        style={
                          key !== 'videoUrl' && previewUrl.trim().length > 0
                            ? { backgroundImage: `url(${previewUrl})` }
                            : undefined
                        }
                      >
                        <span className='material-symbols-outlined'>{mediaConfig[key].icon}</span>
                        <p>
                          {form[key].trim().length > 0
                            ? 'Contenido listo'
                            : 'Aun no has cargado un archivo'}
                        </p>
                      </div>
                      <div className='media-upload-controls'>
                        <label className='upload-trigger'>
                          <input
                            type='file'
                            accept={mediaConfig[key].accept}
                            onChange={(event) => {
                              void handleMediaUpload(key, event.target.files?.[0]);
                              event.currentTarget.value = '';
                            }}
                          />
                          <span>Cargar archivo</span>
                        </label>
                        <input
                          className='input-text'
                          type='text'
                          value={form[key]}
                          placeholder='O pega un enlace publico'
                          onChange={(event) => handleMediaUrlChange(key, event.target.value)}
                        />
                        <span className='field-hint'>{mediaConfig[key].helper}</span>
                        <div className='media-meta'>
                          {mediaUploading[key]
                            ? 'Procesando archivo...'
                            : (mediaMeta[key].name ??
                              'Sin archivo adjunto (se permite solo enlace o archivo)')}
                          {mediaMeta[key].size !== null && (
                            <span className='media-size'>{formatSize(mediaMeta[key].size)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            <section className='organizer-panel'>
              <div className='organizer-panel__header'>
                <h3>Sectores y stock</h3>
              </div>
              <div className='organizer-sector-grid'>
                {form.sectores.map((sector) => (
                  <div key={sector.id} className='organizer-sector'>
                    <div className='entity-card__header'>
                      <div>
                        <p className='sector-title'>{sector.nombre}</p>
                        <span className='field-hint'>ID: {sector.id}</span>
                      </div>
                      <button
                        type='button'
                        className='icon-button danger'
                        onClick={() => handleRemoveSector(sector.id)}
                        disabled={form.sectores.length === 1}
                        aria-label={`Eliminar sector ${sector.nombre}`}
                      >
                        <span className='material-symbols-outlined'>close</span>
                      </button>
                    </div>
                    <label className='field'>
                      <span className='field-label'>Capacidad</span>
                      <input
                        className='input-text'
                        type='number'
                        min={0}
                        value={sector.capacidad}
                        onChange={(event) =>
                          handleSectorCapacityChange(sector.id, event.target.value)
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>
              <div className='field-grid two-columns new-sector'>
                <label className='field'>
                  <span className='field-label'>Nuevo sector</span>
                  <input
                    className='input-text'
                    type='text'
                    value={newSectorName}
                    onChange={(event) => setNewSectorName(event.target.value)}
                    placeholder='Ej. Balcón'
                  />
                </label>
                <label className='field'>
                  <span className='field-label'>Capacidad</span>
                  <input
                    className='input-text'
                    type='number'
                    min={0}
                    value={newSectorCapacity}
                    onChange={(event) => setNewSectorCapacity(event.target.value)}
                  />
                </label>
              </div>
              <Button
                type='button'
                color='gray-overlay'
                text='Agregar sector'
                leftIcon='add'
                onClick={() => handleAddSector()}
              />
              {sectorMessage !== null && <p className='field-hint'>{sectorMessage}</p>}
            </section>

            <section className='organizer-panel'>
              <div className='organizer-panel__header'>
                <h3>Perfiles</h3>
              </div>
              <div className='entity-grid'>
                {form.perfiles.map((profile) => (
                  <div key={profile.id} className='entity-card'>
                    <div>
                      <p>{profile.label}</p>
                      <span className='field-hint'>ID: {profile.id}</span>
                    </div>
                    <button
                      type='button'
                      className='icon-button danger'
                      onClick={() => handleRemoveProfile(profile.id)}
                      disabled={form.perfiles.length === 1}
                      aria-label={`Eliminar perfil ${profile.label}`}
                    >
                      <span className='material-symbols-outlined'>close</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className='field-grid two-columns new-entity'>
                <label className='field'>
                  <span className='field-label'>Nombre del perfil</span>
                  <input
                    className='input-text'
                    type='text'
                    value={newProfileLabel}
                    onChange={(event) => setNewProfileLabel(event.target.value)}
                    placeholder='Ej. Adulto mayor'
                  />
                </label>
              </div>
              <Button
                type='button'
                color='gray-overlay'
                text='Agregar perfil'
                leftIcon='person_add'
                onClick={() => handleAddProfile()}
              />
              {profileMessage !== null && <p className='field-hint'>{profileMessage}</p>}
            </section>

            <section className='organizer-panel'>
              <div className='organizer-panel__header'>
                <h3>Tipos de ticket</h3>
              </div>
              <div className='entity-grid'>
                {form.tiposTicket.map((ticket) => (
                  <div key={ticket.id} className='entity-card'>
                    <div>
                      <p>{ticket.label}</p>
                      <span className='field-hint'>ID: {ticket.id}</span>
                    </div>
                    <button
                      type='button'
                      className='icon-button danger'
                      onClick={() => handleRemoveTicketType(ticket.id)}
                      disabled={form.tiposTicket.length === 1}
                      aria-label={`Eliminar tipo ${ticket.label}`}
                    >
                      <span className='material-symbols-outlined'>close</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className='field-grid two-columns new-entity'>
                <label className='field'>
                  <span className='field-label'>Nombre del tipo</span>
                  <input
                    className='input-text'
                    type='text'
                    value={newTicketLabel}
                    onChange={(event) => setNewTicketLabel(event.target.value)}
                    placeholder='Ej. Preventa fan club'
                  />
                </label>
              </div>
              <Button
                type='button'
                color='gray-overlay'
                text='Agregar tipo'
                leftIcon='confirmation_number'
                onClick={() => handleAddTicketType()}
              />
              {ticketMessage !== null && <p className='field-hint'>{ticketMessage}</p>}
            </section>

            <section className='organizer-panel'>
              <div className='organizer-panel__header'>
                <h3>Precios por combinación</h3>
              </div>
              <div className='organizer-matrix-grid'>
                {form.sectores.map((sector) => (
                  <div key={sector.id} className='organizer-matrix'>
                    <div className='organizer-matrix__header'>
                      <p className='sector-title'>{sector.nombre}</p>
                      <span className='sector-stock'>{sector.capacidad} cupos</span>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Perfil</th>
                          {form.tiposTicket.map((ticket) => (
                            <th key={ticket.id}>{ticket.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {form.perfiles.map((profile) => (
                          <tr key={profile.id}>
                            <td>{profile.label}</td>
                            {form.tiposTicket.map((ticket) => (
                              <td key={ticket.id}>
                                <input
                                  className='input-text'
                                  type='number'
                                  min={0}
                                  value={form.precios[sector.id]?.[profile.id]?.[ticket.id] ?? 0}
                                  onChange={(event) =>
                                    handlePriceChange(
                                      sector.id,
                                      profile.id,
                                      ticket.id,
                                      event.target.value
                                    )
                                  }
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </section>
            {validationErrors.length > 0 && (
              <div className='validation-errors'>
                <p>Por favor corrige los siguientes campos:</p>
                <ul>
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <section className='organizer-panel organizer-actions'>
              <div className='button-row'>
                <Button
                  type='submit'
                  color='gray-overlay'
                  text='Guardar borrador'
                  leftIcon='save'
                  dataIntent='BORRADOR'
                  disabled={savingState === 'saving'}
                />
                <Button
                  type='submit'
                  color='yellow-filled'
                  text='Publicar evento'
                  rightIcon='rocket_launch'
                  dataIntent='PUBLICADO'
                  disabled={!stats.publishReady || savingState === 'saving'}
                />
              </div>
              {savingMessage !== null && <p className='field-hint'>{savingMessage}</p>}
            </section>
          </div>
          <aside className='organizer-sidebar'>
            <section className='organizer-panel compact'>
              <div className='organizer-panel__header'>
                <h3>Resumen</h3>
              </div>
              <table className='summary-table'>
                <tbody>
                  <tr>
                    <th>Capacidad total</th>
                    <td>
                      <strong>{stats.totalCapacity.toLocaleString()}</strong>
                    </td>
                  </tr>
                  <tr>
                    <th>Tarifa mínima</th>
                    <td>
                      <strong>{formatCurrency(stats.minPrice)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <th>Tarifa máxima</th>
                    <td>
                      <strong>{formatCurrency(stats.maxPrice)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <th>Recaudación potencial</th>
                    <td>
                      <strong>{formatCurrency(stats.potentialRevenue)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className='organizer-tags'>
                <span className='organizer-chip'>
                  <span className='material-symbols-outlined'>groups</span>
                  {form.perfiles.length} perfiles
                </span>
                <span className='organizer-chip'>
                  <span className='material-symbols-outlined'>confirmation_number</span>
                  {form.tiposTicket.length} tipos de ticket
                </span>
                <span className='organizer-chip'>
                  <span className='material-symbols-outlined'>event_seat</span>
                  {form.sectores.length} sectores
                </span>
                <span className='organizer-chip muted'>
                  <span className='material-symbols-outlined'>tag</span>
                  Evento #{form.idEvento === 0 ? 'Pendiente' : form.idEvento}
                </span>
                <span className='organizer-chip muted'>
                  <span className='material-symbols-outlined'>badge</span>
                  Organizador #{form.idOrganizador}
                </span>
                {selectedCategory !== undefined && (
                  <span className='organizer-chip accent'>
                    <span className='material-symbols-outlined'>{selectedCategory.icon}</span>
                    {selectedCategory.name}
                  </span>
                )}
              </div>
            </section>

            <section className='organizer-panel compact'>
              <div className='organizer-panel__header'>
                <h3>Checklist</h3>
              </div>
              <ul className='organizer-checklist detailed'>
                {checklist.map((item) => (
                  <li key={item.id} className={item.completed ? 'completed' : ''}>
                    <span className='material-symbols-outlined'>
                      {item.completed ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <div>
                      <p>{item.label}</p>
                      <span>{item.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className='organizer-panel compact'>
              <div className='organizer-panel__header'>
                <h3>Sincronización</h3>
              </div>
              <p className='summary-label'>Último guardado</p>
              <strong>
                {lastSavedAt !== null ? new Date(lastSavedAt).toLocaleString() : 'Pendiente'}
              </strong>
              <p className='summary-label'>Estado actual</p>
              <strong>{form.estado}</strong>
              {savingMessage !== null && <p className='field-hint'>{savingMessage}</p>}
            </section>
          </aside>
        </div>
      </form>
    </div>
  );
};

export default EventCreator;
