import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';

const Page: React.FC = () => (
  <Master>
    {/* Hero */}
    <Section className='gray-background hero-offset'>
      <div className='container'>
        <div className='padding-bottom center'>
          <Heading type={1} color='gray' text='Sobre Nosotros' />
          <p className='gray'>
            Somos una plataforma moderna e intuitiva diseñada para facilitar la compra,
            gestión y validación de entradas para todo tipo de eventos.
          </p>
        </div>
      </div>
    </Section>

    {/* Nuestra misión */}
    <Section className='white-background'>
      <div className='container center'>
        <Heading type={3} color='gray' text='Nuestra Misión' />
        <p className='gray form-information'>
          Simplificar y mejorar la experiencia de compra de entradas, brindando a los usuarios
          un sistema rápido, seguro y transparente, mientras ofrecemos a los organizadores
          herramientas eficientes para gestionar sus eventos.
        </p>
      </div>
    </Section>

    {/* Nuestra visión */}
    <Section className='gray-background'>
      <div className='container center'>
        <Heading type={3} color='gray' text='Nuestra Visión' />
        <p className='gray form-information'>
          Convertirnos en la plataforma líder de ticketing en Perú,
          impulsando la innovación en la industria del entretenimiento y
          conectando a más personas con experiencias inolvidables.
        </p>
      </div>
    </Section>

  </Master>
);

const title = 'Sobre Nosotros';
const canonical = 'https://modern-ticketing.com/about';
const description = 'Conoce nuestra misión, visión y valores.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'sobre nosotros, misión, visión, ticketing, eventos',
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
