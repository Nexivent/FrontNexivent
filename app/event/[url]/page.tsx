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
// TIPOS DE DATOS
// =================================

interface Fecha {
  idFechaEvento: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

interface Tarifa {
  idTipoTicket: number;
  nombreTicket: string;
  fechaInicio: string;
  fechaFin: string;
  idSector: number;
  nombreSector: string;
  idPerfil: number;
  nombrePerfil: string;
  precio: number;
  stockDisponible: number;
}

interface EventData {
  idEvento: number;
  titulo: string;
  descripcion: string;
  descripcionArtista: string;
  imagenPortada: string;
  lugar: string;
  estado: string;
  fechas: Fecha[];
  tarifas: Tarifa[];
}

// =================================
// DATOS MOCK PARA PRUEBAS
// =================================

const MOCK_EVENT_DATA: EventData = {
  idEvento: 1,
  titulo: 'SKILLBEA - 4MAR',
  descripcion: 'Skillbea presenta su nuevo single 4MAR junto a artistas invitados y más sorpresas para el público. Una noche inolvidable con lo mejor de la música urbana peruana.',
  descripcionArtista: 'Skillbea es uno de los artistas más destacados de la escena urbana peruana, conocido por sus letras auténticas y su estilo único que fusiona trap, reggaetón y hip hop.',
  imagenPortada: '/portadaSkillbea.jpg',
  lugar: 'Vichama Conciertos',
  estado: 'PUBLICADO',
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
  tarifas: [
    // VIP - Preventa (50 disponibles en total para el sector)
    {
      idTipoTicket: 1,
      nombreTicket: 'Preventa',
      fechaInicio: '2024-01-01',
      fechaFin: '2025-12-31', // Vigente para pruebas
      idSector: 1,
      nombreSector: 'VIP',
      idPerfil: 1,
      nombrePerfil: 'Profesional',
      precio: 80,
      stockDisponible: 50, // Stock del sector VIP
    },
    {
      idTipoTicket: 1,
      nombreTicket: 'Preventa',
      fechaInicio: '2024-01-01',
      fechaFin: '2025-12-31',
      idSector: 1,
      nombreSector: 'VIP',
      idPerfil: 2,
      nombrePerfil: 'Estudiante',
      precio: 60,
      stockDisponible: 50, // Mismo stock del sector VIP
    },
    {
      idTipoTicket: 1,
      nombreTicket: 'Preventa',
      fechaInicio: '2024-01-01',
      fechaFin: '2025-12-31',
      idSector: 1,
      nombreSector: 'VIP',
      idPerfil: 3,
      nombrePerfil: 'Founder',
      precio: 70,
      stockDisponible: 50, // Mismo stock del sector VIP
    },
    // General - Preventa (100 disponibles en total para el sector)
    {
      idTipoTicket: 1,
      nombreTicket: 'Preventa',
      fechaInicio: '2024-01-01',
      fechaFin: '2025-12-31',
      idSector: 2,
      nombreSector: 'General',
      idPerfil: 1,
      nombrePerfil: 'Profesional',
      precio: 50,
      stockDisponible: 100, // Stock del sector General
    },
    {
      idTipoTicket: 1,
      nombreTicket: 'Preventa',
      fechaInicio: '2024-01-01',
      fechaFin: '2025-12-31',
      idSector: 2,
      nombreSector: 'General',
      idPerfil: 2,
      nombrePerfil: 'Estudiante',
      precio: 35,
      stockDisponible: 100, // Mismo stock del sector General
    },
    {
      idTipoTicket: 1,
      nombreTicket: 'Preventa',
      fechaInicio: '2024-01-01',
      fechaFin: '2025-12-31',
      idSector: 2,
      nombreSector: 'General',
      idPerfil: 3,
      nombrePerfil: 'Founder',
      precio: 45,
      stockDisponible: 100, // Mismo stock del sector General
    },
    // Platino - Preventa (0 disponibles - AGOTADO para probar)
    {
      idTipoTicket: 1,
      nombreTicket: 'Preventa',
      fechaInicio: '2024-01-01',
      fechaFin: '2025-12-31',
      idSector: 3,
      nombreSector: 'Platino',
      idPerfil: 1,
      nombrePerfil: 'Profesional',
      precio: 120,
      stockDisponible: 0, // Sector Platino AGOTADO
    },
    {
      idTipoTicket: 1,
      nombreTicket: 'Preventa',
      fechaInicio: '2024-01-01',
      fechaFin: '2025-12-31',
      idSector: 3,
      nombreSector: 'Platino',
      idPerfil: 2,
      nombrePerfil: 'Estudiante',
      precio: 90,
      stockDisponible: 0, // Sector Platino AGOTADO
    },
    {
      idTipoTicket: 1,
      nombreTicket: 'Preventa',
      fechaInicio: '2024-01-01',
      fechaFin: '2025-12-31',
      idSector: 3,
      nombreSector: 'Platino',
      idPerfil: 3,
      nombrePerfil: 'Founder',
      precio: 100,
      stockDisponible: 0, // Sector Platino AGOTADO
    },
  ],
};

// Función para obtener datos mock
function getMockEventData(eventId: number): EventData {
  return MOCK_EVENT_DATA;
}

// =================================
// FUNCIONES AUXILIARES
// =================================

function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return `${date.getDate()} de ${months[date.getMonth()]}`;
}

