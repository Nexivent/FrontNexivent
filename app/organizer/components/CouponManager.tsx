'use client';

import { useEffect, useMemo, useState } from 'react';
import Button from '@components/Button/Button';

type CouponForm = {
  idCupon: number;
  idEvento: number;
  descripcion: string;
  tipo: 0 | 1; // 0 porcentaje, 1 monto fijo
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

type FetchState = 'idle' | 'loading' | 'error';

const resolveOrganizerUserId = () => {
  const envValue = Number(process.env.NEXT_PUBLIC_ORGANIZER_ID);
  if (!Number.isNaN(envValue) && envValue > 0) return envValue;
  return 1; // Default organizer ID for development
};

const organizerUserId = resolveOrganizerUserId();
const couponsListEndpoint = `/api/organizer/coupons?organizerId=${organizerUserId}`;
const couponCreateEndpoint = `/api/organizer/coupons?usuarioCreacion=${organizerUserId}`;
const couponUpdateEndpoint = `/api/organizer/coupons?usuarioModificacion=${organizerUserId}`;
const eventsListEndpoint = `/api/organizer/events?organizadorId=${organizerUserId}`;

const createEmptyCoupon = (): CouponForm => {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  return {
    idCupon: Date.now(),
    idEvento: 0,
    descripcion: '',
    tipo: 0,
    activo: 1,
    valor: 10,
    codigo: '',
    uso_por_usuario: 1,
    uso_realizados: 0,
    fechaInicio: today.toISOString().slice(0, 10),
    fechaFin: nextMonth.toISOString().slice(0, 10),
  };
};

const CouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponForm[]>([]);
  const [events, setEvents] = useState<OrganizerEventSummary[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [eventsState, setEventsState] = useState<FetchState>('idle');
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
  const [form, setForm] = useState<CouponForm>(() => createEmptyCoupon());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [eventFilter, setEventFilter] = useState<'all' | number>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    let mounted = true;
    const loadCoupons = async () => {
      setFetchState('loading');
      try {
        const response = await fetch(couponsListEndpoint, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`No se pudieron obtener los cupones (${response.status}).`);
        }
        const payload = await response.json();
        if (!mounted) return;
        setCoupons(payload?.data ?? []);
        setFetchState('idle');
      } catch (error) {
        if (mounted) {
          setFetchState('error');
          setFeedback(
            error instanceof Error ? error.message : 'No se pudieron obtener los cupones.'
          );
        }
      }
    };

    void loadCoupons();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setEventsState('loading');
    fetch(eventsListEndpoint)
      .then(async (response) => {
        if (!response.ok) throw new Error('No se pudieron obtener los eventos');
        console.log('Events response:', response.body);
        return response.json();
      })
      .then((payload) => {
        if (!mounted) return;
        const normalized: OrganizerEventSummary[] = (payload?.data ?? []).map((event: any) => {
          const eventId = Number(event.idEvento ?? event.id ?? 0);
          return {
            idEvento: Number.isNaN(eventId) ? 0 : eventId,
            titulo: event.titulo ?? event.nombre ?? `Evento #${eventId || ''}`,
          };
        });
        setEvents(normalized);
        setEventsState('idle');
      })
      .catch(() => {
        if (mounted) setEventsState('error');
      });

    return () => {
      mounted = false;
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
      const isEditing = selectedCouponId !== null;
      const endpoint = isEditing ? couponUpdateEndpoint : couponCreateEndpoint;
      const method = isEditing ? 'PUT' : 'POST';
      console.log('Submitting to', endpoint, 'with method', method, 'and form', JSON.stringify(form));
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        const errorMessage =
          errorPayload !== null &&
          typeof (errorPayload as { message?: unknown }).message === 'string' &&
          (errorPayload as { message: string }).message.length > 0
            ? (errorPayload as { message: string }).message
            : `No se pudo guardar el cupon (${response.status}).`;
        throw new Error(errorMessage);
      }

      const payload = await response.json();
      const savedCoupon = (payload?.data ?? payload) as CouponForm;
      setCoupons((previous) => {
        const filtered = previous.filter((coupon) => coupon.idCupon !== savedCoupon.idCupon);
        return [savedCoupon, ...filtered];
      });
      setSelectedCouponId(savedCoupon.idCupon);
      setForm(savedCoupon);
      setSavingState('success');
      setFeedback(
        (typeof payload?.message === 'string' && payload.message.length > 0
          ? payload.message
          : null) ??
          (isEditing ? 'Cupon actualizado correctamente.' : 'Cupon guardado correctamente.')
      );
    } catch (error) {
      setSavingState('error');
      setFeedback(
        error instanceof Error ? error.message : 'No se pudo guardar el cupon. Intenta nuevamente.'
      );
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
                disabled={eventsState === 'loading'}
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

          {fetchState === 'loading' ? (
            <p className='gray'>Cargando cupones...</p>
          ) : fetchState === 'error' ? (
            <p className='field-hint'>No se pudo obtener la data. Intenta nuevamente.</p>
          ) : filteredCoupons.length === 0 ? (
            <p className='field-hint'>No hay cupones que coincidan con el filtro seleccionado.</p>
          ) : (
            <table className='coupon-table'>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Evento</th>
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
                      
                      <td>
                        {coupon.tipo === 0
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
                      disabled={selectedCouponId !== null}
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
                      disabled={selectedCouponId !== null}
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
                    {eventsState === 'error' && (
                      <span className='field-hint'>
                        No pudimos cargar los eventos. Intenta recargar.
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
                        handleInputChange('tipo', Number(event.target.value) === 1 ? 1 : 0)
                      }
                      disabled={selectedCouponId !== null}
                    >
                      <option value={0}>Porcentaje</option>
                      <option value={1}>Monto fijo</option>
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
                      disabled={selectedCouponId !== null}
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
