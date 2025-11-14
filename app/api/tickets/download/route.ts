import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const eventName = url.searchParams.get('eventName') || 'Evento';
  const eventDate = url.searchParams.get('eventWhen') || 'Fecha';
  const eventVenue = url.searchParams.get('eventVenue') || 'Lugar';

  // Crear PDF tamaño A4 (595 x 842 puntos aprox)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const margin = 50;
  let y = 800; // Empezar desde arriba

  // Encabezado
  page.drawText('Tu Ticket', { x: margin, y, size: 24, font, color: rgb(0, 0, 0) });
  y -= 50;

  // Detalles del evento
  page.drawText(`Evento: ${eventName}`, { x: margin, y, size: 18, font, color: rgb(0, 0, 0) });
  y -= 30;
  page.drawText(`Fecha: ${eventDate}`, { x: margin, y, size: 16, font, color: rgb(0, 0, 0) });
  y -= 25;
  page.drawText(`Lugar: ${eventVenue}`, { x: margin, y, size: 16, font, color: rgb(0, 0, 0) });
  y -= 50;

  // Mensaje extra
  page.drawText('¡Gracias por tu compra!', { x: margin, y, size: 14, font, color: rgb(0, 0, 0) });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ticket-${eventName}.pdf`,
    },
  });
}
