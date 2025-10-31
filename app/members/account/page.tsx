import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonGroup from '@components/Button/ButtonGroup';
import ButtonGroupItem from '@components/Button/ButtonGroupItem';
import ProfileClient from './ProfileClient'; // 👈 mantiene solo este

export const metadata: Metadata = {
  title: 'My account',
  description: 'Modern ticketing is a modern ticketing solution',
  keywords: 'modern ticketing',
  alternates: { canonical: 'https://modern-ticketing.com/members/account' },
  openGraph: {
    title: 'My account',
    description: 'Modern ticketing is a modern ticketing solution',
    url: 'https://modern-ticketing.com/members/account',
    type: 'website',
    siteName: 'Modern Ticketing',
    images: 'https://modern-ticketing.com/logo192.png',
  },
};

const Page = () => {
  return (
    <Master>
      <Section className='black-background'>
        <div className='container'>
          <div className='center'>
            <Heading type={1} color='gray' text='Mi cuenta' />
            <p className='gray form-information'>
              Puedes actualizar los datos de tu cuenta y cambiar tu foto de perfil desde esta
              página.
            </p>
          </div>
        </div>
      </Section>
      {/* ✅ Solo queda este componente, que incluye FormPhoto + FormMain */}
      <Section className='black-background'>
        <div className='container'>
          <ProfileClient />
        </div>
      </Section>
    </Master>
  );
};

export default Page;
