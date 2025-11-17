import Link from 'next/link';
import Master from '@components/Layout/Master';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Master>
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        paddingTop: '80px'
      }}>
        <aside style={{
          width: '250px',
          backgroundColor: '#1a1a1a',
          padding: '20px',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
          borderRight: '1px solid #333',
          top: '80px'
        }}>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{
              color: '#cddc39',
              fontSize: '24px',
              fontWeight: 700
            }}>Administración</h2>
          </div>
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <Link href='/administrator' style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              color: '#cddc39',
              backgroundColor: 'rgba(205, 220, 57, 0.1)',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 600
            }}>
              <span>👥</span> Usuarios y Roles
            </Link>
          </nav>
        </aside>
        
        <main style={{
          flex: 1,
          marginLeft: '250px',
          padding: '40px',
          backgroundColor: '#0a0a0a'
        }}>
          {children}
        </main>
      </div>
    </Master>
  );
}