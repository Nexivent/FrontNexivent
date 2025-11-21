'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@components/Button/Button';

interface IProps {
  usuarioId: number;
  correo: string;
  nombre: string;
}

const VerificationStep: React.FC<IProps> = ({ usuarioId, correo, nombre }) => {
  const router = useRouter();
  const [codigo, setCodigo] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [codigoReal, setCodigoReal] = useState('');
  const [expiryTime, setExpiryTime] = useState(0);

  useEffect(() => {
    // Cargar código y tiempo de expiración desde sessionStorage
    const storedCode = sessionStorage.getItem('verification_code');
    const storedExpiry = sessionStorage.getItem('verification_expiry');

    if (storedCode && storedExpiry) {
      setCodigoReal(storedCode);
      setExpiryTime(parseInt(storedExpiry));
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCodigo = [...codigo];
    newCodigo[index] = value;
    setCodigo(newCodigo);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setCodigo(digits);
      const lastInput = document.getElementById('code-input-5');
      lastInput?.focus();
    }
  };

  const handleVerify = async () => {
    const codigoIngresado = codigo.join('');

    if (codigoIngresado.length !== 6) {
      setError('Por favor ingresa el código completo');
      return;
    }

    // Validar expiración
    if (Date.now() > expiryTime) {
      setError('El código ha expirado. Por favor solicita uno nuevo.');
      return;
    }

    // Validar código en el frontend
    if (codigoIngresado !== codigoReal) {
      setError('Código incorrecto. Por favor verifica e intenta nuevamente.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Llamar al backend solo para marcar como verificado y obtener token
      const response = await fetch('http://localhost:8098/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: usuarioId,
        }),
      });

      const result = await response.json();

      if (response.ok && result.token) {
        // Limpiar sessionStorage
        sessionStorage.removeItem('verification_user_id');
        sessionStorage.removeItem('verification_email');
        sessionStorage.removeItem('verification_code');
        sessionStorage.removeItem('verification_expiry');
        sessionStorage.removeItem('verification_nombre');

        // Guardar token y usuario
        localStorage.setItem('auth_token', result.token.token);
        localStorage.setItem('user', JSON.stringify(result.usuario));

        alert('¡Email verificado exitosamente!');
        router.push('/');
        router.refresh();
      } else {
        setError('Error al completar la verificación');
      }
    } catch (error) {
      console.error('Error al verificar:', error);
      setError('Error al completar la verificación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      // Generar nuevo código solicitándolo al backend
      const response = await fetch('http://localhost:8098/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resend: true,
          usuario_id: usuarioId,
        }),
      });

      const result = await response.json();

      if (response.ok && result.codigo_verificacion) {
        const emailResponse = await fetch('/api/UserAccount', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: correo,
            code: result.codigo_verificacion,
            nombre: nombre,
          }),
        });

        if (!emailResponse.ok) {
          throw new Error('Error al enviar el email');
        }

        setCodigoReal(result.codigo_verificacion);
        const newExpiry = Date.now() + 15 * 60 * 1000;
        setExpiryTime(newExpiry);

        sessionStorage.setItem('verification_code', result.codigo_verificacion);
        sessionStorage.setItem('verification_expiry', String(newExpiry));

        alert('✅ Código reenviado exitosamente. Revisa tu correo.');
        setCountdown(60);
        setCanResend(false);
        setCodigo(['', '', '', '', '', '']);
        setError('');
      } else {
        throw new Error('Error al generar nuevo código');
      }
    } catch (error) {
      console.error('Error al reenviar:', error);
      alert('Error al reenviar el código');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='verification-step-container'>
      <div className='verification-content'>
        <div className='verification-icon'>✉️</div>
        <h2>Verifica tu correo electrónico</h2>
        <p className='verification-description'>
          Hemos enviado un código de 6 dígitos a <strong>{correo}</strong>
        </p>

        <div className='code-inputs' onPaste={handlePaste} style={{ display: 'flex', gap: '8px' }}>
          {codigo.map((digit, index) => (
            <input
              key={index}
              id={`code-input-${index}`}
              type='text'
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className='code-input'
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && <p className='error-message'>{error}</p>}

        <Button
          type='button'
          color='yellow-filled'
          text={isSubmitting ? 'Verificando...' : 'Verificar'}
          onClick={handleVerify}
          disabled={isSubmitting || codigo.join('').length !== 6}
        />

        <div className='resend-section'>
          {!canResend ? (
            <p className='countdown-text'>Reenviar código en {countdown} segundos</p>
          ) : (
            <button
              type='button'
              className='resend-button'
              onClick={handleResend}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Reenviando...' : 'Reenviar código'}
            </button>
          )}
        </div>
        <p className='help-text'>
          ¿No recibiste el código? Revisa tu carpeta de spam o solicita uno nuevo.
        </p>
      </div>
    </div>
  );
};

export default VerificationStep;
