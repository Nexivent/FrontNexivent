'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Heading from '@components/Heading/Heading';

type Transaction = {
  id: string;
  fecha: string;
  organizadorId: number;
  organizadorNombre: string;
  eventoId: number;
  eventoNombre: string;
  monto: number;
  metodo: string;
  estado: 'COMPLETADA' | 'REVERTIDA' | 'FALLIDA';
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'T-1001',
    fecha: '2025-10-01T10:12:00Z',
    organizadorId: 44,
    organizadorNombre: 'Vichama Producciones',
    eventoId: 1,
    eventoNombre: 'SKILLBEA - 4MAR',
    monto: 35.0,
    metodo: 'Tarjeta',
    estado: 'COMPLETADA',
  },
  {
    id: 'T-1002',
    fecha: '2025-10-02T12:00:00Z',
    organizadorId: 44,
    organizadorNombre: 'Vichama Producciones',
    eventoId: 2,
    eventoNombre: 'JAZE - QUIZAS',
    monto: 59.0,
    metodo: 'PagoLink',
    estado: 'COMPLETADA',
  },
  {
    id: 'T-1003',
    fecha: '2025-10-03T15:30:00Z',
    organizadorId: 99,
    organizadorNombre: 'Costa Events',
    eventoId: 4,
    eventoNombre: 'Decir Adiós - Amén',
    monto: 50.0,
    metodo: 'Tarjeta',
    estado: 'REVERTIDA',
  },
];

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
  filtersRow: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 },
  select: {
    padding: '10px 12px',
    borderRadius: 8,
    background: '#0b0b0b',
    color: '#fff',
    border: '1px solid #262626',
    fontSize: 18,
  },
  statsRow: { display: 'flex', gap: 20, marginBottom: 24, justifyContent: 'center' },
  statCard: {
    padding: '20px 28px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
    color: '#fff',
    minWidth: 200,
    border: '1px solid #262626',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  table: { width: '100%', borderCollapse: 'collapse' as const, color: '#ddd' },
  th: { textAlign: 'left' as const, padding: '12px', borderBottom: '1px solid #222' },
  td: { padding: '12px', borderBottom: '1px solid #161616' },
  hint: { color: '#666', marginTop: 6, fontSize: 16 },
  statValue: { fontSize: 46, fontWeight: 700, color: '#cddc39', marginTop: 8 },
  statLabel: {
    fontSize: 13,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    color: '#888',
    fontWeight: 600,
  },
};

const TransactionsAdmin: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [organizerFilter, setOrganizerFilter] = useState<number | 'all'>('all');
  const [eventFilter, setEventFilter] = useState<number | 'all'>('all');
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Reemplaza con fetch real a /api/admin/transactions cuando esté disponible
    const t = window.setTimeout(() => {
      setTransactions(MOCK_TRANSACTIONS);
      setLoading(false);
    }, 300);
    return () => window.clearTimeout(t);
  }, []);

  // derive organizers/events lists from data
  const organizers = useMemo(() => {
    const map = new Map<number, string>();
    transactions.forEach((t) => map.set(t.organizadorId, t.organizadorNombre));
    return Array.from(map, ([id, nombre]) => ({ id, nombre }));
  }, [transactions]);

  const events = useMemo(() => {
    const map = new Map<number, string>();
    transactions.forEach((t) => map.set(t.eventoId, t.eventoNombre));
    return Array.from(map, ([id, nombre]) => ({ id, nombre }));
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (organizerFilter !== 'all' && t.organizadorId !== organizerFilter) return false;
      if (eventFilter !== 'all' && t.eventoId !== eventFilter) return false;
      if (
        query &&
        !`${t.id} ${t.eventoNombre} ${t.organizadorNombre}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
        return false;
      return true;
    });
  }, [transactions, organizerFilter, eventFilter, query]);

  const stats = useMemo(() => {
    const totalTrans = filtered.length;
    const totalMonto = filtered.reduce((s, it) => s + it.monto, 0);
    return { totalTrans, totalMonto };
  }, [filtered]);

  return (
    <div style={styles.container}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
        }}
      >
        <Heading type={2} color='white' text='Transacciones' />
      </div>

      <div style={styles.filtersRow}>
        <label>
          <div style={{ fontSize: 18, color: '#aaa' }}>Organizador</div>
          <select
            style={styles.select}
            value={organizerFilter}
            onChange={(e) =>
              setOrganizerFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
          >
            <option value='all'>Todos</option>
            {organizers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          <div style={{ fontSize: 18, color: '#aaa' }}>Evento</div>
          <select
            style={styles.select}
            value={eventFilter}
            onChange={(e) =>
              setEventFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
          >
            <option value='all'>Todos</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.nombre}
              </option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: 'auto' }}>
          <div style={{ fontSize: 18, color: '#aaa' }}>Buscar</div>
          <input
            placeholder='id, evento o organizador'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className='input-text'
            style={{ minWidth: 260, fontSize: 18 }}
          />
        </label>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>TRANSACCIONES</div>
          <div style={styles.statValue}>{stats.totalTrans}</div>
          <div style={styles.hint}>Registradas</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>MONTO TOTAL</div>
          <div style={styles.statValue}>S/ {stats.totalMonto.toFixed(2)}</div>
          <div style={styles.hint}>Ingresos</div>
        </div>
      </div>

      {loading ? (
        <p className='gray'>Cargando transacciones...</p>
      ) : (
        <>
          <table style={styles.table as any}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Organizador</th>
                <th style={styles.th}>Evento</th>
                <th style={styles.th}>Monto (S/)</th>
                <th style={styles.th}>Método</th>
                <th style={styles.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 20, textAlign: 'center', color: '#999' }}>
                    No hay transacciones con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id}>
                    <td style={styles.td}>{t.id}</td>
                    <td style={styles.td}>{new Date(t.fecha).toLocaleString()}</td>
                    <td style={styles.td}>{t.organizadorNombre}</td>
                    <td style={styles.td}>{t.eventoNombre}</td>
                    <td style={styles.td}>S/ {t.monto.toFixed(2)}</td>
                    <td style={styles.td}>{t.metodo}</td>
                    <td style={styles.td}>{t.estado}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default TransactionsAdmin;
