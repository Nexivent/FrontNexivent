import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@utils/emailSender';

export async function POST(request: NextRequest) {
  try {
    const { email, nombre } = await request.json();

    if (!email || !nombre) {
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
              padding: 40px 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
            }
            .emoji {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              color: #333333;
              margin-bottom: 20px;
              font-size: 24px;
            }
            .welcome-message {
              color: #666666;
              font-size: 16px;
              line-height: 1.8;
              margin-bottom: 30px;
            }
            .features {
              background-color: #f8f9fa;
              border-radius: 8px;
              padding: 25px;
              margin: 30px 0;
            }
            .feature-item {
              display: flex;
              align-items: center;
              margin: 15px 0;
              color: #333333;
            }
            .feature-icon {
              font-size: 24px;
              margin-right: 15px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #ffffff;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 25px;
              font-weight: bold;
              margin: 20px 0;
              transition: transform 0.2s;
            }
            .cta-button:hover {
              transform: scale(1.05);
            }
            .footer {
              background-color: #f8f9fa;
              text-align: center;
              padding: 30px 20px;
              font-size: 12px;
              color: #999999;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-links a {
              display: inline-block;
              margin: 0 10px;
              color: #667eea;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">🎉</div>
              <h1>¡Bienvenido a Nexivent!</h1>
            </div>
            
            <div class="content">
              <h2>Hola, ${nombre}! 👋</h2>
              
              <div class="welcome-message">
                <p>¡Estamos emocionados de tenerte con nosotros!</p>
                <p>Tu cuenta ha sido creada exitosamente y ahora eres parte de la comunidad Nexivent, donde podrás descubrir y disfrutar de los mejores eventos.</p>
              </div>

              <div class="features">
                <h3 style="margin-top: 0; color: #333;">¿Qué puedes hacer en Nexivent?</h3>
                
                <div class="feature-item">
                  <span class="feature-icon">🎫</span>
                  <span>Compra entradas para eventos de forma rápida y segura</span>
                </div>
                
                <div class="feature-item">
                  <span class="feature-icon">🔍</span>
                  <span>Descubre eventos increíbles cerca de ti</span>
                </div>
                
                <div class="feature-item">
                  <span class="feature-icon">⭐</span>
                  <span>Guarda tus eventos favoritos y recibe notificaciones</span>
                </div>
              </div>

              <div class="welcome-message" style="margin-top: 30px;">
                <p><strong>¿Necesitas ayuda?</strong></p>
                <p>Nuestro equipo de soporte está disponible para ayudarte. No dudes en contactarnos si tienes alguna pregunta.</p>
              </div>
            </div>

            <div class="footer">
              <div class="social-links">
                <a href="#">Facebook</a> • 
                <a href="#">Instagram</a> • 
                <a href="#">Twitter</a>
              </div>
              <p>&copy; ${new Date().getFullYear()} Nexivent. Todos los derechos reservados.</p>
              <p>Este correo fue enviado a ${email}</p>
              <p style="margin-top: 10px; font-size: 11px;">
                Este es un correo automático, por favor no responder.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: email,
      subject: '🎉 ¡Bienvenido a Nexivent!',
      html: htmlContent,
    });

    return NextResponse.json(
      { message: 'Correo de bienvenida enviado exitosamente' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al enviar email de bienvenida:', error);

    if (error.message?.includes('credenciales')) {
      return NextResponse.json({ error: 'Configuración de email no disponible' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Error al enviar el correo de bienvenida' }, { status: 500 });
  }
}
