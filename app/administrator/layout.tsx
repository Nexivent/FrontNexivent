'use client';

import React from 'react';
import Link from 'next/link';
import Master from '@components/Layout/Master';
import { usePathname, useRouter } from 'next/navigation';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
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
            {/* Botón para ir a Reportes */}
            <button
              onClick={() => router.push("/report")}
              className="group relative inline-flex items-center justify-center px-6 py-3 mt-4 
             font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-600 
             rounded-xl shadow-md transition-all duration-300 
             hover:shadow-xl hover:scale-[1.03] active:scale-[0.97]"
            >
              <span className="absolute inset-0 w-full h-full bg-white/10 opacity-0 
                   group-hover:opacity-100 rounded-xl transition-opacity"></span>
              Ir a Reportes
            </button>


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
