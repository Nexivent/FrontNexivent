// app/api/ticket-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const eventName = url.searchParams.get('eventName') || 'Evento';
    const eventDate = url.searchParams.get('eventWhen') || 'Fecha';
    const eventVenue = url.searchParams.get('eventVenue') || 'Lugar';

    // Crear PDF
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 50;

    // ------------------------------------------------------
    // ⭐ Fondo negro
    // ------------------------------------------------------
    const drawBlackBackground = () => {
      page.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
        color: rgb(0, 0, 0),
      });
    };

    drawBlackBackground();

    // ------------------------------------------------------
    // ⭐ Cargar logo
    // ------------------------------------------------------
    const logoPath = path.join(process.cwd(), 'public', 'logo_transparente.png');
    let logoImage = null;

    try {
      if (fs.existsSync(logoPath)) {
        const logoBytes = fs.readFileSync(logoPath);
        logoImage = await pdfDoc.embedPng(logoBytes);
      }
    } catch {
      logoImage = null;
    }

    if (logoImage) {
      const dims = logoImage.scale(0.25);
      page.drawImage(logoImage, {
        x: pageWidth / 2 - dims.width / 2,
        y: 740,
        width: dims.width,
        height: dims.height,
      });
    }

    // ------------------------------------------------------
    // ⭐ Título
    // ------------------------------------------------------
    page.drawText('E-Ticket', {
      x: margin,
      y: 700,
      size: 28,
      font,
      color: rgb(1, 1, 1), // blanco
    });

    // Línea separadora
    page.drawRectangle({
      x: margin,
      y: 690,
      width: 500,
      height: 2,
      color: rgb(1, 1, 1),
    });

    // ------------------------------------------------------
    // ⭐ Información del evento
    // ------------------------------------------------------
    let y = 650;

    const drawField = (label: string, value: string) => {
      page.drawText(label, {
        x: margin,
        y,
        size: 12,
        font,
        color: rgb(1, 1, 1),
      });

      page.drawText(value, {
        x: margin + 140,
        y,
        size: 14,
        font,
        color: rgb(1, 1, 1),
      });

      y -= 30;
    };

    drawField('Evento:', eventName);
    drawField('Fecha:', eventDate);
    drawField('Lugar:', eventVenue);

    // Línea separadora
    page.drawRectangle({
      x: margin,
      y: y + 10,
      width: 500,
      height: 1,
      color: rgb(0.9, 0.9, 0.9),
    });

    y -= 40;

    // ------------------------------------------------------
    // ⭐ QR centrado (queda mejor en blanco sobre negro)
    // ------------------------------------------------------
    const qrDataUrl = await QRCode.toDataURL(
      `${eventName}|${eventDate}|${eventVenue}`,
      { color: { dark: "#FFFFFF", light: "#000000" } } // blanco sobre negro
    );

    const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    const qrDims = qrImage.scale(1.6);

    page.drawImage(qrImage, {
      x: pageWidth / 2 - qrDims.width / 2,
      y: y - qrDims.height,
      width: qrDims.width,
      height: qrDims.height,
    });

    y -= qrDims.height + 20;

    // ------------------------------------------------------
    // ⭐ DISCLAIMER con texto en blanco
    // ------------------------------------------------------
    const disclaimerText = `
Con el E-ticket puedes acercarte directamente al evento portando una copia impresa y legible o, de manera virtual desde tu celular, con excepción de los eventos deportivos, conforme a la Ley N°30037, que exige portar la entrada impresa y el Documento Nacional de Identidad (DNI), siendo este último escaneado para el ingreso al evento.

El ingreso después de la hora señalada en la entrada está sujeto a las reglas del Organizador y del establecimiento donde se llevará a cabo el evento. El día del evento, al ingresar al establecimiento, el público podrá estar sujeto a verificaciones adicionales por razones de seguridad, de acuerdo a lo establecido por el organizador o la autoridad correspondiente.
`.trim();

    const maxWidth = pageWidth - margin * 2;
    const fontSize = 10;
    const lineHeight = 13;

    const addNewPage = () => {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      drawBlackBackground();
    };

    let textY = 120;

    const paragraphs = disclaimerText.split(/\n\s*\n/);

    for (const p of paragraphs) {
      const words = p.split(/\s+/);
      let current = '';
      const lines: string[] = [];

      for (const w of words) {
        const test = current ? `${current} ${w}` : w;

        if (font.widthOfTextAtSize(test, fontSize) > maxWidth) {
          lines.push(current);
          current = w;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);

      for (const line of lines) {
        if (textY - lineHeight < margin) {
          addNewPage();
          textY = pageHeight - margin;
        }

        page.drawText(line, {
          x: margin,
          y: textY,
          size: fontSize,
          font,
          color: rgb(1, 1, 1), // blanco
        });

        textY -= lineHeight;
      }

      textY -= lineHeight;
    }

    // ------------------------------------------------------
    // Guardar PDF
    // ------------------------------------------------------
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=ticket-${eventName}.pdf`,
      },
    });
  } catch (err: any) {
    console.error('Error generando PDF:', err);

    return new NextResponse(
      JSON.stringify({
        error: 'Error generando PDF',
        detail: String(err),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
