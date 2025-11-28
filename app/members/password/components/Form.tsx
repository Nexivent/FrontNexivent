'use client';

import { useRouter } from 'next/navigation';

// components
import Button from '@components/Button/Button';

const Form: React.FC = () => {
  const router = useRouter();

  return (
    <div className='form shrink' style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className='form-elements'>
        {/* Aviso principal */}
        <div
          style={{
            padding: '25px 30px',
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            border: '2px solid #FFD700',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>🔒</div>
          <h2
            style={{
              color: '#FFD700',
              marginBottom: '12px',
              fontSize: '22px',
              fontWeight: '600',
            }}
          >
            Cambio de Contraseña
          </h2>
          <p
            style={{
              color: '#e0e0e0',
              fontSize: '14px',
              lineHeight: '1.6',
              marginBottom: '8px',
            }}
          >
            Por seguridad, el cambio de contraseña debe ser gestionado por nuestro equipo de
            soporte.
          </p>
          <p
            style={{
              color: '#e0e0e0',
              fontSize: '14px',
              lineHeight: '1.6',
              marginBottom: '0',
            }}
          >
            Por favor, contáctate con nosotros para proceder con esta solicitud.
          </p>
        </div>

        {/* Información de contacto */}
        <div
          style={{
            padding: '20px 25px',
            backgroundColor: '#2a2a2a',
            borderRadius: '12px',
            border: '1px solid #3a3a3a',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '20px', marginRight: '10px' }}>📧</span>
            <h3
              style={{
                color: '#FFD700',
                fontSize: '18px',
                fontWeight: '600',
                margin: 0,
              }}
            >
              Información de Contacto
            </h3>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
              }}
            >
              <span style={{ fontSize: '18px', marginRight: '10px' }}>📩</span>
              <div style={{ fontSize: '14px' }}>
                <strong style={{ color: '#FFD700' }}>Email:</strong>{' '}
                <a
                  href='mailto:nexivent.team@gmail.com'
                  style={{
                    color: '#e0e0e0',
                    textDecoration: 'none',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#FFD700')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#e0e0e0')}
                >
                  nexivent.team@gmail.com
                </a>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
              }}
            >
              <span style={{ fontSize: '18px', marginRight: '10px' }}>💬</span>
              <div style={{ fontSize: '14px' }}>
                <strong style={{ color: '#FFD700' }}>WhatsApp:</strong>{' '}
                <a
                  href='https://wa.me/51944975049'
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{
                    color: '#e0e0e0',
                    textDecoration: 'none',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#FFD700')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#e0e0e0')}
                >
                  +51 944 975 049
                </a>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
              }}
            >
              <span style={{ fontSize: '18px', marginRight: '10px' }}>🕐</span>
              <div style={{ fontSize: '14px' }}>
                <strong style={{ color: '#FFD700' }}>Horario:</strong>{' '}
                <span style={{ color: '#e0e0e0' }}>Lunes a Viernes, 9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de acción */}
        <div className='form-buttons' style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button
            type='button'
            color='yellow-filled'
            text='Volver a Mi Cuenta'
            onClick={() => router.push('/members/account')}
          />
        </div>
      </div>
    </div>
  );
};

export default Form;
