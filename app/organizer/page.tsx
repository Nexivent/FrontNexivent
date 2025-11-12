import { type Metadata } from 'next';

import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';

const Page: React.FC = () => (
  <Master>
    <Section className='organizer-hero hero-offset'>
      <div className='container'>
        <div className='organizer-hero__content'>
          <Heading type={1} color='white' text='Inicio del organizador' />
          <p className='gray'>
            Accede rápidamente a la creación de eventos, campañas promocionales y futuros reportes
            desde un mismo panel.
          </p>
        </div>
      </div>
    </Section>
    <Section>
      <div className='container'>
        <div className='organizer-hub-grid'>
          <div className='organizer-hub-card'>
            <span className='material-symbols-outlined'>event</span>
            <h3>Creación de eventos</h3>
            <p>
              Diseña experiencias completas, administra sectores y configura precios antes de
              publicar en Nexivent.
            </p>
            <ButtonLink
              color='yellow-filled'
              text='Ir al creador'
              rightIcon='arrow_forward'
              url='organizer/events'
            />
          </div>
          <div className='organizer-hub-card'>
            <span className='material-symbols-outlined'>confirmation_number</span>
            <h3>Cupones y promociones</h3>
            <p>
              Activa códigos, controla vigencias y filtra por evento para medir el impacto real de
              tus incentivos.
            </p>
            <ButtonLink
              color='yellow-filled'
              text='Administrar cupones'
              rightIcon='arrow_forward'
              url='organizer/coupons'
            />
          </div>
          <div className='organizer-hub-card muted'>
            <span className='material-symbols-outlined'>insights</span>
            <h3>Reportes y analytics</h3>
            <p>
              Muy pronto podrás visualizar conversiones, asistencia y ventas en un solo tablero.
            </p>
            <ButtonLink color='disabled' text='Disponible pronto' url='#' />
          </div>
        </div>
      </div>
    </Section>
  </Master>
);

const title = 'Organizador | Inicio';
const canonical = 'https://modern-ticketing.com/organizer';
const description =
  'Panel principal del organizador para acceder a creación de eventos, cupones y herramientas clave.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'organizador, nexivent, panel',
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
