'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { useUser } from '@contexts/UserContext';
import { set } from 'zod';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleSignInProps {
  mode?: 'signin' | 'signup';
  onGoogleAuth?: (userData: any) => void;
}

const GoogleIcon = () => (
  <svg
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
    width='18px'
    height='18px'
    viewBox='0 0 48 48'
  >
    <g>
      <path
        fill='#EA4335'
        d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'
      ></path>
      <path
        fill='#4285F4'
        d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'
      ></path>
      <path
        fill='#FBBC05'
        d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'
      ></path>
      <path
        fill='#34A853'
        d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'
      ></path>
      <path fill='none' d='M0 0h48v48H0z'></path>
    </g>
  </svg>
);

const GoogleSignIn: React.FC<GoogleSignInProps> = ({ mode = 'signin', onGoogleAuth }) => {
  const router = useRouter();
  const { setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validar que existe el client_id
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID no está configurado');
      setError('Configuración de Google Sign-In no disponible');
      return;
    }

    // Verificar si el script ya existe
    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existingScript) {
      // Script ya cargado, solo inicializar
      if (window.google) {
        initializeGoogleSignIn(clientId);
      } else {
        // Esperar a que el script se cargue
        const checkGoogle = setInterval(() => {
          if (window.google) {
            clearInterval(checkGoogle);
            initializeGoogleSignIn(clientId);
          }
        }, 100);

        // Timeout de 5 segundos
        setTimeout(() => {
          clearInterval(checkGoogle);
          if (!window.google) {
            setError('Error al cargar Google Sign-In. Por favor recarga la página.');
          }
        }, 5000);
      }
      return;
    }

    // Cargar script de Google
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      console.log('Google script cargado');
      // Esperar un poco para que Google se inicialice completamente
      setTimeout(() => {
        initializeGoogleSignIn(clientId);
      }, 100);
    };
    script.onerror = () => {
      console.error('Error al cargar el script de Google');
      setError('Error al cargar Google Sign-In');
    };

    return () => {
      // Cleanup
    };
  }, [mode]);

  const initializeGoogleSignIn = (clientId: string) => {
    if (!window.google) {
      console.error('Google SDK no está disponible');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: mode === 'signup' ? 'signup' : 'signin',
      });
      console.log('Google Sign-In inicializado correctamente');
    } catch (err) {
      console.error('Error al inicializar Google Sign-In:', err);
      setError('Error al inicializar Google Sign-In');
    }
  };

  const handleCredentialResponse = async (response: any) => {
    console.log('📨 Respuesta de Google recibida', response);
    setIsLoading(true);
    setError(null);

    // Si hay callback (modo signup con documento validado), pasarle el response
    if (onGoogleAuth) {
      onGoogleAuth(response);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/google-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: response.credential,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Modo signin: guardar y redirigir
        localStorage.setItem('authToken', data.token.token);
        localStorage.setItem('tokenExpiry', data.token.expiry.toString());
        localStorage.setItem('user', JSON.stringify(data.usuario));
        // Redirigir según si es nuevo usuario o existente
        if (data.is_new_user) {
          // Opcional: redirigir a completar perfil
          router.push('/');
        } else {
          router.push('/members/signin');
        }
      } else {
        const errorMessage = data.message || 'Error al autenticar con Google';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setError('Error de conexión con el servidor. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleButtonClick = () => {
    if (window.google) {
      window.google.accounts.id.prompt(); // Mostrar el popup de Google
    }
  };

  //////////////////////////////////////////////////////////////////////////

  const handleGoogleSuccess = async (tokenResponse: any) => {
    console.log('✅ Token de Google recibido:', tokenResponse);
    setIsLoading(true);
    setError(null);

    try {
      // Obtener información del usuario usando el access_token
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Error al obtener información del usuario de Google');
      }

      const userInfo = await userInfoResponse.json();
      console.log('👤 Info del usuario:', userInfo);

      // Si hay callback (modo signup con documento validado)
      if (onGoogleAuth) {
        console.log('🔄 Modo signup - pasando a callback');
        onGoogleAuth({
          credential: tokenResponse.access_token,
          userInfo: userInfo,
        });
        setIsLoading(false);
        return;
      }

      // Modo signin: autenticar con tu backend
      console.log('🔑 Modo signin - autenticando con backend...');
      const backendPayload = {
        // Enviar datos del usuario directamente (ya validados por Google)
        access_token: tokenResponse.access_token,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        email_verified: userInfo.email_verified,
        sub: userInfo.sub,
      };

      console.log('📤 Enviando al backend:', backendPayload);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/google-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendPayload),
      });

      const data = await res.json();
      console.log('📥 Respuesta del backend:', data);

      if (res.ok) {
        console.log('✅ Autenticación exitosa');
        localStorage.setItem('authToken', data.token.token);
        localStorage.setItem('tokenExpiry', data.token.expiry.toString());
        localStorage.setItem('user', JSON.stringify(data.usuario));

        if (setUser) {
          setUser(data.usuario);
        }

        // Mostrar mensaje de éxito
        if (data.is_new_user) {
          console.log('📧 Enviando correo de bienvenida...');

          try {
            const emailResponse = await fetch('/api/welcome', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: data.usuario.correo,
                nombre: data.usuario.nombre,
              }),
            });

            if (!emailResponse.ok) {
              console.warn('⚠️ No se pudo enviar el correo de bienvenida');
            } else {
              console.log('✅ Correo de bienvenida enviado exitosamente');
            }
          } catch (emailError) {
            console.error('❌ Error al enviar correo de bienvenida:', emailError);
            // No bloquear el login si falla el correo
          }
          // Usuario nuevo registrado con Google
          if (
            data.usuario.tipo_documento === 'RUC_PERSONA' ||
            data.usuario.tipo_documento === 'RUC_EMPRESA'
          ) {
            alert(
              '¡Cuenta creada exitosamente! Tu cuenta está pendiente de aprobación por un administrador.'
            );
          } else {
            alert('¡Bienvenido a Nexivent! Tu cuenta ha sido creada exitosamente.');
          }
        } else {
          // Usuario existente que inició sesión
          alert('¡Bienvenido de nuevo!');
        }
        router.push('/');
        router.refresh();
      } else {
        console.error('❌ Error en autenticación:', data);
        setError(data.message || 'Error al autenticar con Google');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setError('Error de conexión con el servidor');
      if (setUser) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('❌ Error en Google Sign-In');
    setError('Error al iniciar sesión con Google. Por favor, intenta de nuevo.');
    setIsLoading(false);
    if (setUser) {
      setUser(null);
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: 'implicit',
  });

  return (
    <div className='google-signin-container' style={{ width: '100%' }}>
      {error && (
        <div
          className='error-message'
          style={{
            color: '#d32f2f',
            backgroundColor: '#ffebee',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      <button
        type='button'
        className='google-signin-button'
        onClick={() => login()}
        disabled={isLoading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '12px 24px',
          backgroundColor: 'white',
          border: '1px solid #dadce0',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#3c4043',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s, box-shadow 0.2s',
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(60,64,67,0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.3)';
          }
        }}
      >
        {isLoading ? (
          <>
            <div
              style={{
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #3498db',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                animation: 'spin 1s linear infinite',
              }}
            ></div>
            <span>Cargando...</span>
          </>
        ) : (
          <>
            <GoogleIcon />
            <span>
              {mode === 'signup' ? 'Registrarse con Google' : 'Iniciar sesión con Google'}
            </span>
          </>
        )}
      </button>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .google-signin-button:active {
          background-color: #f1f3f4 !important;
        }
      `}</style>
    </div>
  );
};

export default GoogleSignIn;
