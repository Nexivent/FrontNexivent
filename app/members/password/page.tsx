import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';

import Form from './components/Form';

const Page: React.FC = () => (
  <Master>
    <Section className='gray-background hero-offset'>
      <div className='container'>
        <div className='center' style={{ marginBottom: '30px' }}>
          <Heading type={1} color='gray' text='Cambio de Contraseña' />
        </div>
        <Form />
      </div>
    </Section>
  </Master>
);

const title = 'Cambio de Contraseña | Nexivent';
const canonical = 'https://nexivent.com/members/password';
const description = 'Gestión de cambio de contraseña en Nexivent';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'nexivent, cambio contraseña, seguridad',
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    type: 'website',
    siteName: 'Nexivent',
    images: 'https://nexivent.com/logo.png',
  },
};

export default Page;
