import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const eventName = url.searchParams.get('eventName') || 'Evento';
  const eventDate = url.searchParams.get('eventWhen') || 'Fecha';
  const eventVenue = url.searchParams.get('eventVenue') || 'Lugar';

  // Crear PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // Tamaño A4 en puntos (72 dpi)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const margin = 50;
  let y = 750;

  // Encabezado
  page.drawText('Tu Ticket', { x: margin, y, size: 24, font, color: rgb(0,0,0) });
  y -= 50;

  // Detalles del evento
  page.drawText(`Evento: ${eventName}`, { x: margin, y, size: 16, font, color: rgb(0,0,0) });
  y -= 25;
  page.drawText(`Fecha: ${eventDate}`, { x: margin, y, size: 16, font, color: rgb(0,0,0) });
  y -= 25;
  page.drawText(`Lugar: ${eventVenue}`, { x: margin, y, size: 16, font, color: rgb(0,0,0) });
  y -= 50;

  // Generar QR con el contenido que quieras
  const qrDataUrl = await QRCode.toDataURL(`${eventName}|${eventDate}|${eventVenue}`);
  const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  const qrDims = qrImage.scale(1); // Ajusta tamaño si quieres
  page.drawImage(qrImage, {
    x: margin,
    y: y - qrDims.height,
    width: 150,
    height: 150,
  });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ticket-${eventName}.pdf`,
    },
  });
}
