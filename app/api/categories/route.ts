import { NextResponse } from 'next/server';

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
};

const categories: Category[] = [
  {
    id: 1,
    name: 'Conciertos',
    slug: 'conciertos',
    description: 'Festivales, showcases y sesiones íntimas de música en vivo.',
    color: '#f5a524',
    icon: 'music_note',
  },
  {
    id: 2,
    name: 'Teatro y performance',
    slug: 'teatro',
    description: 'Obras independientes, musicales y puestas experimentales.',
    color: '#9747ff',
    icon: 'theater_comedy',
  },
  {
    id: 3,
    name: 'Conferencias',
    slug: 'conferencias',
    description: 'Charlas profesionales, workshops y meetups especializados.',
    color: '#00b894',
    icon: 'record_voice_over',
  },
  {
    id: 4,
    name: 'Deportes',
    slug: 'deportes',
    description: 'Eventos deportivos masivos y competencias locales.',
    color: '#ff7675',
    icon: 'stadium',
  },
  {
    id: 5,
    name: 'Experiencias gastronómicas',
    slug: 'gastronomia',
    description: 'Pop-ups, rutas de bares y experiencias culinarias.',
    color: '#ff8d72',
    icon: 'restaurant',
  },
];

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    data: categories,
    pagination: { total: categories.length, page: 1, pageSize: categories.length },
    metadata: {
      cachedAt: new Date().toISOString(),
      source: 'mock:organizer-categories',
    },
  });
}
