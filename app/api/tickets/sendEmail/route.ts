import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { sendEmail } from '@utils/emailSender';
import { generateTicketPDF } from '@utils/pdfGenerator';

export async function POST(request: NextRequest) {
  console.log('1. API Route iniciada.'); // Log 1
  try {
    const body = await request.json();
    console.log('2. Body recibido del frontend:', body); // Log 2

    const { eventName, eventDate, eventVenue, userEmail, userName } = body;

    if (!eventName || !userEmail) {
      console.error('3. Error: Faltan datos.'); // Log de error
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    console.log('3. Generando PDF...'); // Log 3
    const pdfBuffer = await generateTicketPDF({ eventName, eventDate, eventVenue, userName });
    console.log('4. PDF generado exitosamente. Tamaño:', pdfBuffer.length, 'bytes.'); // Log 4

    console.log(`5. Enviando correo a ${userEmail}...`); // Log 5
    await sendEmail({
      to: userEmail,
      subject: `Tus entradas para: ${eventName}`,
      html: `<p>Hola ${userName || ''}</p>`,
      attachments: [{ filename: `ticket.pdf`, content: pdfBuffer, contentType: 'application/pdf' }],
    });
    console.log('6. Correo enviado (llamada a sendEmail finalizada).'); // Log 6

    return NextResponse.json({ message: 'Correo enviado' });
  } catch (error) {
    // ESTE LOG ES CRUCIAL
    console.error('¡ERROR FATAL EN LA API ROUTE!:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
