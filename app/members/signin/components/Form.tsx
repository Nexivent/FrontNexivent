'use client';

import { useState } from 'react';
import EmailPasswordSignIn from './EmailPasswordSignIn';
import RucSignIn from './RucSignIn';
import GoogleSignIn from './GoogleSignIn';

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

      <div className='form-content'>
        {activeTab === 'email' ? <EmailPasswordSignIn /> : <RucSignIn />}
      </div>
    </div>
  );
};

export default Form;
