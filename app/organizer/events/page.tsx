import { type Metadata } from 'next';
import { Suspense } from 'react';

import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';

import EventCreator from '../components/EventCreator';

const Page: React.FC = () => (
  <Master>
    <Section className='organizer-hero hero-offset'>
      <div className='container'>
        <div className='organizer-hero__content'>
          <Heading type={1} color='white' text='Crear y editar eventos' />
          <p className='gray'>
            Construye experiencias completas, gestiona sectores, perfiles y precios desde un solo
            lugar antes de publicar en Nexivent.
          </p>
          <div className='organizer-cta-row'>
            <ButtonLink
              color='yellow-filled'
              text='Volver al inicio'
              leftIcon='chevron_left'
              url='organizer'
            />
          </div>
        </div>
      </div>
    </Section>

    <Section>
      <div className='container'>
        {/* 🟡 Suspense obligatorio para componentes client con useSearchParams */}
        <Suspense fallback={<div>Cargando...</div>}>
          <EventCreator />
        </Suspense>
      </div>
    </Section>
  </Master>
);

const title = 'Organizador | Eventos';
const canonical = 'https://modern-ticketing.com/organizer/events';
const description =
  'Crea eventos, maneja inventario y define reglas de precios antes de publicarlos.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'organizador, nexivent, crear eventos',
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    type: 'website',
    siteName: 'Nexivent',
    images: 'https://modern-ticketing.com/logo192.png',
  },
};

export default Page;
