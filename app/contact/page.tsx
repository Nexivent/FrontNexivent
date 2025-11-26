import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';

const Page: React.FC = () => (
  <Master>
    <Section className='gray-background hero-offset'>
      <div className='container'>
        <div className='padding-bottom center'>
          <Heading type={1} color='gray' text='Contáctanos' />
          <p className='gray form-information'>
            Siéntete libre de comunicarte con nosotros a través de los siguientes canales
            para cualquier consulta, duda o sugerencia que puedas tener.
          </p>
        </div>
      </div>
    </Section>

    <Section className='gray-background'>
      <div className='container'>
        <div className='center'>
          <Heading type={5} color='gray' text='Atención al cliente' />
          <p className='gray form-information'>
            Nuestro servicio de atención al cliente está disponible de lunes a viernes de{' '}
            <strong>9:00 AM</strong> a <strong>6:00 PM</strong>, y los fines de semana de{' '}
            <strong>10:00 AM</strong> a <strong>6:00 PM</strong>
          </p>
          <div className='button-container'>
            &nbsp; &nbsp;
            <ButtonLink
              color='gray-filled'
              text='Envíanos un correo'
              rightIcon='arrow_forward'
              url='mailto:nexivent.tickets@gmail.com'
            />
          </div>
        </div>
      </div>
    </Section>

    <Section className='white-background'>
      <div className='container'>
        <div className='center'>
          <Heading type={5} color='gray' text='¿Cómo podemos ayudarte?' />
          <p className='gray form-information'>
            ¿Te gustaría revisar la sección de ayuda para encontrar la respuesta a tu
            consulta antes de escribirnos?
          </p>
          <div className='button-container'>
            <ButtonLink color='gray-filled' text='Página de ayuda' rightIcon='arrow_forward' url='help' />
          </div>
        </div>
      </div>
    </Section>

    <Section className='gray-background'>
      <div className='container'>
        <div className='center'>
          <Heading type={5} color='gray' text='Detalles de contacto' />
          <div className='paragraph-container'>
            <p className='gray'>
              Puedes escribirnos directamente a:
              <br />
              <strong>nexivent.tickets@gmail.com</strong>
              <br />
              <br />
              También puedes llamarnos al:
              <br />
              <strong>+51 999 999 999</strong>
              <br />
              <br />
              <strong>Nuestra dirección de oficina</strong>
              <br />
              Av. Universitaria 1801, San Miguel, Lima, Perú
            </p>
          </div>

        </div>
      </div>
    </Section>
  </Master>
);

const title = 'Contáctanos';
const mainUrl = 'https://www.modern-ticketing.com';
const canonical = `${mainUrl}/contact`;
const description = 'Modern ticketing es una solución moderna de ticketing';

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
    images: `${mainUrl}/logo192.png`,
  },
};

export default Page;
