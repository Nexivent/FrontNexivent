'use client';

import React from 'react';
import Link from 'next/link';
import Master from '@components/Layout/Master';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <Master>
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: '#0a0a0a',
          paddingTop: '80px',
        }}
      >
        <aside
          style={{
            width: '250px',
            backgroundColor: '#1a1a1a',
            padding: '20px',
            position: 'fixed',
            height: '100vh',
            overflowY: 'auto',
            borderRight: '1px solid #333',
            top: '80px',
          }}
        >
          <div style={{ marginBottom: '30px' }}>
            <h2
              style={{
                color: '#cddc39',
                fontSize: '24px',
                fontWeight: 700,
              }}
            >
              Administración
            </h2>
          </div>
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <Link
              href='/administrator'
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                color: pathname === '/administrator' ? '#cddc39' : '#fff',
                backgroundColor:
                  pathname === '/administrator' ? 'rgba(205, 220, 57, 0.15)' : 'transparent',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 600,
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                color: pathname === '/administrator' ? '#cddc39' : '#fff',
                backgroundColor:
                  pathname === '/administrator' ? 'rgba(205, 220, 57, 0.15)' : 'transparent',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                border:
                  pathname === '/administrator'
                    ? '1px solid rgba(205, 220, 57, 0.3)'
                    : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (pathname !== '/administrator') {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/administrator') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>👥</span> Usuarios y Roles
            </Link>
            <Link
              href='/administrator/transactions'
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                color: pathname === '/administrator/transactions' ? '#cddc39' : '#fff',
                backgroundColor:
                  pathname === '/administrator/transactions'
                    ? 'rgba(205, 220, 57, 0.15)'
                    : 'transparent',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 600,
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                color: pathname === '/administrator/transactions' ? '#cddc39' : '#fff',
                backgroundColor:
                  pathname === '/administrator/transactions'
                    ? 'rgba(205, 220, 57, 0.15)'
                    : 'transparent',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                border:
                  pathname === '/administrator/transactions'
                    ? '1px solid rgba(205, 220, 57, 0.3)'
                    : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (pathname !== '/administrator/transactions') {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/administrator/transactions') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>💳</span> Transacciones
            </Link>
          </nav>
        </aside>

        <main
          style={{
            flex: 1,
            marginLeft: '250px',
            padding: '40px',
            backgroundColor: '#0a0a0a',
          }}
        >
          {children}
        </main>
      </div>
    </Master>
  );
}
