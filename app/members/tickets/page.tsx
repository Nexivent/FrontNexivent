import Link from 'next/link';

import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonGroup from '@components/Button/ButtonGroup';
import ButtonGroupItem from '@components/Button/ButtonGroupItem';

const Page: React.FC = () => (
  <Master>
    <Section className='white-background'>
      <div className='container'>
        <div className='center'>
          <Heading type={1} color='gray' text='Mis Tickets' />
          <p className='gray form-information'>
            Puedes acceder a los boletos que compraste desde esta página en cualquier momento.
Puedes descargarlos o enviarlos.
Ten en cuenta que no podrás ver los boletos de eventos que ya hayan finalizado o sido cancelados en esta página.
          </p>
          <div className='button-container'>
            <ButtonGroup color='gray'>
              <ButtonGroupItem url='members/tickets' text='Mis Tickets' active />
              <ButtonGroupItem url='members/account' text='Mi Cuenta' />
            </ButtonGroup>
          </div>
        </div>
      </div>
    </Section>
    <Section className='white-background'>
      <div className='container'>
        <div className='ticket-item'>
          <div className='item-right'>
            <h2>21</h2>
            <p>September</p>
            <span className='material-symbols-outlined'>qr_code_2</span>
            <strong>21EX9P</strong>
            <span className='up-border'></span>
            <span className='down-border'></span>
          </div>
          <div className='item-left'>
            <h5>Event name goes here</h5>
            <p>
              <span className='material-symbols-outlined'>event</span>
              Tue, Sep 21, 2024 19:00
            </p>
            <p>
              <span className='material-symbols-outlined'>apartment</span>
              Royal Albert Hall
            </p>
            <div className='actions'>
              <Link href='/members/tickets' title='Download tickets'>
                <span className='material-symbols-outlined'>download</span>
              </Link>
              <Link href='/members/tickets' title='Send tickets'>
                <span className='material-symbols-outlined'>forward_to_inbox</span>
              </Link>
            </div>
          </div>
        </div>

        <div className='ticket-item'>
          <div className='item-right'>
            <h2>21</h2>
            <p>September</p>
            <span className='material-symbols-outlined'>qr_code_2</span>
            <strong>21EX9P</strong>
            <span className='up-border'></span>
            <span className='down-border'></span>
          </div>
          <div className='item-left'>
            <h5>Event name goes here</h5>
            <p>
              <span className='material-symbols-outlined'>event</span>
              Tue, Sep 21, 2024 19:00
            </p>
            <p>
              <span className='material-symbols-outlined'>apartment</span>
              Royal Albert Hall
            </p>
            <div className='actions'>
              <Link href='/members/tickets' title='Download tickets'>
                <span className='material-symbols-outlined'>download</span>
              </Link>
              <Link href='/members/tickets' title='Send tickets'>
                <span className='material-symbols-outlined'>forward_to_inbox</span>
              </Link>
            </div>
          </div>
        </div>
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
