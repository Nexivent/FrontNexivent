import nodemailer from 'nodemailer';

const getTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.error('❌ Credenciales de Gmail no configuradas');
    throw new Error('Las credenciales de Gmail no están configuradas en .env.local');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType: 'application/pdf';
  }[];
}

export async function sendEmail(mailDetails: MailOptions) {
  console.log('\n📧 Intentando enviar correo...');
  console.log('📨 Para:', mailDetails.to);
  console.log('📝 Asunto:', mailDetails.subject);
  console.log('👤 Desde:', process.env.GMAIL_USER);
  console.log('🔌 Servidor: smtp.gmail.com:465 (SSL)');

  try {
    const transporter = getTransporter();

    const options = {
      from: `"Nexivent" <${process.env.GMAIL_USER}>`,
      ...mailDetails,
    };

    const info = await transporter.sendMail(options);

    console.log('\n✅ ¡CORREO ENVIADO EXITOSAMENTE!');
    console.log('═══════════════════════════════════════════════');
    console.log('📬 Message ID:', info.messageId);
    console.log('📨 Aceptado por:', info.accepted);
    console.log('🔗 Response:', info.response);
    console.log('═══════════════════════════════════════════════\n');

    return info;
  } catch (error: any) {
    console.error('\n❌ ═══════════════════════════════════════════════');
    console.error('❌  ERROR AL ENVIAR CORREO');
    console.error('❌ ═══════════════════════════════════════════════');
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
    console.error('Respuesta:', error.response);
    console.error('═══════════════════════════════════════════════\n');

    // Manejo de errores específicos
    if (error.responseCode === 534 || error.message?.includes('534-5.7.9')) {
      throw new Error(
        'Error de autenticación con Gmail. Verifica que GMAIL_PASS sea una contraseña de aplicación válida.'
      );
    }

    if (error.code === 'ETIMEDOUT') {
      throw new Error(
        'Timeout al conectar con Gmail. El puerto 587 puede estar bloqueado por tu red.'
      );
    }

    if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
      throw new Error('Error de conexión con Gmail. Verifica tu conexión a internet.');
    }

    throw new Error(`Error al enviar correo: ${error.message}`);
  }
}
