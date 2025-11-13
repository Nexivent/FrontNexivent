// types
import { type Metadata, type Viewport } from 'next';

// styles
import './styles/ui.css';
import './styles/site.css';

import Providers from './providers';

const title = 'Nexivent';
const canonical = 'https://nexivent.com';
const description = 'Nexivent - Tu siguiente evento, nuestra misión';

export const viewport: Viewport = {
  width: 'device-width',
  themeColor: '#ffffff',
  initialScale: 1,
};

export const metadata: Metadata = {
  title,
  description,
  robots: 'noindex, nofollow',
  keywords: 'nexivent, eventos, tickets, gestión de eventos, entradas en línea',
  alternates: { canonical },
  icons: {
    icon: '/favicon.ico',
    apple: '/logo192.png',
    shortcut: '/logo192.png',
  },
  metadataBase: new URL(canonical),
  openGraph: {
    title,
    description,
    url: canonical,
    type: 'website',
    images: '/logo192.png',
    siteName: 'Nexivent',
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang='es'>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
