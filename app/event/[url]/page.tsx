import Link from 'next/link';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import EventCard from '@components/Card/EventCard';
import CardGroup from '@components/Card/CardGroup';

import TicketForm from './components/TicketForm';

interface PageProps {
  params: Promise<{
    url: string;
  }>;
}

// =================================
// VERSION CON DATOS HARDCODEADOS 
// =================================

const MOCK_EVENTS = [
  {
    idEvento: 1,
    titulo: 'SKILLBEA - 4MAR',
    descripcion: 'Skillbea presenta su nuevo single 4MAR junto a artistas invitados y más sorpresas para el público. Una noche inolvidable con lo mejor de la música urbana peruana.',
    sobreArtista: 'Skillbea es uno de los artistas más destacados de la escena urbana peruana, conocido por sus letras auténticas y su estilo único que fusiona trap, reggaetón y hip hop.',
    imagenPortada: '/portadaSkillbea.jpg',
    lugar: 'Vichama Conciertos',
    direccion: 'Jirón Carabaya 954',
    telefono: '980 132 591',
    fechas: [
      {
        idFechaEvento: 1,
        fecha: '2024-10-09',
        horaInicio: '20:00',
        horaFin: '23:00',
      },
      {
        idFechaEvento: 2,
        fecha: '2024-10-10',
        horaInicio: '21:00',
        horaFin: '00:00',
      }
    ],
    zonas: [
      {
        idSector: 2,
        nombre: 'Zona VIP',
        precio: 80,
        stock: 50,
        disponible: true,
      },
      {
        idSector: 3,
        nombre: 'Zona General',
        precio: 50,
        stock: 100,
        disponible: true,
      },
      {
        idSector: 4,
        nombre: 'Zona Platino',
        precio: 120,
        stock: 30,
        disponible: true,
      },
    ],
  },
  {
    idEvento: 2,
    titulo: 'JAZE - Quizás no es para tanto',
    descripcion: 'Jaze presenta su esperado álbum "Quizás no es para tanto" en vivo. Una experiencia musical única donde podrás disfrutar de sus mejores canciones en un ambiente íntimo y especial.',
    sobreArtista: 'Jaze es un cantautor peruano que ha conquistado al público con su estilo fresco y letras profundas. Su música mezcla pop, R&B y soul, creando un sonido único en la escena nacional.',
    imagenPortada: '/portadaJaze.jpg',
    lugar: 'Arena Costa 21',
    direccion: 'Av. Costa Rica 2175, San Miguel',
    telefono: '01 578 9090',
    fechas: [
      {
        idFechaEvento: 3,
        fecha: '2024-09-26',
        horaInicio: '21:00',
        horaFin: '00:00',
      }
    ],
    zonas: [
      {
        idSector: 5,
        nombre: 'Zona General',
        precio: 65,
        stock: 200,
        disponible: true,
      },
      {
        idSector: 6,
        nombre: 'Zona VIP',
        precio: 100,
        stock: 80,
        disponible: true,
      },
      {
        idSector: 7,
        nombre: 'Zona Platinum',
        precio: 150,
        stock: 40,
        disponible: true,
      },
    ],
  }
];

function getEventById(id: number) {
  return MOCK_EVENTS.find(event => event.idEvento === id);
}

function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return `${date.getDate()} de ${months[date.getMonth()]}`;
}

function formatMultipleDates(fechas: any[]): string {
  if (fechas.length === 0) return '';
  if (fechas.length === 1) return formatEventDate(fechas[0].fecha);
  
  const firstDate = new Date(fechas[0].fecha);
  const lastDate = new Date(fechas[fechas.length - 1].fecha);
  
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  if (firstDate.getMonth() === lastDate.getMonth()) {
    return `${firstDate.getDate()} y ${lastDate.getDate()} de ${months[firstDate.getMonth()]}`;
  }
  
  return `${firstDate.getDate()} de ${months[firstDate.getMonth()]} - ${lastDate.getDate()} de ${months[lastDate.getMonth()]}`;
}

