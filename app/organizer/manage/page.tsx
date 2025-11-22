import { type Metadata } from 'next';

import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';

import EventManager from '../components/EventManager';

const Page: React.FC = () => (
    <Master>
        <Section className='organizer-hero hero-offset'>
            <div className='container'>
                <div className='organizer-hero__content'>
                    <Heading type={1} color='white' text='Gestionar eventos' />
                    <p className='gray'>
                        Edita eventos en borrador y cancela eventos futuros desde un panel centralizado.
                        Filtra por estado para encontrar rápidamente lo que necesitas.
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
                <EventManager />
            </div>
        </Section>
    </Master>
);

const title = 'Organizador | Gestión de eventos';
const canonical = 'https://modern-ticketing.com/organizer/manage';
const description =
    'Gestiona tus eventos, edita borradores y cancela eventos futuros desde un solo lugar.';

export const metadata: Metadata = {
    title,
    description,
    keywords: 'organizador, nexivent, gestionar eventos, editar eventos',
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
