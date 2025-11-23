import Link from 'next/link';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import EventCard from '@components/Card/EventCard';
import CardGroup from '@components/Card/CardGroup';

import TicketForm from './components/TicketForm';
import LugarInfo from './components/LugarInfo';

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
  idTarifa: number;
  precio: number;
  tipoSector: string;
  stockDisponible: number;
  tipoTicket: string;
  fechaIni: string;
  fechaFin: string;
  perfil: string;
}

interface EventData {
  idEvento: number;
  titulo: string;
  descripcion: string;
  descripcionArtista: string;
  imagenPortada: string;
  lugar: string;
  imagenLugar?: string;
  fechas: Fecha[];
  tarifas: Tarifa[];
}

// =================================
// FUNCIÓN HELPER PARA IMÁGENES
// =================================

function getImageUrl(imagePath: string, fallback: string = '/portadaSkillbea.jpg'): string {
  if (!imagePath) return fallback;
  
  // Si ya es una URL completa, devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si es una ruta relativa, concatenar con la URL de la API
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098';
  return `${apiUrl}${imagePath}`;
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

async function getEventData(eventId: number): Promise<EventData> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098';
  
  // Primero obtenemos el summary
  const summaryUrl = `${apiUrl}/api/events/${eventId}/summary`;
  const summaryResponse = await fetch(summaryUrl, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!summaryResponse.ok) {
    if (summaryResponse.status === 404) {
      throw new Error('Evento no encontrado');
    }
    throw new Error(`Error al obtener el evento: ${summaryResponse.status}`);
  }

  const summaryData = await summaryResponse.json();
  
  // Validar solo que existan fechas y tarifas
  if (!summaryData.fechas || !summaryData.tarifas) {
    console.error('Estructura de respuesta inválida:', summaryData);
    throw new Error('Respuesta del servidor inválida');
  }
  
  // Ahora obtenemos la imagen del lugar
  try {
    const detailUrl = `${apiUrl}/evento/${eventId}/`;
    const detailResponse = await fetch(detailUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (detailResponse.ok) {
      const detailData = await detailResponse.json();
      summaryData.imagenLugar = detailData.imagenLugar || '';
    }
  } catch (error) {
    console.warn('No se pudo obtener la imagen del lugar:', error);
  }
  
  return summaryData;
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
    console.error('Error loading event:', error);
    notFound();
  }

  // Usar la función helper
  const eventImage = getImageUrl(eventData.imagenPortada);

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

              {/* Solo mostrar si hay descripción del artista */}
              {eventData.descripcionArtista && (
                <>
                  <Heading type={4} color='gray' text='Sobre el artista' />
                  <div className='paragraph-container gray'>
                    <p>
                      {eventData.descripcionArtista}
                    </p>
                  </div>
                </>
              )}

              <Heading type={4} color='gray' text='Lugar' />
              <LugarInfo 
                lugar={eventData.lugar} 
                imagenLugar={eventData.imagenLugar ? getImageUrl(eventData.imagenLugar) : undefined} 
              />
              
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
    
    // Usar la función helper
    const imageUrl = getImageUrl(eventData.imagenPortada, 'https://nexivent.com/logo192.png');

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