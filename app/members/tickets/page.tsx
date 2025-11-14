import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import TicketCard from '@components/Card/TicketCard';

const Page: React.FC = () => (
  <Master>
    <Section className='black-background hero-offset'>
      <div className='container'>
        <div className='center'>
          <Heading type={1} color='gray' text='Mis Tickets' />
          <p className='gray form-information'>
            Puedes acceder a los boletos que compraste desde esta página en cualquier momento.
            Puedes descargarlos o enviarlos. Ten en cuenta que no podrás ver los boletos de eventos
            que ya hayan finalizado o sido cancelados en esta página.
          </p>
        </div>
      </div>
    </Section>
    <Section className='list-cards'>
      <div className='container events-grid'>
        <TicketCard
          eventUrl='/event/1'
          eventName='Event name goes here'
          eventWhen='Tue, Sep 21, 2024 19:00'
          eventVenue='Royal Albert Hall'
          eventImage='https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=400&auto=format&fit=crop'
          purchaseDetails={[
            { quantity: 2, type: 'Entrada Adulto' },
            { quantity: 1, type: 'Entrada Niño' },
          ]}
          downloadUrl='/tickets/download/1'
          sendUrl='/tickets/send/1'
        />
        <TicketCard
          eventUrl='/event/2'
          eventName='Another Event Name'
          eventWhen='Wed, Aug 9, 2024 22:00'
          eventVenue='o2 Arena'
          eventImage='https://images.unsplash.com/photo-1472691681358-fdf00a4bfcfe?q=80&w=400&auto=format&fit=crop'
          purchaseDetails={[{ quantity: 4, type: 'Entrada Familiar' }]}
          downloadUrl='/tickets/download/2'
          sendUrl='/tickets/send/2'
        />
      </div>
    </Section>
  </Master>
);

const title = 'Mis Tickets';
const canonical = 'https://modern-ticketing.com/members/tickets';
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