function formatMultipleDates(fechas: Fecha[]): string {
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

// =================================
// FUNCIÓN PARA OBTENER DATOS DEL EVENTO
// =================================

// VERSION CON API (comentada para pruebas con mock)
/*
async function getEventData(eventId: number): Promise<EventData> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/evento/${eventId}`,
    {
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Evento no encontrado');
  }

  const data = await response.json();
  
  // Validar que el evento esté publicado
  if (data.estado !== 'PUBLICADO') {
    throw new Error('Evento no disponible');
  }

  return data;
}
*/

// VERSION CON MOCK (para pruebas)
async function getEventData(eventId: number): Promise<EventData> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (eventId !== 1) {
    throw new Error('Evento no encontrado');
  }
  
  return getMockEventData(eventId);
}

// =================================
// COMPONENTE PRINCIPAL
// =================================

export default async function Page({ params }: PageProps) {
  const { url } = await params;
  const eventId = parseInt(url, 10);
  
  if (isNaN(eventId) || eventId <= 0) {
    notFound();
  }
  
  let eventData: EventData;
  try {
    eventData = await getEventData(eventId);
  } catch (error) {
    notFound();
  }

  // Para mock, usar imagen local directamente
  const eventImage = eventData.imagenPortada || '/portadaSkillbea.jpg';
  
  // Para API, descomentar esto:
  // const eventImage = eventData.imagenPortada 
  //   ? `${process.env.NEXT_PUBLIC_API_URL}${eventData.imagenPortada}`
  //   : '/portadaSkillbea.jpg';

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
                  {eventData.descripcionArtista || 'Información del artista próximamente.'}
                </p>
              </div>

              <Heading type={4} color='gray' text='Lugar' />
              <Heading type={6} color='gray' text={eventData.lugar} />
            </div>

            <div>
              <div className='ticket-box'>
                <div className='ticket-box-header'>
                  <Heading type={4} color='gray' text='Entradas' />
                </div>
                <TicketForm 
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

// =================================
// METADATA
// =================================

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
    
    // Para mock, usar imagen local
    const imageUrl = eventData.imagenPortada || 'https://nexivent.com/logo192.png';
    
    // Para API, descomentar esto:
    // const imageUrl = eventData.imagenPortada 
    //   ? `${process.env.NEXT_PUBLIC_API_URL}${eventData.imagenPortada}`
    //   : 'https://nexivent.com/logo192.png';

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