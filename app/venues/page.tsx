import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';

const Page: React.FC = () => (
  <Master>
    <Section className='gray-background hero-offset'>
      <div className='container'>
        <div className='center'>
          <Heading type={1} color='gray' text='Locales' />
          <p className='gray' style={{ maxWidth: 600, margin: '20px auto', lineHeight: 1.6 }}>
            Nuestros eventos pueden realizarse en múltiples locaciones.
            Cada evento mostrará la dirección exacta y toda la información del local
            directamente en su propia página.
          </p>
        </div>
      </div>
    </Section>
  </Master>
);

const title = 'Venues';
const canonical = 'https://modern-ticketing.com/venues';
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
