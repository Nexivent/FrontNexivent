'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  Heart,
  X,
  Share2,
  Music,
  Ticket,
  MapPin,
  Volume2,
  VolumeX,
  Calendar,
  DollarSign,
} from 'lucide-react';

import { useRouter } from 'next/navigation';

interface Evento {
  id: number;
  titulo: string;
  fecha: string;
  lugar: string;
  descripcion: string;
  precio: string;
  tipo: string;
  media: string;
  interes: boolean | null;
}

type RawEventoApi = {
  ID?: number | string;
  Id?: number | string;
  IdEvento?: number | string;
  idEvento?: number | string;
  id?: number | string;
  Titulo?: string;
  titulo?: string;
  Descripcion?: string;
  descripcion?: string;
  Lugar?: string;
  lugar?: string;
  Fecha?: string | { Fecha?: string; FechaEvento?: string };
  fecha?: unknown;
  FechaEvento?: string;
  fechaEvento?: string;
  EventoFechas?: Array<{
    ID?: number | string;
    Fecha?: string;
    FechaEvento?: string;
    Tarifas?: Array<{
      Precio?: number;
      PrecioBase?: number;
      Tarifa?: number;
    }>;
    Tarifa?: number;
  }>;
  ImagenDescripcion?: string;
  ImagenPortada?: string;
  ImagenEscenario?: string;
  VideoPresentacion?: string;
  TotalRecaudado?: number;
  CantVendidoTotal?: number;
  CantMeGusta?: number;
  CantNoInteresa?: number;
  FechaCreacion?: string;
  fechaCreacion?: string;
  Fechas?: Array<{
    Fecha?: string;
    HoraInicio?: string;
    HoraFin?: string;
  }>;
  TiposTicket?: Array<{
    Precio?: number;
    PrecioBase?: number;
  }>;
  Tarifa?: number;
  Tarifas?: Array<{
    Precio?: number;
    PrecioBase?: number;
    Tarifa?: number;
  }>;
};

const FEED_ENDPOINT = (() => {
  const base =
    (process.env.NEXT_PUBLIC_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').replace(
      /\/+$/,
      ''
    );
  return base ? `${base}/evento/filter?estado=PUBLICADO` : '/evento/filter?estado=PUBLICADO';
})();

const fallbackEventos: Evento[] = [
  {
    id: 1,
    titulo: 'SKILLBEA - 4MAR',
    fecha: '10 de octubre',
    lugar: 'Vichama Conciertos',
    descripcion:
      'Skillbea presenta en vivo su más reciente single "4MAR" con un setlist extendido y artistas invitados.',
    precio: '35',
    tipo: 'video',
    media: '/eventoSkillbea.mp4',
    interes: null,
  },
  {
    id: 2,
    titulo: 'JAZE - QUIZAS NO ES PARA TANTO',
    fecha: '26 de setiembre',
    lugar: 'Costa 21',
    descripcion:
      'Jaze acaba de lanzar su nuevo disco “Quizá no es para tanto”, un trabajo honesto y emocional que muestra una faceta más íntima del artista. Con letras profundas y un sonido cuidado, el álbum marca un nuevo capítulo en su evolución musical. Para celebrarlo, Jaze realizará un concierto especial donde presentará el disco en vivo por primera vez.',
    precio: '59',
    tipo: 'video',
    media: '/eventoJaze.mp4',
    interes: null,
  },
  {
    id: 3,
    titulo: 'MADISON FEST - HABLANDO HU*VADAS',
    fecha: '13 de diciembre',
    lugar: 'Costa 21',
    descripcion:
      'Este año ha sido uno de los mejores para Jorge Luna y Ricardo Mendoza con Hablando Huevadas, y quieren celebrarlo a lo grande con sus seguidores, con una gran fiesta de fin de año. Donde podras disfrutar de un gran festival lleno de buena musica, para pasar una noche espectacular.',
    precio: '44',
    tipo: 'imagen',
    media: '/eventoHH.jpg',
    interes: null,
  },
  {
    id: 4,
    titulo: 'Decir Adiós - Amén',
    fecha: '8 de noviembre',
    lugar: 'CC Leguia',
    descripcion:
      'La legendaria banda peruana AMEN se despide de su público con dos conciertos especiales bajo el concepto “Decir Adiós”, una serie de presentaciones únicas que marcarán un antes y un después en su trayectoria, antes de iniciar su esperada gira por Europa.',
    precio: '50',
    tipo: 'video',
    media: '/eventoAmen.mp4',
    interes: null,
  },
];

