'use client';

import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';

type Shortcut = {
  icon: string;
  title: string;
  copy: string;
  button: {
    color: React.ComponentProps<typeof ButtonLink>['color'];
    text: string;
    icon: string;
    url: string;
  };
};

const heroCopy = {
  title: 'Inicio del organizador',
  description:
    'Accede rápidamente a la creación de eventos, campañas promocionales y reportes desde un mismo panel.',
};

const organizerShortcuts: Shortcut[] = [
  {
    icon: 'event',
    title: 'Creación de eventos',
    copy:
      'Diseña experiencias completas, administra sectores, fechas y configura precios antes de publicar en Nexivent.',
    button: {
      color: 'yellow-filled',
      text: 'Ir al creador',
      icon: 'arrow_forward',
      url: 'organizer/events',
    },
  },
  {
    icon: 'confirmation_number',
    title: 'Cupones y promociones',
    copy:
      'Activa códigos, controla vigencias y filtra por evento para medir el impacto real de tus incentivos.',
    button: {
      color: 'gray-overlay',
      text: 'Administrar cupones',
      icon: 'arrow_forward',
      url: 'organizer/coupons',
    },
  },
  {
    icon: 'insights',
    title: 'Reportes y analytics',
    copy:
      'Revisa ventas, ingresos y el comportamiento de tus asistentes con el módulo de reportes en Nexivent.',
    button: {
      color: 'yellow-filled',
      text: 'Ver reportes',
      icon: 'arrow_forward',
      url: 'organizer/reports',
    },
  },
];

const OrganizerHome: React.FC = () => (
  <Master>
    <Section className='organizer-hero hero-offset'>
      <div className='container'>
        <div className='organizer-hero__content'>
          <Heading type={1} color='white' text={heroCopy.title} />
          <p className='gray'>{heroCopy.description}</p>
        </div>
      </div>
    </Section>
    <Section>
      <div className='container'>
        <div className='organizer-hub-grid'>
          {organizerShortcuts.map((shortcut) => (
            <div key={shortcut.title} className='organizer-hub-card'>
              <span className='material-symbols-outlined'>{shortcut.icon}</span>
              <h3>{shortcut.title}</h3>
              <p>{shortcut.copy}</p>
              <ButtonLink
                color={shortcut.button.color}
                text={shortcut.button.text}
                rightIcon={shortcut.button.icon}
                url={shortcut.button.url}
              />
            </div>
          ))}
        </div>
      </div>
    </Section>
  </Master>
);

export default OrganizerHome;
