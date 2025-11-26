import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';

const Page: React.FC = () => (
  <Master>

    <section className='white-background'>
      <div className='container'>
        <div className='center padding-bottom'>
        </div>
      </div>
    </section>

    <Section className='white-background'>
      <div className='container'>
        <div className='center padding-bottom'>
          <Heading type={3} color='gray' text='Términos de Servicio' />
        </div>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          Bienvenido a Modern Ticketing. Al acceder o utilizar nuestra plataforma, usted acepta los
          presentes Términos de Servicio. Si no está de acuerdo con alguno de estos términos, por favor
          no utilice nuestros servicios.
        </p>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          <strong>Uso del servicio:</strong> Usted se compromete a utilizar la plataforma de manera
          lícita y conforme a las leyes aplicables. Está prohibido vulnerar la seguridad del sistema o
          interferir con el funcionamiento de la plataforma.
        </p>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          <strong>Cuentas de usuario:</strong> La información proporcionada debe ser verídica. Usted es
          responsable de mantener la confidencialidad de sus credenciales y de la actividad realizada en
          su cuenta.
        </p>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          <strong>Eventos y entradas:</strong> Modern Ticketing actúa como proveedor tecnológico. La
          responsabilidad final sobre los eventos, contenido, logística o reembolsos recae en el
          organizador correspondiente.
        </p>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          <strong>Limitación de responsabilidad:</strong> Modern Ticketing no será responsable por daños
          indirectos, incidentales o derivados del uso del servicio.
        </p>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          <strong>Modificaciones:</strong> Podremos actualizar estos términos en cualquier momento. La
          versión vigente será publicada en esta misma página.
        </p>

        <div className='center padding-top padding-bottom'>
          <Heading type={3} color='gray' text='Política de Privacidad' />
        </div>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          En Modern Ticketing valoramos tu privacidad. Esta política describe cómo recopilamos,
          utilizamos y protegemos tu información personal al usar nuestros servicios.
        </p>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          <strong>Información que recopilamos:</strong> Datos proporcionados al crear una cuenta,
          comprar entradas o contactarnos, como nombre, correo electrónico, número de documento, método
          de pago y datos de uso de la plataforma.
        </p>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          <strong>Uso de la información:</strong> Utilizamos tus datos para procesar transacciones,
          proporcionar soporte, mejorar nuestros servicios y mantener la seguridad de la plataforma.
        </p>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          <strong>Compartición de datos:</strong> Solo compartimos información con organizadores de
          eventos en los que compras entradas, y con proveedores necesarios para la operación
          tecnológica. Nunca vendemos tu información personal.
        </p>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          <strong>Derechos del usuario:</strong> Puedes solicitar acceso, actualización o eliminación de
          tus datos personales escribiéndonos mediante nuestros canales de contacto.
        </p>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          <strong>Seguridad:</strong> Implementamos medidas técnicas y organizativas para proteger tu
          información contra accesos no autorizados.
        </p>

        <div className='center padding-top padding-bottom'>
          <Heading type={3} color='gray' text='Política de Cookies' />
        </div>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          Esta política explica qué son las cookies y cómo las utilizamos en Modern Ticketing.
        </p>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          <strong>¿Qué son las cookies?</strong> Son pequeños archivos que un sitio web almacena en tu
          dispositivo para mejorar la experiencia de navegación.
        </p>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          <strong>Cookies que utilizamos:</strong> Empleamos cookies esenciales para el funcionamiento
          de la plataforma, así como cookies analíticas para entender el uso del sitio. No utilizamos
          cookies publicitarias de terceros.
        </p>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          <strong>Control de cookies:</strong> Puedes deshabilitar las cookies desde la configuración de
          tu navegador, aunque esto podría afectar el funcionamiento de algunas funciones del sitio.
        </p>

        <p className='gray form-information' style={{ textAlign: "justify" }}>
          Si tienes preguntas sobre estos documentos legales, puedes contactarnos y estaremos
          encantados de ayudarte.
        </p>
      </div>
    </Section>

  </Master>
);

const title = 'Legal';
const canonical = 'https://modern-ticketing.com/legal/';
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
