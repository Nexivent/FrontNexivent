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
          id='2'
          eventUrl='/event/2'
          eventName='JAZE - QUIZAS NO ES PARA TANTO'
          eventWhen='26 de setiembre 21:00'
          eventVenue='Costa 21'
          eventImage='/portadaJaze.jpg'
          purchaseDetails={[{ quantity: 2, type: 'VIP' }]}
          downloadUrl='/tickets/download/2'
          sendUrl='/tickets/send/2'
        />
        <TicketCard
          id='3'
          eventUrl='/event/3'
          eventName='MADISON FEST - HABLANDO HU*VADAS'
          eventWhen='13 de diciembre 19:00'
          eventVenue='Costa 21'
          eventImage='/eventoHH.jpg'
          purchaseDetails={[{ quantity: 3, type: 'General' }]}
          downloadUrl='/tickets/download/3'
          sendUrl='/tickets/send/3'
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
