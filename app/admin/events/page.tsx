import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';

import EventCreator from './components/EventCreator';

const AdminEventsPage = () => (
  <Master>
    <Section className='gray-background hero-offset'>
      <div className='container'>
        <div className='admin-header'>
          <Heading type={1} color='white' text='Panel de eventos' />
          <p className='gray'>
            Diseña experiencias memorables, gestiona el inventario en vivo y prepara tu evento para
            salir a la venta. Cuando estés listo podrás conectar estos módulos con los endpoints
            oficiales.
          </p>
        </div>
        <EventCreator />
      </div>
    </Section>
  </Master>
);

const title = 'Panel de administración de eventos';
const canonical = 'https://nexivent.com/admin/events';
const description =
  'Crea, programa y administra eventos desde el panel de Nexivent con control total sobre tickets y estados.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'nexivent, administración de eventos, panel de control, ticketera',
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    type: 'website',
    siteName: 'Nexivent',
    images: 'https://nexivent.com/logo192.png',
  },
};

export default AdminEventsPage;
