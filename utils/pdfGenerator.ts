import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

// Estructura de los datos que necesita el PDF
export interface TicketPDFData {
  eventName: string;
  eventDate: string;
  eventVenue: string;
  userName?: string;
  orderId?: string;
}

export async function generateTicketPDF(data: TicketPDFData): Promise<Buffer> {
  const { eventName, eventDate, eventVenue, userName, orderId } = data;

  //Crear un nuevo documento PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // Tamaño A4
  const { width, height } = page.getSize();

  // Incrustar fuentes estándar
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  //Dibujar contenido en el PDF
  const margin = 50;
  let yPosition = height - 4 * margin;

  // Título principal
  page.drawText('Tu Entrada Digital - Nexivent', {
    x: margin,
    y: yPosition,
    font: helveticaBoldFont,
    size: 24,
    color: rgb(0.1, 0.1, 0.1),
  });
  yPosition -= 50;

  // Detalles del Evento
  page.drawText(eventName, {
    x: margin,
    y: yPosition,
    font: helveticaBoldFont,
    size: 20,
  });
  yPosition -= 30;

  page.drawText(`Fecha: ${eventDate}`, {
    x: margin,
    y: yPosition,
    font: helveticaFont,
    size: 14,
  });
  yPosition -= 20;

  page.drawText(`Lugar: ${eventVenue}`, {
    x: margin,
    y: yPosition,
    font: helveticaFont,
    size: 14,
  });
  yPosition -= 40;

  // Información del comprador
  if (userName) {
    page.drawText('Emitido para:', {
      x: margin,
      y: yPosition,
      font: helveticaBoldFont,
      size: 12,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 20;
    page.drawText(userName, {
      x: margin,
      y: yPosition,
      font: helveticaFont,
      size: 14,
    });
  }

  //Generar el Código QR usando el orderId o un ID de ticket
  const qrContent = `NEXIVENT-TICKET|EVENT:${eventName}|ORDER:${orderId || 'N/A'}`;
  const qrDataUrl = await QRCode.toDataURL(qrContent, { width: 200 });
  const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  // Dibujar el QR en la página
  page.drawImage(qrImage, {
    x: width / 2 - 100,
    y: yPosition - 250,
    width: 200,
    height: 200,
  });

  // Instrucciones
  page.drawText('Presenta este código QR en la entrada del evento.', {
    x: width / 2 - 150,
    y: yPosition - 270,
    font: helveticaFont,
    size: 12,
  });

  //Guardar el PDF como bytes
  const pdfBytes = await pdfDoc.save();

  return Buffer.from(pdfBytes);
}
