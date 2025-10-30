import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';

import Form from './components/Form';

const Page: React.FC = () => (
  <Master>
    <Section className='gray-background'>
      <div className='container'>
        <div className='center' style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Heading type={1} color='white' text='Comprar tickets' />
          <p className='gray'>
            Por favor, ingresa tus datos personales y de pago. Emitiremos y enviaremos los tickets a
            tu correo electrónico de inmediato.
          </p>
        </div>
        <div className='purchase-summary'>
          <Heading type={4} color='gray' text='Detalles de la compra' />
          <div className='details-grid'>
            <div>
              <strong>Evento:</strong> Event name goes here
            </div>
            <div>
              <strong>Lugar:</strong> Royal Albert Hall
            </div>
            <div>
              <strong>Fecha:</strong> Tue, Sep 21, 2024 19:00
            </div>
          </div>
          <table className='purchase-summary-table'>
            <thead>
              <tr>
                <th>Ticket</th>
                <th align='center'>Cantidad</th>
                <th align='right'>Precio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Niño</td>
                <td align='center'>2</td>
                <td>£46</td>
              </tr>
              <tr>
                <td>Adulto</td>
                <td align='center'>2</td>
                <td>£46</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}>Total</td>
                <td>£92</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <Form />
        <div className='center' style={{ marginTop: '20px' }}>
          <p className='gray' style={{ fontSize: '0.9em' }}>
            Al hacer clic en el botón de pago, acepto los{' '}
            <a href='/terms' target='_blank' rel='noopener noreferrer' className='yellow'>
              Términos de servicio
            </a>
            .
          </p>
        </div>
      </div>
    </Section>
  </Master>
);

const title = 'Comprar tickets';
const canonical = 'https://modern-ticketing.com/buy';
const description = 'Modern ticketing is a modern ticketing solution';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'modern ticketing, comprar tickets',
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
