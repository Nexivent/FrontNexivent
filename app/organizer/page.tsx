import { type Metadata } from 'next';
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import EventCreator from './components/EventCreator';

const Page: React.FC = () => (
  <Master>
    <Section className='organizer-hero hero-offset'>
      <div className='container'>
        <div className='organizer-hero__content'>
          <Heading type={1} color='white' text='Panel del organizador' />
          <p className='gray'>
            Diseñado para que puedas crear y iterar tus eventos con la misma experiencia visual que
            tus compradores ya conocen en Nexivent.
          </p>
        </div>
      </div>
    </Section>
    <Section>
      <div className='container'>
        <EventCreator />
      </div>
    </Section>
  </Master>
);

const title = 'Organizador | Nexivent';
const canonical = 'https://modern-ticketing.com/organizer';
const description =
  'Configura eventos, define stock por sector y establece precios por perfil y tipo de ticket.';

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