const formatEventDate = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  if (value && typeof value === 'object') {
    const nested =
      (value as { FechaEvento?: string; Fecha?: string; fecha?: string }).FechaEvento ??
      (value as { FechaEvento?: string; Fecha?: string; fecha?: string }).Fecha ??
      (value as { FechaEvento?: string; Fecha?: string; fecha?: string }).fecha;

    if (nested) return formatEventDate(nested);
  }

  return 'Fecha por definir';
};

const resolvePrimaryDate = (raw: RawEventoApi): string | undefined => {
  const getString = (value: unknown): string | undefined =>
    typeof value === 'string' ? value : undefined;

  const nestedDate =
    (raw.Fecha && typeof raw.Fecha === 'object'
      ? getString(raw.Fecha.Fecha) ?? getString(raw.Fecha.FechaEvento)
      : undefined) ??
    (raw.fecha && typeof raw.fecha === 'object'
      ? getString((raw.fecha as any).Fecha) ??
      getString((raw.fecha as any).FechaEvento)
      : undefined);

  const candidates = [
    getString(raw.FechaEvento),
    getString(raw.fechaEvento),
    getString(raw.Fecha),          // <-- ahora no devuelve objetos
    nestedDate,
    getString(raw.Fechas?.[0]?.Fecha),
    getString(raw.EventoFechas?.[0]?.FechaEvento),
    getString(raw.EventoFechas?.[0]?.Fecha),
    getString(raw.FechaCreacion),
    getString(raw.fecha),
    getString(raw.fechaCreacion),
  ];

  return candidates.find((c): c is string => typeof c === 'string');
};


const resolvePrice = (raw: RawEventoApi): number => {
  const candidates: Array<number | undefined> = [
    raw.Tarifa,
    raw.Tarifas?.[0]?.Precio,
    raw.Tarifas?.[0]?.PrecioBase,
    raw.Tarifas?.[0]?.Tarifa,
    raw.EventoFechas?.[0]?.Tarifas?.[0]?.Precio,
    raw.EventoFechas?.[0]?.Tarifas?.[0]?.PrecioBase,
    raw.EventoFechas?.[0]?.Tarifas?.[0]?.Tarifa,
    raw.TiposTicket?.[0]?.Precio,
    raw.TiposTicket?.[0]?.PrecioBase,
    raw.TotalRecaudado,
  ];

  const firstDefined = candidates.find((value) => typeof value === 'number' && !Number.isNaN(value));
  return firstDefined ?? 0;
};

const mapApiEvent = (raw: RawEventoApi, index: number): Evento => {
  const candidateId =
    raw.ID ?? raw.Id ?? raw.IdEvento ?? raw.idEvento ?? raw.id ?? index + 1;
  const numericId = typeof candidateId === 'number' ? candidateId : Number(candidateId);
  const mediaCandidate = [
    raw.VideoPresentacion,
    raw.ImagenPortada,
    raw.ImagenDescripcion,
    raw.ImagenEscenario,
  ].find((value) => typeof value === 'string' && value.trim().length > 0);
  const media = (mediaCandidate ?? '').trim();
  const priceCandidate = resolvePrice(raw);
  const firstDate = resolvePrimaryDate(raw);

  const titulo = raw.Titulo ?? raw.titulo ?? 'Evento sin titulo';
  const descripcion = raw.Descripcion ?? raw.descripcion ?? 'Evento sin descripcion';
  const lugar = raw.Lugar ?? raw.lugar ?? 'Ubicacion por definir';
  const isVideo =
    (typeof raw.VideoPresentacion === 'string' && raw.VideoPresentacion.trim().length > 0) ||
    media.toLowerCase().endsWith('.mp4');

  return {
    id: Number.isNaN(numericId) ? index + 1 : numericId,
    titulo,
    fecha: formatEventDate(firstDate),
    lugar,
    descripcion,
    precio: String(priceCandidate ?? 0),
    tipo: isVideo ? 'video' : 'imagen',
    media: media.length > 0 ? media : '/eventoHH.jpg',
    interes: null,
  };
};

