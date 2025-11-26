import Link from 'next/link';
import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';

import FormSearch from './components/FormSearch';

const Page: React.FC = () => (
  <Master>
    {/* HERO */}
    <Section className='gray-background hero-offset'>
      <div className='container'>
        <div className='center'>
          <Heading type={1} color='gray' text='Centro de ayuda' />
          <p className='gray'>Encuentra respuestas a preguntas comunes y busca apoyo..</p>
        </div>
      </div>
    </Section>

    {/* FAQ NUEVO — SOLO TEXTO */}
    <Section className='white-background'>
      <div className='container'>
        <div className='center'>
          <Heading type={2} color='gray' text='Preguntas frequentes' />

          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'left' }}>

            <div className='padding-bottom'>
              <Heading type={5} color='gray' text='¿Cómo puedo comprar un ticket?' />
              <p className='gray'>
                Solo necesitas buscar el evento, seleccionar el tipo de entrada y completar el pago.
                Una vez confirmado, recibirás tu E-ticket automáticamente.
              </p>
            </div>

            <div className='padding-bottom'>
              <Heading type={5} color='gray' text='¿Dónde encuentro mis tickets?' />
              <p className='gray'>
                Tus tickets aparecen inmediatamente en tu cuenta dentro de la sección “Mis Tickets”.
                También se envían a tu correo registrado.
              </p>
            </div>

            <div className='padding-bottom'>
              <Heading type={5} color='gray' text='¿Necesito imprimir mi ticket?' />
              <p className='gray'>
                Para la mayoría de eventos NO es necesario imprimirlo; puedes mostrarlo desde tu celular.
                Sin embargo, eventos deportivos sí pueden exigir impresión según Ley N°30037.
              </p>
            </div>

            <div className='padding-bottom'>
              <Heading type={5} color='gray' text='¿Qué hago si pierdo o borro mi ticket?' />
              <p className='gray'>
                No te preocupes, tus tickets siempre están disponibles en tu cuenta.
                Puedes volver a descargarlos en cualquier momento.
              </p>
            </div>

            <div className='padding-bottom'>
              <Heading type={5} color='gray' text='¿Puedo pedir un reembolso?' />
              <p className='gray'>
                Los reembolsos dependen del organizador del evento. Si el evento lo permite,
                podrás solicitarlo desde la sección de soporte.
              </p>
            </div>

          </div>
        </div>
      </div>
    </Section>

    {/* FINAL CTA */}
    <Section className='gray-background'>
      <div className='container'>
        <div className='center'>
          <Heading type={3} color='gray' text='Más preguntas?' />
          <p className='gray'>
            Si no encuentras lo que buscas o necesitas más ayuda, por favor contáctanos y estaremos encantados de ayudarte.
          </p>

          <div className='button-container'>
            <ButtonLink
              color='blue-filled'
              rightIcon='arrow_forward'
              text='Contactanos'
              url='contact'
            />
          </div>
        </div>
      </div>
    </Section>
  </Master>
);

const title = 'Help';
const canonical = 'https://modern-ticketing.com/help';
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
