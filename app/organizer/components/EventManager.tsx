'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@components/Button/Button';
import { useUser } from '@contexts/UserContext';
import { resolveOrganizerIdFromUser } from '@utils/organizer';

type EventState = 'BORRADOR' | 'PUBLICADO' | 'CANCELADO';

type EventDate = {
    idFechaEvento: number;
    idFecha: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
};

type ManagedEvent = {
    idEvento: number;
    titulo: string;
    lugar: string;
    estado: EventState;
    fechas: EventDate[];
    imagenPortada: string;
};

type EventsResponse = {
    data: ManagedEvent[];
    metadata?: {
        serverTime: string;
        source: string;
    };
};

const statusCopy: Record<EventState, string> = {
    BORRADOR: 'Borrador',
    PUBLICADO: 'Publicado',
    CANCELADO: 'Cancelado',
};

const statusColor: Record<EventState, string> = {
    BORRADOR: 'borrador',
    PUBLICADO: 'publicado',
    CANCELADO: 'cancelado',
};

type FilterState = 'all' | EventState;

const EventManager: React.FC = () => {
    const router = useRouter();
    const { user, loading: userLoading } = useUser();
    const organizerId = useMemo(() => resolveOrganizerIdFromUser(user), [user]);
    const [events, setEvents] = useState<ManagedEvent[]>([]);
    const [filter, setFilter] = useState<FilterState>('all');
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const fetchEvents = useCallback(async () => {
        if (userLoading) return;
        if (!organizerId) {
            setStatus('error');
            setErrorMessage('No pudimos obtener tu ID de organizador. Inicia sesion nuevamente.');
            return;
        }
        try {
            setStatus('loading');
            const response = await fetch(`/api/organizer/events?organizerId=${organizerId}`, {
                cache: 'no-store',
            });
            if (!response.ok) throw new Error('No se pudieron obtener los eventos');
            const data = (await response.json()) as EventsResponse;
            setEvents(data.data || []);
            setStatus('idle');
            setErrorMessage('');
        } catch (error) {
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
        }
    }, [organizerId, userLoading]);

    useEffect(() => {
        void fetchEvents();
    }, [fetchEvents]);

    const handleEdit = (eventId: number) => {
        router.push(`/organizer/events?eventId=${eventId}`);
    };

    const handleCancel = async (eventId: number) => {
        if (userLoading) return;
        if (!organizerId) {
            setErrorMessage('No pudimos obtener tu ID de organizador para cancelar el evento.');
            setStatus('error');
            return;
        }
        if (!confirm('¿Estás seguro de que deseas cancelar este evento?')) return;

        try {
            setStatus('loading');
            const event = events.find((e) => e.idEvento === eventId);
            if (!event) return;

            const response = await fetch('/api/organizer/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...event,
                    idOrganizador: organizerId,
                    estado: 'CANCELADO',
                }),
            });
            console.log(response);
            //if (!response.ok) throw new Error('No se pudo cancelar el evento');

            await fetchEvents();
            alert('Evento cancelado exitosamente');
        } catch (error) {
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Error al cancelar el evento');
        }
    };
    const isEventPast = (eventDates: EventDate[]): boolean => {
        if (eventDates.length === 0) return false;
        const now = new Date();
        const allPast = eventDates.every((date) => {
            const eventDate = new Date(date.fecha);
            return eventDate < now;
        });
        return allPast;
    };

    const filteredEvents = events.filter((event) => {
        if (filter === 'all') return true;
        return event.estado === filter;
    });

    const formatDate = (date: EventDate) => {
        const dateStr = new Date(date.fecha).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        return `${dateStr} · ${date.horaInicio} - ${date.horaFin}`;
    };

    return (
        <div className='event-manager'>
            {/* Filters */}
            <div className='event-manager-filters'>
                <div className='filter-buttons'>
                    <button
                        type='button'
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Todos ({events.length})
                    </button>
                    <button
                        type='button'
                        className={`filter-btn ${filter === 'BORRADOR' ? 'active' : ''}`}
                        onClick={() => setFilter('BORRADOR')}
                    >
                        Borradores ({events.filter((e) => e.estado === 'BORRADOR').length})
                    </button>
                    <button
                        type='button'
                        className={`filter-btn ${filter === 'PUBLICADO' ? 'active' : ''}`}
                        onClick={() => setFilter('PUBLICADO')}
                    >
                        Publicados ({events.filter((e) => e.estado === 'PUBLICADO').length})
                    </button>
                    <button
                        type='button'
                        className={`filter-btn ${filter === 'CANCELADO' ? 'active' : ''}`}
                        onClick={() => setFilter('CANCELADO')}
                    >
                        Cancelados ({events.filter((e) => e.estado === 'CANCELADO').length})
                    </button>
                </div>
            </div>

            {/* Status Messages */}
            {status === 'loading' && <p className='gray'>Cargando eventos...</p>}
            {status === 'error' && <p className='field-hint'>{errorMessage}</p>}

            {/* Events List */}
            {status === 'idle' && filteredEvents.length === 0 && (
                <div className='empty-state'>
                    <span className='material-symbols-outlined'>event_busy</span>
                    <p>No hay eventos para mostrar</p>
                </div>
            )}

            {status === 'idle' && filteredEvents.length > 0 && (
                <div className='event-manager-grid'>
                    {filteredEvents.map((event) => {
                        const primaryDate = event.fechas[0];
                        const isPast = isEventPast(event.fechas);
                        const canEdit = event.estado === 'BORRADOR';
                        const canCancel = !isPast && event.estado !== 'CANCELADO';

                        return (
                            <div key={event.idEvento} className='event-manager-card'>
                                {/* Event Image */}
                                {event.imagenPortada && (
                                    <div className='event-card-image'>
                                        <img src={event.imagenPortada} alt={event.titulo} />
                                    </div>
                                )}

                                {/* Event Info */}
                                <div className='event-card-content'>
                                    <div className='event-card-header'>
                                        <h3>{event.titulo}</h3>
                                        <span className={`status-pill ${statusColor[event.estado]}`}>
                                            {statusCopy[event.estado]}
                                        </span>
                                    </div>

                                    <div className='event-card-details'>
                                        <div className='event-detail-item'>
                                            <span className='material-symbols-outlined'>location_on</span>
                                            <span>{event.lugar || 'Ubicación por definir'}</span>
                                        </div>
                                        {primaryDate && (
                                            <div className='event-detail-item'>
                                                <span className='material-symbols-outlined'>calendar_today</span>
                                                <span>{formatDate(primaryDate)}</span>
                                            </div>
                                        )}
                                        {event.fechas.length > 1 && (
                                            <div className='event-detail-item'>
                                                <span className='material-symbols-outlined'>event_repeat</span>
                                                <span>{event.fechas.length} fechas programadas</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className='event-card-actions'>
                                        {canEdit && (
                                            <Button
                                                color='yellow-filled'
                                                text='Editar'
                                                leftIcon='edit'
                                                onClick={() => handleEdit(event.idEvento)}
                                            />
                                        )}
                                        {canCancel && (
                                            <Button
                                                color='gray-overlay'
                                                text='Cancelar evento'
                                                leftIcon='cancel'
                                                onClick={() => handleCancel(event.idEvento)}
                                            />
                                        )}
                                        {!canEdit && !canCancel && (
                                            <p className='gray small'>
                                                {isPast ? 'Evento finalizado' : 'No hay acciones disponibles'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EventManager;
