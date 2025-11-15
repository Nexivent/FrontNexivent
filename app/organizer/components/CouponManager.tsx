'use client';

import { useEffect, useMemo, useState } from 'react';
import Button from '@components/Button/Button';

type CouponType = 'PORCENTAJE' | 'MONTO';

type CouponForm = {
  idCupon: number;
  idEvento: number;
  descripcion: string;
  tipo: CouponType;
  activo: 0 | 1;
  valor: number;
  codigo: string;
  uso_por_usuario: number;
  uso_realizados: number;
  fechaInicio: string;
  fechaFin: string;
};

type OrganizerEventSummary = {
  idEvento: number;
  titulo: string;
};

const createEmptyCoupon = (): CouponForm => {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  return {
    idCupon: Date.now(),
    idEvento: 0,
    descripcion: '',
    tipo: 'PORCENTAJE',
    activo: 1,
    valor: 10,
    codigo: '',
    uso_por_usuario: 1,
    uso_realizados: 0,
    fechaInicio: today.toISOString().slice(0, 10),
    fechaFin: nextMonth.toISOString().slice(0, 10),
  };
};

const COUPON_STORAGE_KEY = 'organizer-coupons';
const EVENT_DRAFT_STORAGE_KEY = 'organizer-event-drafts';

const baseCoupons: CouponForm[] = [
  {
    idCupon: 801,
    idEvento: 1024,
    descripcion: '20% para los primeros fanaticos del showcase.',
    tipo: 'PORCENTAJE',
    activo: 1,
    valor: 20,
    codigo: 'SHOWCASE20',
    uso_por_usuario: 2,
    uso_realizados: 45,
    fechaInicio: '2025-01-10',
    fechaFin: '2025-02-10',
  },
  {
    idCupon: 802,
    idEvento: 1024,
    descripcion: 'Monto fijo para clientes corporativos.',
    tipo: 'MONTO',
    activo: 1,
    valor: 50,
    codigo: 'CORP50',
    uso_por_usuario: 5,
    uso_realizados: 12,
    fechaInicio: '2025-02-01',
    fechaFin: '2025-03-30',
  },
  {
    idCupon: 803,
    idEvento: 2048,
    descripcion: 'Preventa exclusiva para comunidad digital.',
    tipo: 'PORCENTAJE',
    activo: 0,
    valor: 15,
    codigo: 'COMMUNITY15',
    uso_por_usuario: 1,
    uso_realizados: 0,
    fechaInicio: '2025-03-01',
    fechaFin: '2025-04-15',
  },
];

const baseEventSummaries: OrganizerEventSummary[] = [
  { idEvento: 1024, titulo: 'Showcase de bandas indie' },
  { idEvento: 2048, titulo: 'Festival gastronomico Lima Fusion' },
  { idEvento: 4096, titulo: 'Conferencia de tecnologia FutureStack' },
];

const readStoredCollection = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`No se pudo leer la clave ${key} desde localStorage.`, error);
    return fallback;
  }
};

const getStoredCoupons = () => readStoredCollection<CouponForm[]>(COUPON_STORAGE_KEY, baseCoupons);

const getStoredEventOptions = (): OrganizerEventSummary[] => {
  const fallback = baseEventSummaries;
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(EVENT_DRAFT_STORAGE_KEY);
    const stored = raw ? (JSON.parse(raw) as Array<{ idEvento?: number; titulo?: string }>) : [];
    const merged = new Map<number, string>();
    fallback.forEach((event) => merged.set(event.idEvento, event.titulo));
    stored.forEach((event) => {
      if (typeof event.idEvento === 'number' && event.idEvento > 0) {
        const title =
          typeof event.titulo === 'string' && event.titulo.trim().length > 0
            ? event.titulo
            : `Evento #${event.idEvento}`;
        merged.set(event.idEvento, title);
      }
    });
    return Array.from(merged.entries()).map(([idEvento, titulo]) => ({ idEvento, titulo }));
  } catch (error) {
    console.error('No se pudieron leer los eventos almacenados.', error);
    return fallback;
  }
};

const persistCoupons = (collection: CouponForm[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(collection));
  } catch (error) {
    console.error('No se pudieron guardar los cupones.', error);
  }
};

