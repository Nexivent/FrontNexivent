'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Heading from '@components/Heading/Heading';

type Evento = {
  id_evento: number;
  titulo: string;
  lugar: string;
  imagen_portada?: string;
  estado?: string;
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
  ticket_id: number;
  precio_entrada: number; // ✅ Campo correcto del backend
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
  eventoCard: {
    marginBottom: 12,
    borderRadius: 8,
    background: '#1a1a1a',
    border: '1px solid #262626',
    padding: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    transition: 'all 0.2s ease',
  },
  eventoCardSelected: {
    background: '#1f1f1f',
    border: '1px solid #cddc39',
  },
  eventoInfo: {
    flex: 1,
    minWidth: 0,
  },
  eventoTitulo: {
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  eventoLugar: {
    fontSize: 12,
    color: '#888',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  selectButton: {
    padding: '8px 16px',
    borderRadius: 6,
    background: '#262626',
    border: '1px solid #333',
    color: '#fff',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap' as const,
  },
  selectButtonSelected: {
    background: 'linear-gradient(135deg, #cddc39 0%, #afb42b 100%)',
    border: '1px solid #cddc39',
    color: '#000',
  },
  transactionsPanel: {
    background: '#0b0b0b',
    borderRadius: 12,
    padding: 24,
    border: '1px solid #262626',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 20,
    marginBottom: 24,
  },
  statCard: {
    padding: '16px 20px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
    color: '#fff',
    border: '1px solid #262626',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    minHeight: '110px',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 700,
    color: '#cddc39',
    marginTop: 6,
    marginBottom: 4,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: '#888',
    fontWeight: 600,
    marginBottom: 4,
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
  hint: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 1,
  },
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

const getMetodoPagoText = (metodoPagoId: number): string => {
  switch (metodoPagoId) {
    case 0:
      return 'PENDIENTE';
    case 1:
      return 'TARJETA';
    case 2:
      return 'YAPE';
    default:
      return 'DESCONOCIDO';
  }
};

const getMetodoPagoColor = (metodoPagoId: number): string => {
  switch (metodoPagoId) {
    case 0:
      return '#ff9800'; // naranja
    case 1:
      return '#2196f3'; // azul
    case 2:
      return '#9c27b0'; // morado
    default:
      return '#666';
  }
};

const TransactionsAdmin: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedEventoId, setSelectedEventoId] = useState<number | null>(null);
  const [ordenes, setOrdenes] = useState<OrdenDeCompra[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098';
        const response = await fetch(`${API_URL}/evento/`);
        if (response.ok) {
          const data = await response.json();
          console.log('Data completa:', data);

          const eventosNormalizados = (data.eventos || []).map((e: any) => ({
            id_evento: e.ID || e.id_evento,
            titulo: e.Titulo || e.titulo,
            lugar: e.Lugar || e.lugar,
            imagen_portada: e.imagen_portada,
            estado: e.estado,
          }));

          console.log('Eventos normalizados:', eventosNormalizados);
          setEventos(eventosNormalizados);
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
          console.log('Transacciones raw:', data);

          // Normalizar las órdenes de compra
          const ordenesNormalizadas = (data || []).map((o: any) => ({
            orden_de_compra_id: o.orden_de_compra_id,
            usuario_id: o.usuario_id,
            fecha: o.fecha,
            total: o.total || 0,
            metodo_de_pago_id: o.metodo_de_pago_id,
            estado_de_orden: o.estado_de_orden || 0,
            monto_fee_servicio: o.monto_fee_servicio || 0,
            fecha_hora_ini: o.fecha_hora_ini,
            fecha_hora_fin: o.fecha_hora_fin,
            ticket_id: o.ticket_id,
            precio_entrada: o.precio_entrada || 0, // ✅ Usar el campo correcto
          }));

          console.log('Órdenes normalizadas:', ordenesNormalizadas);
          setOrdenes(ordenesNormalizadas);
        }
      } catch (error) {
        console.error('Error fetching transacciones:', error);
      } finally {
        setLoadingOrdenes(false);
      }
    };

    fetchTransacciones();
  }, [selectedEventoId]);

  const filteredEventos = useMemo(() => {
    if (!searchQuery) return eventos;
    return eventos.filter(
      (e) =>
        e.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.lugar?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [eventos, searchQuery]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    // Obtener órdenes únicas
    const ordenesUnicas = new Map<number, OrdenDeCompra>();

    ordenes.forEach((orden) => {
      if (!ordenesUnicas.has(orden.orden_de_compra_id)) {
        ordenesUnicas.set(orden.orden_de_compra_id, orden);
      }
    });

    const totalTickets = ordenes.length;
    const totalMonto = ordenes.reduce(
      (sum, o) => sum + (o.precio_entrada - o.precio_entrada * 0.0225),
      0
    );

    const totalFees = ordenes.reduce((sum, o) => sum + o.precio_entrada * 0.0225, 0);

    // ✅ Contar solo órdenes únicas confirmadas (estado_de_orden === 1)
    const ordenesConfirmadas = Array.from(ordenesUnicas.values()).filter(
      (o) => o.estado_de_orden === 1
    ).length;

    return {
      totalTickets,
      totalMonto,
      totalFees,
      ordenesConfirmadas,
    };
  }, [ordenes]);

  const selectedEvento = eventos.find((e) => e.id_evento === selectedEventoId);

  const handleSelectEvento = (eventoId: number) => {
    console.log('Seleccionando evento:', eventoId);
    setSelectedEventoId(eventoId);
  };

  return (
    <div style={styles.container}>
      <Heading type={2} color='white' text='Transacciones por Evento' />
      <p style={{ color: '#888', marginBottom: 24, fontSize: 16 }}>
        Selecciona un evento para ver sus transacciones
      </p>

      <div style={styles.mainGrid}>
        <div style={styles.eventosPanel}>
          <h3 style={{ marginBottom: 16, fontSize: 18, color: '#fff' }}>
            Eventos ({eventos.length})
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
            filteredEventos.map((evento, index) => {
              const isSelected = selectedEventoId === evento.id_evento;
              const eventoId = evento.id_evento || index;

              return (
                <div
                  key={`evento-${eventoId}`}
                  style={{
                    ...styles.eventoCard,
                    ...(isSelected ? styles.eventoCardSelected : {}),
                  }}
                >
                  <div style={styles.eventoInfo}>
                    <div style={styles.eventoTitulo}>{evento.titulo || 'Sin título'}</div>
                    <div style={styles.eventoLugar}>📍 {evento.lugar || 'Sin ubicación'}</div>
                  </div>
                  <button
                    type='button'
                    style={{
                      ...styles.selectButton,
                      ...(isSelected ? styles.selectButtonSelected : {}),
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (evento.id_evento) {
                        handleSelectEvento(evento.id_evento);
                      }
                    }}
                    disabled={!evento.id_evento}
                  >
                    {isSelected ? '✓' : 'Ver'}
                  </button>
                </div>
              );
            })
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
              <h3 style={{ fontSize: 22, color: '#fff', marginBottom: 24 }}>
                {selectedEvento?.titulo || 'Evento seleccionado'}
              </h3>

              <div style={styles.statsRow}>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>TOTAL TICKETS</div>
                  <div style={styles.statValue}>{stats.totalTickets}</div>
                  <div style={styles.hint}>Vendidos</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>ORDENES CONFIRMADAS</div>
                  <div style={styles.statValue}>{stats.ordenesConfirmadas}</div>
                  <div style={styles.hint}>Pagadas</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>MONTO RECAUDADO</div>
                  <div style={styles.statValue}>S/ {stats.totalMonto.toFixed(2)}</div>
                  <div style={styles.hint}>Total Entradas - Fee Serv.</div>
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
                      <th style={styles.th}>Precio (S/)</th>
                      <th style={styles.th}>Fee Servicio (2.25%)</th>
                      <th style={styles.th}>Estado</th>
                      <th style={styles.th}>Método Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenes.map((orden, index) => {
                      const uniqueKey = orden.ticket_id
                        ? `ticket-${orden.ticket_id}`
                        : `orden-${orden.orden_de_compra_id}-${index}`;

                      // ✅ Calcular fee individual: 2.25% del precio de entrada
                      const feeIndividual = orden.precio_entrada * 0.0225;

                      return (
                        <tr key={uniqueKey}>
                          <td style={styles.td}>#{orden.orden_de_compra_id}</td>
                          <td style={styles.td}>{orden.usuario_id}</td>
                          <td style={styles.td}>
                            {orden.fecha
                              ? new Date(orden.fecha).toLocaleDateString('es-PE', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Sin fecha'}
                          </td>
                          <td style={styles.td}>S/ {orden.precio_entrada.toFixed(2)}</td>
                          <td style={styles.td}>S/ {feeIndividual.toFixed(2)}</td>
                          <td
                            style={{
                              ...styles.td,
                              color: getEstadoColor(orden.estado_de_orden),
                              fontWeight: 600,
                            }}
                          >
                            {getEstadoOrdenText(orden.estado_de_orden)}
                          </td>
                          <td
                            style={{
                              ...styles.td,
                              color: getMetodoPagoColor(orden.metodo_de_pago_id),
                              fontWeight: 600,
                            }}
                          >
                            {getMetodoPagoText(orden.metodo_de_pago_id)}
                          </td>
                        </tr>
                      );
                    })}
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
