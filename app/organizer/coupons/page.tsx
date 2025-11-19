import { type Metadata } from 'next';

import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';

import CouponManager from '../components/CouponManager';

const Page: React.FC = () => (
  <Master>
    <Section className='organizer-hero hero-offset'>
      <div className='container'>
        <div className='organizer-hero__content'>
          <Heading type={1} color='white' text='Cupones del organizador' />
          <p className='gray'>
            Diseña campañas promocionales, ajusta su vigencia y monitoriza el rendimiento de cada
            código en tiempo real.
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
        <CouponManager />
      </div>
    </Section>
  </Master>
);

const title = 'Organizador | Cupones';
const canonical = 'https://modern-ticketing.com/organizer/coupons';
const description =
  'Gestiona cupones por evento, define valores y estados, y monitorea su uso en Nexivent.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'cupones, organizador, nexivent',
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