const normalizeCoupon = (coupon: CouponForm): CouponForm => {
  const identifier = coupon.codigo.trim().length > 0 ? coupon.codigo.trim().toUpperCase() : null;
  return {
    ...coupon,
    idCupon: coupon.idCupon ?? Date.now(),
    codigo: identifier ?? `CUPON-${Date.now()}`,
    valor: Math.max(0, coupon.valor),
    uso_por_usuario: Math.max(1, coupon.uso_por_usuario),
    activo: coupon.activo === 0 ? 0 : 1,
  };
};

const CouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponForm[]>(() => getStoredCoupons());
  const [events, setEvents] = useState<OrganizerEventSummary[]>(() => getStoredEventOptions());
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
  const [form, setForm] = useState<CouponForm>(() => createEmptyCoupon());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [eventFilter, setEventFilter] = useState<'all' | number>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const refreshEvents = () => setEvents(getStoredEventOptions());
    refreshEvents();
    window.addEventListener('focus', refreshEvents);
    return () => {
      window.removeEventListener('focus', refreshEvents);
    };
  }, []);

  const stats = useMemo(() => {
    const activeTotal = coupons.filter((coupon) => coupon.activo === 1).length;
    const totalUsage = coupons.reduce((sum, coupon) => sum + coupon.uso_realizados, 0);
    const upcomingExpirations = coupons.filter((coupon) => {
      const now = new Date().toISOString().slice(0, 10);
      const oneWeekAhead = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      return coupon.fechaFin >= now && coupon.fechaFin <= oneWeekAhead;
    }).length;
    return { activeTotal, totalUsage, upcomingExpirations };
  }, [coupons]);

  const eventOptions = useMemo(
    () => [...events].sort((a, b) => a.titulo.localeCompare(b.titulo)),
    [events]
  );

  useEffect(() => {
    if (eventOptions.length > 0 && selectedCouponId === null && form.idEvento === 0) {
      setForm((previous) => ({ ...previous, idEvento: eventOptions[0].idEvento }));
    }
  }, [eventOptions, form.idEvento, selectedCouponId]);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesEvent = eventFilter === 'all' ? true : coupon.idEvento === eventFilter;
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? coupon.activo === 1
            : coupon.activo === 0;
      return matchesEvent && matchesStatus;
    });
  }, [coupons, eventFilter, statusFilter]);

  const handleSelectCoupon = (coupon: CouponForm) => {
    setSelectedCouponId(coupon.idCupon);
    setForm(coupon);
    setFeedback(null);
    setShowForm(true);
  };

  const handleInputChange = (key: keyof CouponForm, value: string | number) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleNewCoupon = () => {
    setSelectedCouponId(null);
    setForm(createEmptyCoupon());
    setFeedback('Listo para crear un nuevo cupón.');
    setShowForm(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingState === 'saving') return;
    setSavingState('saving');
    setFeedback(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const savedCoupon = normalizeCoupon(form);
      setCoupons((previous) => {
        const filtered = previous.filter((coupon) => coupon.idCupon !== savedCoupon.idCupon);
        const updated = [savedCoupon, ...filtered];
        persistCoupons(updated);
        return updated;
      });
      setSelectedCouponId(savedCoupon.idCupon);
      setForm(savedCoupon);
      setSavingState('success');
      setFeedback('Cupon guardado correctamente.');
    } catch {
      setSavingState('error');
      setFeedback('No se pudo guardar el cupon. Intenta nuevamente.');
    } finally {
      setTimeout(() => {
        setSavingState((current) => (current === 'success' ? 'idle' : current));
      }, 2500);
    }
  };



  return (
    <div className='organizer-builder coupons'>
      <header className='organizer-header'>
        <div>
          <p className='eyebrow'>Gestión de cupones</p>
          <h2>Promociones por evento</h2>
          <p className='gray'>
            Filtra por evento, controla estados y crea nuevos códigos con una experiencia guiada.
          </p>
        </div>
        <div className='organizer-header__stats'>
          <div>
            <span>Cupones activos</span>
            <strong>{stats.activeTotal}</strong>
          </div>
          <div>
            <span>Usos registrados</span>
            <strong>{stats.totalUsage.toLocaleString()}</strong>
          </div>
          <div>
            <span>Expiran pronto</span>
            <strong>{stats.upcomingExpirations}</strong>
          </div>
        </div>
      </header>

      <div className='organizer-grid coupons-grid'>
        <section className='organizer-panel coupon-table-panel'>
          <div className='organizer-panel__header stack'>
            <div>
              <h3>Listado de cupones</h3>
              <p className='field-hint'>Selecciona un cupón para editarlo o crea uno nuevo.</p>
            </div>
            <Button
              type='button'
              color='gray-overlay'
              text='Nuevo cupón'
              leftIcon='add'
              onClick={handleNewCoupon}
            />
          </div>

          <div className='coupon-filters'>
            <label className='field'>
              <span className='field-label'>Evento</span>
              <select
                className='input-text'
                value={eventFilter === 'all' ? 'all' : eventFilter}
                onChange={(event) => {
                  const value = event.target.value;
                  setEventFilter(value === 'all' ? 'all' : Number(value));
                }}
                disabled={eventOptions.length === 0}
              >
                <option value='all'>Todos los eventos</option>
                {eventOptions.map((event) => (
                  <option key={event.idEvento} value={event.idEvento}>
                    {event.titulo}
                  </option>
                ))}
              </select>
            </label>
            <label className='field'>
              <span className='field-label'>Estado</span>
              <select
                className='input-text'
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              >
                <option value='all'>Todos</option>
                <option value='active'>Activos</option>
                <option value='inactive'>Inactivos</option>
              </select>
            </label>
          </div>

          {filteredCoupons.length === 0 ? (
            <p className='field-hint'>No hay cupones que coincidan con el filtro seleccionado.</p>
          ) : (
            <table className='coupon-table'>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Evento</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Estado</th>
                  <th>Uso por usuario</th>
                  <th>Usos realizados</th>
                  <th>Vigencia</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => {
                  const eventName =
                    eventOptions.find((event) => event.idEvento === coupon.idEvento)?.titulo ??
                    `Evento #${coupon.idEvento}`;
                  return (
                    <tr
                      key={coupon.idCupon}
                      className={coupon.idCupon === selectedCouponId ? 'selected' : ''}
                      onClick={() => handleSelectCoupon(coupon)}
                    >
                      <td>{coupon.codigo}</td>
                      <td>{eventName}</td>
                      <td>{coupon.tipo === 'PORCENTAJE' ? 'Porcentaje' : 'Monto fijo'}</td>
                      <td>
                        {coupon.tipo === 'PORCENTAJE'
                          ? `${coupon.valor}%`
                          : `S/ ${coupon.valor.toFixed(2)}`}
                      </td>
                      <td>
                        <span
                          className={`status-pill ${coupon.activo === 1 ? 'publicado' : 'cancelado'}`}
                        >
                          {coupon.activo === 1 ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>{coupon.uso_por_usuario}</td>
                      <td>{coupon.uso_realizados}</td>
                      <td>
                        {coupon.fechaInicio} → {coupon.fechaFin}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <section className='organizer-panel coupon-form-panel'>
          {showForm ? (
            <>
              <div className='organizer-panel__header'>
                <div>
                  <p className='eyebrow'>Formulario</p>
                  <h3>{selectedCouponId !== null ? 'Editar cupón' : 'Crear cupón'}</h3>
                </div>
                <span className='organizer-chip muted'>
                  <span className='material-symbols-outlined'>tag</span>#{form.idCupon}
                </span>
              </div>

              <form
                className='coupon-form'
                onSubmit={(event) => {
                  void handleSubmit(event);
                }}
              >
                <div className='field-grid two-columns'>
                  <label className='field'>
                    <span className='field-label'>Código</span>
                    <input
                      className='input-text'
                      type='text'
                      value={form.codigo}
                      maxLength={24}
                      placeholder='EJ: PREVENTA25'
                      onChange={(event) =>
                        handleInputChange('codigo', event.target.value.toUpperCase())
                      }
                    />
                  </label>
                  <label className='field'>
                    <span className='field-label'>Evento</span>
                    <select
                      className='input-text'
                      value={form.idEvento}
                      onChange={(event) =>
                        handleInputChange('idEvento', Number(event.target.value))
                      }
                    >
                      {eventOptions.length === 0 ? (
                        <option value={form.idEvento || 0}>
                          {form.idEvento === 0
                            ? 'Selecciona un evento'
                            : `Evento #${form.idEvento}`}
                        </option>
                      ) : (
                        eventOptions.map((event) => (
                          <option key={event.idEvento} value={event.idEvento}>
                            {event.titulo}
                          </option>
                        ))
                      )}
                    </select>
                    {eventOptions.length === 0 && (
                      <span className='field-hint'>
                        No hay eventos registrados. Crea uno desde el módulo de Eventos.
                      </span>
                    )}
                  </label>
                </div>

                <label className='field'>
                  <span className='field-label'>Descripción</span>
                  <textarea
                    className='input-textarea'
                    value={form.descripcion}
                    maxLength={220}
                    placeholder='Explica cómo y cuándo se aplica el cupón.'
                    onChange={(event) => handleInputChange('descripcion', event.target.value)}
                  />
                </label>

                <div className='field-grid three-columns'>
                  <label className='field'>
                    <span className='field-label'>Tipo de valor</span>
                    <select
                      className='input-text'
                      value={form.tipo}
                      onChange={(event) =>
                        handleInputChange('tipo', event.target.value as CouponType)
                      }
                    >
                      <option value='PORCENTAJE'>Porcentaje</option>
                      <option value='MONTO'>Monto fijo</option>
                    </select>
                  </label>

                  <label className='field'>
                    <span className='field-label'>Valor</span>
                    <input
                      className='input-text'
                      type='number'
                      min={0}
                      value={form.valor}
                      onChange={(event) => handleInputChange('valor', Number(event.target.value))}
                    />
                  </label>

                  <label className='field'>
                    <span className='field-label'>Estado</span>
                    <select
                      className='input-text'
                      value={form.activo}
                      onChange={(event) =>
                        handleInputChange('activo', Number(event.target.value) === 1 ? 1 : 0)
                      }
                    >
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                  </label>
                </div>

                <div className='field-grid two-columns'>
                  <label className='field'>
                    <span className='field-label'>Uso por usuario</span>
                    <input
                      className='input-text'
                      type='number'
                      min={1}
                      value={form.uso_por_usuario}
                      onChange={(event) =>
                        handleInputChange('uso_por_usuario', Number(event.target.value))
                      }
                    />
                  </label>
                  <label className='field'>
                    <span className='field-label'>Usos registrados</span>
                    <input
                      className='input-text'
                      type='number'
                      value={form.uso_realizados}
                      disabled
                    />
                  </label>
                </div>

                <div className='field-grid two-columns'>
                  <label className='field'>
                    <span className='field-label'>Fecha inicio</span>
                    <input
                      className='input-text'
                      type='date'
                      value={form.fechaInicio}
                      onChange={(event) => handleInputChange('fechaInicio', event.target.value)}
                    />
                  </label>
                  <label className='field'>
                    <span className='field-label'>Fecha fin</span>
                    <input
                      className='input-text'
                      type='date'
                      value={form.fechaFin}
                      onChange={(event) => handleInputChange('fechaFin', event.target.value)}
                    />
                  </label>
                </div>

                <div className='button-row'>
                  <Button
                    type='submit'
                    color='yellow-filled'
                    text={selectedCouponId !== null ? 'Actualizar cupón' : 'Crear cupón'}
                    rightIcon='check_circle'
                    disabled={savingState === 'saving'}
                  />
                </div>
                {feedback !== null && <p className='field-hint'>{feedback}</p>}
              </form>
            </>
          ) : (
            <div className='coupon-placeholder'>
              <span className='material-symbols-outlined'>confirmation_number</span>
              <h4>Gestione sus cupones</h4>
              <p>
                Utiliza los filtros para revisar campañas existentes o inicia la creación de un
                nuevo cupón para impulsar tus eventos.
              </p>
              <Button
                type='button'
                color='yellow-filled'
                text='Crear nuevo cupón'
                leftIcon='add'
                onClick={handleNewCoupon}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CouponManager;
