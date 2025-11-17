import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

//Definir la estructura de las opciones del correo
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
  // Verificar que las credenciales están cargadas
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    throw new Error('Las credenciales de Gmail no están configuradas en .env.local');
  }

  const options = {
    from: `"Nexivent" <${process.env.GMAIL_USER}>`,
    ...mailDetails,
  };

  try {
    await transporter.sendMail(options);
    console.log(`Correo enviado exitosamente a ${mailDetails.to}`);
  } catch (error) {
    console.error(`Error al enviar correo a ${mailDetails.to}:`, error);
    throw new Error('El servicio de correo no pudo enviar el mensaje.');
  }
}
