'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Heading from '@components/Heading/Heading';

type Evento = {
  id_evento: number;
  titulo: string;
  lugar: string;
  imagen_portada: string;
  estado: string;
};

type OrdenDeCompra = {
  orden_de_compra_id: number;
  usuario_id: number;
  fecha: string;
  total: number;
  metodo_de_pago_id: number;
  estado_de_orden: number;
  monto_fee_servicio: number;
  fecha_hora_ini: string;
  fecha_hora_fin?: string;
};

const styles = {
  container: { maxWidth: '1400px', margin: '0 auto', padding: '20px' },
  mainGrid: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 },
  eventosPanel: {
    background: '#0b0b0b',
    borderRadius: 12,
    padding: 20,
    border: '1px solid #262626',
    maxHeight: '80vh',
    overflowY: 'auto' as const,
  },
  eventoItem: {
    padding: '16px',
    marginBottom: 12,
    borderRadius: 8,
    background: '#1a1a1a',
    border: '1px solid #262626',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
    textAlign: 'left' as const,
    fontFamily: 'inherit',
  },
  eventoItemSelected: {
    background: 'linear-gradient(135deg, #cddc39 0%, #afb42b 100%)',
    border: '1px solid #cddc39',
    color: '#000',
  },
  eventoTitulo: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  eventoLugar: { fontSize: 14, color: '#888' },
  transactionsPanel: {
    background: '#0b0b0b',
    borderRadius: 12,
    padding: 24,
    border: '1px solid #262626',
  },
  statsRow: { display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' as const },
  statCard: {
    padding: '20px 28px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
    color: '#fff',
    minWidth: 200,
    border: '1px solid #262626',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  statValue: { fontSize: 46, fontWeight: 700, color: '#cddc39', marginTop: 8 },
  statLabel: {
    fontSize: 13,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    color: '#888',
    fontWeight: 600,
  },
  table: { width: '100%', borderCollapse: 'collapse' as const, color: '#ddd' },
  th: {
    textAlign: 'left' as const,
    padding: '12px',
    borderBottom: '1px solid #222',
    fontSize: 14,
    fontWeight: 600,
  },
  td: { padding: '12px', borderBottom: '1px solid #161616', fontSize: 14 },
  hint: { color: '#666', marginTop: 6, fontSize: 14 },
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: '#666',
  },
  searchBox: {
    marginBottom: 16,
    padding: '10px 12px',
    borderRadius: 8,
    background: '#0d0d0d',
    border: '1px solid #262626',
    color: '#fff',
    width: '100%',
    fontSize: 14,
  },
  eventosList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 0,
  },
};

const getEstadoOrdenText = (estado: number): string => {
  switch (estado) {
    case 0:
      return 'TEMPORAL';
    case 1:
      return 'CONFIRMADO';
    default:
      return 'TEMPORAL';
  }
};

const getEstadoColor = (estado: number): string => {
  switch (estado) {
    case 1:
      return '#4caf50';
    default:
      return '#ff9800';
  }
};