export default async function Page({ params }: PageProps) {
  const { url } = await params;
  const eventId = parseInt(url, 10);
  
  if (isNaN(eventId) || eventId <= 0) {
    notFound();
  }
  
  const eventData = getEventById(eventId);
  
  if (!eventData) {
    notFound();
  }

  const ticketsData = eventData.zonas.map((zona, index) => ({
    id: zona.idSector,
    name: zona.nombre,
    price: `S/. ${zona.precio.toFixed(2)}`,
    ordering: index + 1,
    soldout: !zona.disponible || zona.stock === 0,
    quantity: 0,
    information: `Stock disponible: ${zona.stock}`,
  }));
  
  const eventImage = eventData.imagenPortada;

  return (
    <Master>
      <div className='blur-cover'>
        <div
          style={{
            backgroundImage: `url("${eventImage}")`,
          }}
          className='event-cover cover-image flex flex-v-center flex-h-center'
        />
        <div className='cover-info'>
          <div
            style={{
              backgroundImage: `url("${eventImage}")`,
            }}
            className='cover-image image'
          />
          <Heading type={1} color='white' text={eventData.titulo} />
          <Heading type={5} color='white' text={formatMultipleDates(eventData.fechas)} />
        </div>
      </div>

      <Section className='gray-background'>
        <div className='container'>
          <div className='event-details'>
            <div>
              <Heading type={4} color='gray' text='Descripción del evento' />
              <div className='paragraph-container gray'>
                <p>
                  {eventData.descripcion || 'Descripción del evento próximamente.'}
                </p>
              </div>

              <Heading type={4} color='gray' text='Sobre el artista' />
              <div className='paragraph-container gray'>
                <p>
                  {eventData.sobreArtista || 'Información del artista próximamente.'}
                </p>
              </div>

              <Heading type={4} color='gray' text='Lugar' />
              <Heading type={6} color='gray' text={eventData.lugar} />
              <div className='paragraph-container gray'>
                <p className='gray'>
                  {eventData.direccion && eventData.telefono 
                    ? `${eventData.direccion} · ${eventData.telefono}`
                    : 'Información de contacto próximamente.'
                  }
                </p>
              </div>
            </div>

            <div>
              <div className='ticket-box'>
                <div className='ticket-box-header'>
                  <Heading type={4} color='gray' text='Entradas' />
                </div>
                <TicketForm 
                  data={ticketsData} 
                  eventId={eventData.idEvento}
                  fechas={eventData.fechas}
                  eventData={eventData}
                />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </Master>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { url } = await params;
  const eventId = parseInt(url, 10);
  
  if (isNaN(eventId) || eventId <= 0) {
    return {
      title: 'Evento no encontrado - Nexivent',
      description: 'El evento que buscas no está disponible',
    };
  }
  
  const eventData = getEventById(eventId);
  
  if (!eventData) {
    return {
      title: 'Evento no encontrado - Nexivent',
      description: 'El evento que buscas no está disponible',
    };
  }
  
  const title = `${eventData.titulo} - Nexivent`;
  const description = `Compra tus entradas para ${eventData.titulo} en ${eventData.lugar}`;
  const canonical = `https://nexivent.com/event/${eventData.idEvento}`;
  const imageUrl = `https://nexivent.com${eventData.imagenPortada}`;

  return {
    title,
    description,
    keywords: `nexivent, eventos, entradas, tickets, ${eventData.titulo}, ${eventData.lugar}`,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: 'Nexivent',
      images: imageUrl,
    },
  };
}

// =================
// VERSION CON API 
// =================
/*
async function getEventData(eventId: number) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}/summary`,
    {
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Evento no encontrado');
  }

  return response.json();
}

export default async function Page({ params }: PageProps) {
  const { url } = await params;
  const eventId = parseInt(url, 10);
  
  if (isNaN(eventId) || eventId <= 0) {
    notFound();
  }
  
  let eventData;
  try {
    eventData = await getEventData(eventId);
  } catch (error) {
    notFound();
  }
  
  const ticketsData = eventData.zonas.map((zona: any, index: number) => ({
    id: zona.idSector,
    name: zona.nombre,
    price: `S/. ${zona.precio.toFixed(2)}`,
    ordering: index + 1,
    soldout: !zona.disponible || zona.stock === 0,
    quantity: 0,
    information: `Stock disponible: ${zona.stock}`,
  }));

  const eventImage = eventData.imagenPortada 
    ? `${process.env.NEXT_PUBLIC_API_URL}${eventData.imagenPortada}`
    : '/portadaSkillbea.jpg';

  return (
    <Master>
      // ... mismo JSX que arriba
    </Master>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { url } = await params;
  const eventId = parseInt(url, 10);
  
  if (isNaN(eventId) || eventId <= 0) {
    return {
      title: 'Evento no encontrado - Nexivent',
      description: 'El evento que buscas no está disponible',
    };
  }
  
  try {
    const eventData = await getEventData(eventId);
    const title = `${eventData.titulo} - Nexivent`;
    const description = `Compra tus entradas para ${eventData.titulo} en ${eventData.lugar}`;
    const canonical = `https://nexivent.com/event/${eventData.idEvento}`;
    const imageUrl = eventData.imagenPortada 
      ? `${process.env.NEXT_PUBLIC_API_URL}${eventData.imagenPortada}`
      : 'https://nexivent.com/logo192.png';

    return {
      title,
      description,
      keywords: `nexivent, eventos, entradas, tickets, ${eventData.titulo}, ${eventData.lugar}`,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        type: 'website',
        siteName: 'Nexivent',
        images: imageUrl,
      },
    };
  } catch {
    return {
      title: 'Evento no encontrado - Nexivent',
      description: 'El evento que buscas no está disponible',
    };
  }
}
*/