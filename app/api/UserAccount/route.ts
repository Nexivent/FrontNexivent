import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@utils/emailSender';

export async function POST(request: NextRequest) {
  try {
    const { email, code, nombre } = await request.json();

    if (!email || !code || !nombre) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 50px auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #ffffff;
              text-align: center;
              padding: 30px 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .content h2 {
              color: #333333;
              margin-bottom: 20px;
            }
            .code-box {
              background-color: #f8f9fa;
              border: 2px dashed #667eea;
              border-radius: 8px;
              padding: 20px;
              margin: 30px 0;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .info {
              color: #666666;
              font-size: 14px;
              margin-top: 20px;
              line-height: 1.6;
            }
            .footer {
              background-color: #f8f9fa;
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #999999;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Nexivent</h1>
            </div>
            <div class="content">
              <h2>Hola, ${nombre}! 👋</h2>
              <p>Gracias por registrarte en Nexivent. Para completar tu registro, por favor verifica tu correo electrónico.</p>
              
              <div class="code-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Tu código de verificación es:</p>
                <div class="code">${code}</div>
              </div>

              <div class="warning">
                <strong>⏰ Importante:</strong> Este código expirará en <strong>15 minutos</strong>.
              </div>

              <div class="info">
                <p>Si no solicitaste este código, puedes ignorar este correo de forma segura.</p>
                <p>Por razones de seguridad, nunca compartas este código con nadie.</p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Nexivent. Todos los derechos reservados.</p>
              <p>Este es un correo automático, por favor no responder.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: email,
      subject: '🔐 Código de verificación - Nexivent',
      html: htmlContent,
    });

    return NextResponse.json({ message: 'Código enviado exitosamente' }, { status: 200 });
  } catch (error: any) {
    console.error('Error al enviar email:', error);
    // Mensaje más específico si es un error de configuración
    if (error.message?.includes('credenciales')) {
      return NextResponse.json({ error: 'Configuración de email no disponible' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Error al enviar el correo electrónico' }, { status: 500 });
  }
}
