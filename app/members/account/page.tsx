import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonGroup from '@components/Button/ButtonGroup';
import ButtonGroupItem from '@components/Button/ButtonGroupItem';
import FormPhoto from './components/FormPhoto';
import ProfileClient from './ProfileClient'; // 👈 nuevo componente cliente

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
      <Section className='white-background'>
        <div className='container'>
          <div className='center'>
            <Heading type={1} color='gray' text='My account' />
            <p className='gray form-information'>
              You can update your profile photo and your account details here.
            </p>
            <div className='button-container'>
              <ButtonGroup color='gray'>
                <ButtonGroupItem url='members/tickets' text='My tickets' />
                <ButtonGroupItem url='members/account' text='My account' active />
              </ButtonGroup>
            </div>
            <div className='padding-top'>
              <FormPhoto data='https://www.desura.games/files/images/49/49eee8a55fe13133dc5d8ae33106c74b.jpg' />
            </div>
          </div>
        </div>
      </Section>

      {/* 👇 este componente sí puede usar hooks */}
      <Section className='white-background'>
        <div className='container'>
          <ProfileClient />
        </div>
      </Section>
    </Master>
  );
};

export default Page;
