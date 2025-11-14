import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';

const Page: React.FC = () => (
  <Master>
    <Section className='gray-background hero-offset'>
      <div className='container'>
        <div className='purchase-summary'>
          <Heading type={4} color='gray' text='Compra Exitosa' />
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
          <div className='success-message'>
            <p>¡Gracias por tu compra!</p>
            <p>Recibirás un correo electrónico de confirmación en breve.</p>
          </div>
        </div>
      </div>
    </Section>
  </Master>
);

const title = 'Resumen de compra';
const canonical = 'https://modern-ticketing.com/buy/success';
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
