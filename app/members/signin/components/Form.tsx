'use client';

import { useState } from 'react';
import EmailPasswordSignIn from './EmailPasswordSignIn';
import RucSignIn from './RucSignIn';
import GoogleSignIn from './GoogleSignIn';

const DocumentTypeNotice: React.FC = () => {
  return (
    <div className='mb-6 mx-auto max-w-2xl'>
      <div className='p-4 bg-gradient-to-r from-yellow-400/10 to-yellow-500/10 border-l-4 border-yellow-400 rounded-lg backdrop-blur-sm'>
        <div className='flex items-start gap-3'>
          <div className='flex-shrink-0 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold'>
            ℹ
          </div>
          <div className='flex-1'>
            <h3 className='font-bold text-white mb-2 text-base'>Importante:</h3>
            <ul className='text-gray-300 space-y-1.5 text-xs'>
              <li className='flex items-start gap-2'>
                <span>
                  <strong className='text-yellow-400'>Solo para ADMINISTRADORES: </strong>Ingresa a
                  tu cuenta con las credenciales proporcionadas por el equipo de Nexivent para ti.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const Form: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'email' | 'ruc'>('email');

  return (
    <div className='signin-container'>
      <div className='tabs'>
        <button
          className={`tab-button ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          Cuenta Personal
        </button>
        <button
          className={`tab-button ${activeTab === 'ruc' ? 'active' : ''}`}
          onClick={() => setActiveTab('ruc')}
        >
          Cuenta Organizador
        </button>
      </div>
      {/* Botón de Google - Solo para cuentas personales */}
      {activeTab === 'email' && (
        <div
          className='google-auth-section'
          style={{
            margin: '24px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <GoogleSignIn mode='signin' />
          <div
            className='divider'
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              margin: '8px 0',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
            <span
              style={{
                padding: '0 16px',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              O continúa con tu correo
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
          </div>
        </div>
      )}
      {activeTab === 'email' ? <DocumentTypeNotice /> : null}
      <div className='form-content'>
        {activeTab === 'email' ? <EmailPasswordSignIn /> : <RucSignIn />}
      </div>
    </div>
  );
};

export default Form;
