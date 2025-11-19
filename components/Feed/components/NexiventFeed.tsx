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
  const router = useRouter();

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
