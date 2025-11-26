import { type Metadata } from 'next';

// components
import Box from '@components/Box/Box';
import Master from '@components/Layout/Master';
import Slider from '@components/Slider/Slider';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';

const Page: React.FC = () => (
  <Master>
    <Section className='gray-background hero-offset'>
      <div className='container'>
        <div className='padding-bottom center'>
          <Heading type={1} color='gray' text='Organizadores' />
          <p className='gray form-information'>
            Ya sea que estés vendiendo una entrada o cien mil, la infraestructura de Nexivent
            está diseñada para cubrir todas tus necesidades.
          </p>
        </div>
      </div>
    </Section>

    <Section>
      <div className='container'>
        <div className='center'>
          <Heading type={5} color='gray' text='Gestiona todo desde una sola aplicación' />
          <p className='gray form-information'>
            Con nuestra aplicación para organizadores, puedes crear tus eventos, monitorear las ventas de
            entradas en tiempo real y acceder a informes detallados
          </p>
          <div className='button-container'>
            <ButtonLink
              text='Comenzar'
              color='gray-filled'
              rightIcon='arrow_forward'
              url='contact'
            />
          </div>
        </div>
      </div>
    </Section>




  </Master>
);

const title = 'Organizadores';
const canonical = 'https://modern-ticketing.com/promoters';
const description = 'Modern Ticketing es una solución moderna de ticketing.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'ticketing, organizadores, eventos',
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
