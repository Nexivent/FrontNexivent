import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@utils/emailSender';

export async function POST(request: NextRequest) {
  try {
    const { email, code, nombre } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ message: 'Email y código son requeridos' }, { status: 400 });
    }

    console.log(`📧 Enviando código de verificación a ${email}: ${code}`);

    // Enviar email
    await sendEmail({
      to: email,
      subject: 'Código de verificación - Cambio de contraseña | Nexivent',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 50px auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #FFD700; }
            .code-box { background-color: #f8f9fa; border: 2px dashed #FFD700; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
            .code { font-size: 36px; font-weight: bold; color: #333; letter-spacing: 8px; }
            .warning { color: #dc3545; font-weight: bold; margin-top: 20px; text-align: center; }
            .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎟️ Nexivent</div>
              <h2 style="color: #333; margin-top: 10px;">Verificación de Cambio de Contraseña</h2>
            </div>
            
            <p style="color: #555; font-size: 16px;">Hola${nombre ? ` ${nombre}` : ''},</p>
            <p style="color: #555; font-size: 16px;">Hemos recibido una solicitud para cambiar tu contraseña.</p>
            
            <div class="code-box">
              <p style="margin: 0; color: #666; font-size: 14px;">Tu código de verificación es:</p>
              <div class="code">${code}</div>
            </div>
            
            <p class="warning">⚠️ Este código expirará en 1 minuto</p>
            
            <p style="color: #555; font-size: 14px; margin-top: 20px;">
              Si no solicitaste este cambio, por favor ignora este correo y tu contraseña permanecerá sin cambios.
            </p>
            
            <div class="footer">
              <p>© 2025 Nexivent. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`✅ Código enviado exitosamente a ${email}`);

    return NextResponse.json({
      message: 'Código enviado correctamente',
      success: true,
    });
  } catch (error: any) {
    console.error('❌ Error al enviar código:', error);
    return NextResponse.json(
      { message: error.message || 'Error al enviar el código de verificación' },
      { status: 500 }
    );
  }
}
