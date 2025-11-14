


import { type Metadata } from 'next';
import { Suspense } from "react";

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import EventCard from '@components/Card/EventCard';
import SearchPanel from './SearchPanelClient';
import CircleButtons from '../home/components/CircleButtons';

const Page: React.FC = () => (
  <Master>
    <Section className='gray-background hero-offset'>
  <div className='container'>
    <div className='padding-bottom center'>
      <Heading type={1} color='gray' text='Eventos' />
      <p className='gray'>Nexivent, busca eventos en Lima.</p>
    </div>

    {/* CATEGORÍAS CENTRADAS CON ICONOS */}
    <div className='flex justify-center'>
      <div className='max-w-5xl w-full px-8'>
        <CircleButtons />
      </div>
    </div>
  </div>
</Section>
<Section>
  <Suspense fallback={<div>Cargando búsqueda...</div>}>
    <SearchPanel />
  </Suspense>
</Section>
    <Section className='list-cards'>
  <div className='container center'>
    <EventCard
      url='1'
      from='35'
      color='yellow'
      when='10 de octubre'
      name='SKILLBEA - 4MAR'
      venue='Vichama Conciertos'
      image='/portadaSkillbea.jpg'
    />

    <EventCard
      url='2'
      from='59'
      color='yellow'
      when='26 de setiembre'
      name='JAZE - QUIZAS NO ES PARA TANTO'
      venue='Costa 21'
      image='/portadaJaze.jpg'
    />

    <EventCard
      url='3'
      from='44'
      color='yellow'
      when='13 de diciembre'
      name='MADISON FEST - HABLANDO HU*VADAS'
      venue='Costa 21'
      image='/eventoHH.jpg'
    />

    <EventCard
      url='4'
      from='50'
      color='yellow'
      when='8 de noviembre'
      name='Decir Adiós - Amén'
      venue='CC Leguia'
      image='/decirAdios.jpg'
    />
  </div>
</Section>

  </Master>
);

const title = 'List';
const canonical = 'https://modern-ticketing.com/list';
const description = 'Modern ticketing is a modern ticketing solution';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'modern ticketing',
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    type: 'website',
    siteName: 'Modern Ticketing',
    images: 'https://modern-ticketing.com/logo192.png',
  },
};

export default Page;