const NexiventFeed: React.FC = () => {
  const [eventosState, setEventosState] = useState<Evento[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showDescription, setShowDescription] = useState<boolean>(false);
  const [precioMin, setPrecioMin] = useState<number>(0);
  const [precioMax, setPrecioMax] = useState<number>(200);
  const [distanciaKm, setDistanciaKm] = useState<number>(10);
  const touchStartY = useRef<number>(0);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();

    const loadFeed = async () => {
      try {
        setStatus('loading');
        const response = await fetch(FEED_ENDPOINT, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`API respondio ${response.status}`);

        const payload = await response.json();
        const rawEventos = Array.isArray(payload) ? payload : payload?.eventos ?? payload?.data ?? [];
        if (!Array.isArray(rawEventos)) throw new Error('Formato de respuesta inesperado');

        const mapped = rawEventos
          .map((item: RawEventoApi, index: number) => mapApiEvent(item, index))
          .filter((item) => Boolean(item));

        if (mapped.length === 0) throw new Error('Sin eventos publicados');

        videoRefs.current = [];
        setEventosState(mapped);
        setCurrentIndex(0);
        setStatus('ready');
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('No se pudo cargar el feed de eventos', error);
        setEventosState(fallbackEventos);
        setCurrentIndex(0);
        setStatus('error');
      }
    };

    void loadFeed();

    return () => controller.abort();
  }, []);

  const handleTouchStart = (e: any): void => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: any): void => {
    if (isScrolling || eventosState.length === 0) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < eventosState.length - 1) {
        scrollToIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        scrollToIndex(currentIndex - 1);
      }
    }
  };

  const handleWheel = (e: any): void => {
    if (isScrolling || eventosState.length === 0) return;

    e.preventDefault();
    if (e.deltaY > 0 && currentIndex < eventosState.length - 1) {
      scrollToIndex(currentIndex + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const scrollToIndex = (index: number): void => {
    setIsScrolling(true);
    setCurrentIndex(index);

    videoRefs.current.forEach((video, i) => {
      if (video) {
        if (i === index) {
          video.play();
        } else {
          video.pause();
        }
      }
    });

    setTimeout(() => setIsScrolling(false), 600);
  };

  const toggleInteres = (id: number, value: boolean): void => {
    setEventosState((prev) => prev.map((e) => (e.id === id ? { ...e, interes: value } : e)));
  };

  const handleNoInteres = (): void => {
    const current = eventosState[currentIndex];
    if (!current) return;

    toggleInteres(current.id, false);
    if (currentIndex < eventosState.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const toggleMute = (): void => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.muted = newMutedState;
    }
  };

  return (
    <div className='fixed inset-0 w-screen h-screen bg-black overflow-hidden'>
      {status !== 'ready' && (
        <div className='absolute top-5 left-5 z-50 px-4 py-2 rounded-lg bg-black/70 text-white text-sm'>
          {status === 'loading' ? 'Cargando eventos...' : 'Mostrando eventos de respaldo'}
        </div>
      )}
      {eventosState.length === 0 && (
        <div className='absolute inset-0 flex items-center justify-center text-white z-40 pointer-events-none'>
          {status === 'loading' ? 'Cargando eventos...' : 'No hay eventos publicados'}
        </div>
      )}
      <div
        className='fixed inset-0 w-screen h-screen'
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div
          className='w-full h-full transition-transform duration-500 ease-out'
          style={{ transform: `translateY(-${currentIndex * 100}vh)` }}
        >
          {eventosState.map((evento, index) => (
            <div
              key={evento.id}
              className='absolute w-full h-full'
              style={{
                transform: `translateY(${index * 100}vh)`,
              }}
            >
              <div className='absolute inset-0'>
                {evento.tipo === 'video' ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    src={evento.media}
                    className='w-full h-full object-cover'
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                  >
                    <track
                      default
                      kind='captions'
                      src={`/captions/evento-${evento.id}.vtt`}
                      srcLang='es'
                      label='Español'
                    />
                  </video>
                ) : (
                  <img
                    src={evento.media}
                    alt={evento.titulo}
                    className='w-full h-full object-cover'
                  />
                )}
                <div className='absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70'></div>
              </div>

              {evento.tipo === 'video' && (
                <button
                  onClick={toggleMute}
                  className='absolute bottom-8 right-8 w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all z-50 shadow-lg'
                >
                  {isMuted ? (
                    <VolumeX size={24} className='text-white' />
                  ) : (
                    <Volume2 size={24} className='text-white' />
                  )}
                </button>
              )}

              <div className='absolute top-20 left-0 right-0 px-8 z-10 text-center'>
                <h1 className='text-white text-5xl font-bold mb-3 tracking-tight drop-shadow-lg'>
                  {evento.titulo}
                </h1>
                <p className='text-white/95 text-xl mb-3 drop-shadow-md'>
                  {evento.fecha} - {evento.lugar}
                </p>
                <div className='flex items-center justify-center gap-3'>
                  <span className='text-white text-3xl font-bold drop-shadow-lg'>
                    Desde S/{evento.precio}
                  </span>
                </div>
              </div>

              <div className='absolute bottom-8 left-1/2 -translate-x-1/2 z-20'>
                <div className='flex items-center gap-6 mb-4 relative'>
                  <button
                    onClick={() => toggleInteres(evento.id, true)}
                    className='flex flex-col items-center gap-1 group'
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${evento.interes === true
                        ? 'bg-green-500'
                        : 'bg-white/10 backdrop-blur-sm group-hover:bg-white/20'
                        }`}
                    >
                      <Heart
                        size={22}
                        className={evento.interes === true ? 'fill-white text-white' : 'text-white'}
                      />
                    </div>
                    <span className='text-white text-xs font-medium'>Me interesa</span>
                  </button>

                  <button
                    onClick={handleNoInteres}
                    className='flex flex-col items-center gap-1 group'
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${evento.interes === false
                        ? 'bg-orange-500'
                        : 'bg-white/10 backdrop-blur-sm group-hover:bg-white/20'
                        }`}
                    >
                      <X size={22} className='text-white' />
                    </div>
                    <span className='text-white text-xs font-medium'>No por ahora</span>
                  </button>

                  <div
                    className='flex flex-col items-center gap-1 group relative'
                    onMouseEnter={() => setShowDescription(true)}
                    onMouseLeave={() => setShowDescription(false)}
                  >
                    <div className='w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all cursor-pointer'>
                      <svg
                        className='w-6 h-6 text-white'
                        fill='none'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path>
                      </svg>
                    </div>
                    <span className='text-white text-xs font-medium'>Descripción</span>

                    {showDescription && (
                      <div className='absolute bottom-20 left-1/2 -translate-x-1/2 w-80 bg-black/70 backdrop-blur-md rounded-xl p-5 shadow-2xl transition-all duration-300 pointer-events-none'>
                        <p className='text-white/95 text-sm leading-relaxed'>
                          {evento.descripcion}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    className='flex flex-col items-center gap-1 group'
                    onClick={() => void router.push(`/event/${evento.id.toString()}`)}
                  >
                    <div className='w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all'>
                      <Ticket size={22} className='text-white' />
                    </div>
                    <span className='text-white text-xs font-medium text-center leading-tight'>
                      Ver entradas
                    </span>
                  </button>

                  <button className='flex flex-col items-center gap-1 group'>
                    <div className='w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all'>
                      <Share2 size={22} className='text-white' />
                    </div>
                    <span className='text-white text-xs font-medium'>Compartir</span>
                  </button>
                </div>

                {index < eventosState.length - 1 && index === currentIndex && (
                  <div className='flex flex-col items-center gap-1 animate-bounce'>
                    <span className='text-white/60 text-xs font-medium'>Desliza</span>
                    <svg
                      className='w-5 h-5 text-white/60'
                      fill='none'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path d='M19 9l-7 7-7-7'></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default NexiventFeed;