const TransactionsAdmin: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedEventoId, setSelectedEventoId] = useState<number | null>(null);
  const [ordenes, setOrdenes] = useState<OrdenDeCompra[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar eventos disponibles
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098';
        const response = await fetch(`${API_URL}/evento/`);
        if (response.ok) {
          const data = await response.json();
          console.log('Eventos:', data.eventos);
          setEventos(data.eventos || []);
        } else {
          console.error('Error en respuesta:', response.status);
        }
      } catch (error) {
        console.error('Error fetching eventos:', error);
      } finally {
        setLoadingEventos(false);
      }
    };

    fetchEventos();
  }, []);

  // Cargar transacciones del evento seleccionado
  useEffect(() => {
    if (!selectedEventoId) {
      setOrdenes([]);
      return;
    }

    const fetchTransacciones = async () => {
      setLoadingOrdenes(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098';
        const response = await fetch(`${API_URL}/api/admin/transactions/${selectedEventoId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Transacciones:', data);
          setOrdenes(data || []);
        }
      } catch (error) {
        console.error('Error fetching transacciones:', error);
      } finally {
        setLoadingOrdenes(false);
      }
    };

    fetchTransacciones();
  }, [selectedEventoId]);

  // Filtrar eventos por búsqueda
  const filteredEventos = useMemo(() => {
    if (!searchQuery) return eventos;
    return eventos.filter(
      (e) =>
        e.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.lugar.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [eventos, searchQuery]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalOrdenes = ordenes.length;
    const totalMonto = ordenes.reduce((sum, o) => sum + o.total, 0);
    const totalFees = ordenes.reduce((sum, o) => sum + o.monto_fee_servicio, 0);
    const ordenesConfirmadas = ordenes.filter((o) => o.estado_de_orden === 1).length;

    return { totalOrdenes, totalMonto, totalFees, ordenesConfirmadas };
  }, [ordenes]);

  const selectedEvento = eventos.find((e) => e.id_evento === selectedEventoId);

  return (
    <div style={styles.container}>
      <Heading type={2} color='white' text='Transacciones por Evento' />
      <p style={{ color: '#888', marginBottom: 24, fontSize: 16 }}>
        Selecciona un evento para ver sus transacciones
      </p>

      <div style={styles.mainGrid}>
        <div style={styles.eventosPanel}>
          <h3 style={{ marginBottom: 16, fontSize: 18, color: '#fff' }}>
            Eventos Disponibles ({eventos.length})
          </h3>
          <input
            type='text'
            placeholder='Buscar evento...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchBox}
          />

          {loadingEventos ? (
            <p style={{ color: '#888', textAlign: 'center' }}>Cargando eventos...</p>
          ) : filteredEventos.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center' }}>No hay eventos disponibles</p>
          ) : (
            <>
              {filteredEventos.map((evento) => {
                const isSelected = selectedEventoId === evento.id_evento;
                return (
                  <button
                    key={evento.id_evento}
                    type='button'
                    style={{
                      ...styles.eventoItem,
                      ...(isSelected ? styles.eventoItemSelected : {}),
                    }}
                    onClick={() => setSelectedEventoId(evento.id_evento)}
                  >
                    <div
                      style={{
                        ...styles.eventoTitulo,
                        color: isSelected ? '#000' : '#fff',
                      }}
                    >
                      {evento.titulo}
                    </div>
                    <div
                      style={{
                        ...styles.eventoLugar,
                        color: isSelected ? '#333' : '#888',
                      }}
                    >
                      📍 {evento.lugar}
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        <div style={styles.transactionsPanel}>
          {!selectedEventoId ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 18, marginBottom: 8 }}>👈 Selecciona un evento</p>
              <p style={{ fontSize: 14 }}>Elige un evento de la lista para ver sus transacciones</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 22, color: '#fff', marginBottom: 8 }}>
                  {selectedEvento?.titulo}
                </h3>
                <p style={{ color: '#888', fontSize: 14 }}>📍 {selectedEvento?.lugar}</p>
              </div>

              <div style={styles.statsRow}>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>TOTAL ÓRDENES</div>
                  <div style={styles.statValue}>{stats.totalOrdenes}</div>
                  <div style={styles.hint}>Registradas</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>CONFIRMADAS</div>
                  <div style={styles.statValue}>{stats.ordenesConfirmadas}</div>
                  <div style={styles.hint}>Pagadas</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>MONTO TOTAL</div>
                  <div style={styles.statValue}>S/ {stats.totalMonto.toFixed(2)}</div>
                  <div style={styles.hint}>Ingresos</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>FEES SERVICIO</div>
                  <div style={styles.statValue}>S/ {stats.totalFees.toFixed(2)}</div>
                  <div style={styles.hint}>Comisiones</div>
                </div>
              </div>

              {loadingOrdenes ? (
                <p style={{ color: '#888', textAlign: 'center', padding: 40 }}>
                  Cargando transacciones...
                </p>
              ) : ordenes.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', padding: 40 }}>
                  No hay transacciones para este evento
                </p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID Orden</th>
                      <th style={styles.th}>Usuario ID</th>
                      <th style={styles.th}>Fecha</th>
                      <th style={styles.th}>Total (S/)</th>
                      <th style={styles.th}>Fee Servicio</th>
                      <th style={styles.th}>Estado</th>
                      <th style={styles.th}>Método Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenes.map((orden) => (
                      <tr key={orden.orden_de_compra_id}>
                        <td style={styles.td}>#{orden.orden_de_compra_id}</td>
                        <td style={styles.td}>{orden.usuario_id}</td>
                        <td style={styles.td}>
                          {new Date(orden.fecha).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td style={styles.td}>S/ {orden.total.toFixed(2)}</td>
                        <td style={styles.td}>S/ {orden.monto_fee_servicio.toFixed(2)}</td>
                        <td
                          style={{
                            ...styles.td,
                            color: getEstadoColor(orden.estado_de_orden),
                            fontWeight: 600,
                          }}
                        >
                          {getEstadoOrdenText(orden.estado_de_orden)}
                        </td>
                        <td style={styles.td}>ID: {orden.metodo_de_pago_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsAdmin;
