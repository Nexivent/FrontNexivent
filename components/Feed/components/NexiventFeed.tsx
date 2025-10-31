'use client';
import React, { useState, useRef } from 'react';
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

const eventos: Evento[] = [
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

const NexiventFeed: React.FC = () => {
  const [eventosState, setEventosState] = useState<Evento[]>(eventos);
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

  const handleTouchStart = (e: any): void => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: any): void => {
    if (isScrolling) return;

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
    if (isScrolling) return;

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
    toggleInteres(eventoActual.id, false);
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

  const eventoActual = eventosState[currentIndex];

  return (
    <div className='fixed inset-0 w-screen h-screen bg-black overflow-hidden'>
      {/* Panel de Filtros*/}
      <div
        className={`fixed left-0 top-0 bottom-0 w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 z-40 transform transition-transform duration-300 ease-out ${
          showFilters ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='h-full flex flex-col'>
          {/* Header del panel */}
          <div className='px-5 pt-20 pb-4 border-b border-white/10'>
            <h2 className='text-white text-xl font-bold'>Filtros</h2>
            <p className='text-white/50 text-xs mt-1'>Personaliza tu búsqueda</p>
          </div>

          {/* Contenido de filtros */}
          <div className='flex-1 overflow-y-auto px-5 py-4 space-y-6'>
            {/* ¿Dónde? */}
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <MapPin size={16} className='text-yellow-300' />
                <h3 className='text-white text-sm font-semibold'>¿Dónde?</h3>
              </div>
              <button className='w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10'>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 rounded-full bg-yellow-300/20 flex items-center justify-center'>
                    <MapPin size={12} className='text-yellow-300' />
                  </div>
                  <div className='text-left'>
                    <p className='text-white text-xs font-medium'>Lima, Perú</p>
                  </div>
                </div>
                <span className='text-yellow-300 text-xs font-medium'>Cambiar</span>
              </button>
              <div className='mt-3'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-white/50 text-[10px]'>Radio de búsqueda</span>
                  <span className='text-yellow-300 text-xs font-bold'>+{distanciaKm} km</span>
                </div>
                <input
                  type='range'
                  min='0'
                  max='50'
                  value={distanciaKm}
                  onChange={(e) => setDistanciaKm(parseInt(e.target.value))}
                  className='w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer slider-km'
                  style={{
                    background: `linear-gradient(to right, #fde047 0%, #fde047 ${(distanciaKm / 50) * 100}%, rgba(255,255,255,0.1) ${(distanciaKm / 50) * 100}%, rgba(255,255,255,0.1) 100%)`,
                  }}
                />
                <div className='flex justify-between text-white/30 text-[10px] mt-1'>
                  <span>0 km</span>
                  <span>50 km</span>
                </div>
              </div>

              <style jsx>{`
                .slider-km::-webkit-slider-thumb {
                  appearance: none;
                  width: 14px;
                  height: 14px;
                  border-radius: 50%;
                  background: #fde047;
                  cursor: pointer;
                  border: 2px solid #000;
                }
                .slider-km::-moz-range-thumb {
                  width: 14px;
                  height: 14px;
                  border-radius: 50%;
                  background: #fde047;
                  cursor: pointer;
                  border: 2px solid #000;
                }
              `}</style>
            </div>

            {/* Fecha */}
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <Calendar size={16} className='text-yellow-300' />
                <h3 className='text-white text-sm font-semibold'>Fecha</h3>
              </div>
              <div className='space-y-2'>
                <div className='relative'>
                  <input
                    type='date'
                    className='w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-300 transition-all'
                  />
                  <label className='absolute -top-2 left-2 px-1 bg-black/60 text-white/50 text-[10px]'>
                    Desde
                  </label>
                </div>
                <div className='relative'>
                  <input
                    type='date'
                    className='w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-300 transition-all'
                  />
                  <label className='absolute -top-2 left-2 px-1 bg-black/60 text-white/50 text-[10px]'>
                    Hasta
                  </label>
                </div>
              </div>
            </div>

            {/* Categorías */}
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <Music size={16} className='text-yellow-300' />
                <h3 className='text-white text-sm font-semibold'>Categorías</h3>
              </div>
              <div className='flex flex-wrap gap-2'>
                {['Música', 'Deportes', 'Arte', 'Teatro', 'Tecnología', 'Gastronomía'].map(
                  (cat) => (
                    <button
                      key={cat}
                      className='px-3 py-1 bg-white/5 hover:bg-yellow-300/20 border border-white/10 hover:border-yellow-300/50 rounded-full text-white text-xs transition-all'
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Precio */}
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <DollarSign size={16} className='text-yellow-300' />
                <h3 className='text-white text-sm font-semibold'>Precio</h3>
              </div>
              <div className='flex items-center gap-3'>
                <div className='flex-1'>
                  <label className='text-white/50 text-[10px] mb-1 block'>Mínimo</label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-xs'>
                      S/
                    </span>
                    <input
                      type='number'
                      min='0'
                      max={precioMax}
                      value={precioMin}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        if (val <= precioMax) setPrecioMin(val);
                      }}
                      className='w-full pl-8 pr-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 focus:border-yellow-300 rounded-lg text-white text-sm focus:outline-none transition-all'
                    />
                  </div>
                </div>

                <div className='text-white/30 pt-5'>—</div>

                <div className='flex-1'>
                  <label className='text-white/50 text-[10px] mb-1 block'>Máximo</label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-xs'>
                      S/
                    </span>
                    <input
                      type='number'
                      min={precioMin}
                      max='500'
                      value={precioMax}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 200;
                        if (val >= precioMin) setPrecioMax(val);
                      }}
                      className='w-full pl-8 pr-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 focus:border-yellow-300 rounded-lg text-white text-sm focus:outline-none transition-all'
                    />
                  </div>
                </div>
              </div>

              {/* Opciones rápidas de precio*/}
              <div className='mt-3 flex flex-wrap gap-2'>
                <button
                  onClick={() => {
                    setPrecioMin(0);
                    setPrecioMax(30);
                  }}
                  className='px-2 py-1 bg-white/5 hover:bg-yellow-300/20 border border-white/10 rounded text-white/70 text-[10px] transition-all'
                >
                  Hasta S/30
                </button>
                <button
                  onClick={() => {
                    setPrecioMin(30);
                    setPrecioMax(60);
                  }}
                  className='px-2 py-1 bg-white/5 hover:bg-yellow-300/20 border border-white/10 rounded text-white/70 text-[10px] transition-all'
                >
                  S/30 - S/60
                </button>
                <button
                  onClick={() => {
                    setPrecioMin(60);
                    setPrecioMax(500);
                  }}
                  className='px-2 py-1 bg-white/5 hover:bg-yellow-300/20 border border-white/10 rounded text-white/70 text-[10px] transition-all'
                >
                  Más de S/60
                </button>
              </div>
            </div>
          </div>

          {/* Footer del panel con perfil de usuario */}
          <div className='px-5 py-3 border-t border-white/10 space-y-3'>
            <button className='w-full py-2 bg-yellow-300 hover:bg-yellow-400 rounded-lg text-black text-sm font-semibold transition-all'>
              Aplicar Filtros
            </button>
            <button className='w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 text-sm font-medium transition-all'>
              Limpiar
            </button>

            {/* Usuario */}
            <div className='pt-3 border-t border-white/10'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center'>
                  <span className='text-black text-sm font-bold'>U</span>
                </div>
                <div className='flex-1'>
                  <p className='text-white text-sm font-medium'>Usuario</p>
                  <p className='text-white/50 text-xs'>Ver perfil</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <button
          type='button'
          aria-label='Cerrar filtros'
          className='fixed inset-0 bg-black/50 z-30'
          onClick={() => setShowFilters(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowFilters(false);
          }}
        ></button>
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
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                        evento.interes === true
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
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                        evento.interes === false
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

                  <button className='flex flex-col items-center gap-1 group'>
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
