import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@utils/emailSender';

interface Attendee {
  email: string;
  nombre: string;
}

interface EventCancellationData {
  eventId: number;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  attendees: Attendee[];
}

export async function POST(request: NextRequest) {
  try {
    console.log('📧 [API] Iniciando envío de notificaciones de cancelación...');

    const body: EventCancellationData = await request.json();
    const { eventTitle, eventDate, eventLocation, attendees } = body;

    if (!attendees || attendees.length === 0) {
      return NextResponse.json({ message: 'No hay asistentes para notificar' }, { status: 200 });
    }

    console.log(`📧 [API] Enviando notificación a ${attendees.length} asistente(s)`);

    // Enviar correos a cada asistente
    const emailPromises = attendees.map(async (attendee) => {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .event-details h3 { margin-top: 0; color: #667eea; }
            .detail-item { margin: 10px 0; display: flex; align-items: center; }
            .detail-item span { margin-right: 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔴 Evento Cancelado</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${attendee.nombre}</strong>,</p>
              
              <div class="alert-box">
                <strong>⚠️ Aviso Importante:</strong> Lamentamos informarte que el siguiente evento ha sido cancelado.
              </div>

              <div class="event-details">
                <h3>📅 Detalles del Evento Cancelado</h3>
                <div class="detail-item">
                  <span>🎫</span>
                  <strong>Evento:</strong> ${eventTitle}
                </div>
                <div class="detail-item">
                  <span>📍</span>
                  <strong>Ubicación:</strong> ${eventLocation}
                </div>
                <div class="detail-item">
                  <span>📆</span>
                  <strong>Fecha:</strong> ${eventDate}
                </div>
              </div>

              <p><strong>💰 Sobre tu reembolso:</strong></p>
              <p>El monto pagado por tus entradas será reembolsado automáticamente en un plazo de 5-7 días hábiles al método de pago utilizado en la compra.</p>

              <p><strong>📞 ¿Necesitas ayuda?</strong></p>
              <p>Si tienes alguna pregunta o inquietud, no dudes en contactarnos:</p>
              <ul>
                <li>📧 Email: soporte@nexivent.com</li>
                <li>📱 WhatsApp: +51 999 999 999</li>
              </ul>

              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://nexivent.com'}" class="button">
                  Explorar Más Eventos
                </a>
              </div>

              <p>Lamentamos los inconvenientes que esto pueda causar.</p>
              <p>Gracias por tu comprensión,<br><strong>Equipo Nexivent</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Nexivent. Todos los derechos reservados.</p>
              <p>Este es un correo automático, por favor no responder.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return sendEmail({
        to: attendee.email,
        subject: `🔴 Evento Cancelado: ${eventTitle}`,
        html: htmlContent,
      });
    });

    // Esperar a que todos los correos se envíen
    await Promise.all(emailPromises);

    console.log(`✅ [API] Notificaciones enviadas exitosamente a ${attendees.length} asistente(s)`);

    return NextResponse.json({
      message: `Notificaciones enviadas a ${attendees.length} asistente(s)`,
      success: true,
    });
  } catch (error) {
    console.error('❌ [API] Error al enviar notificaciones:', error);
    return NextResponse.json(
      {
        message: 'Error al enviar notificaciones',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
