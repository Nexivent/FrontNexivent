'use client';

import { useState } from 'react';
import EmailPasswordSignIn from './EmailPasswordSignIn';
import RucSignIn from './RucSignIn';

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
      <div className='form-content'>
        {activeTab === 'email' ? <EmailPasswordSignIn /> : <RucSignIn />}
      </div>
    </div>
  );
};

export default Form;
