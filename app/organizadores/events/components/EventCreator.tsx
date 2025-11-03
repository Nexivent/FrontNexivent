'use client';

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FC } from 'react';

// hooks
import useAlert from '@hooks/useAlert';

// components
import Input from '@components/Form/Input';
import Heading from '@components/Heading/Heading';

// utils
import {
  adminEventApi,
  eventCategories,
  organizers,
  type AdjustmentType,
  type AdminEvent,
  type AdminEventPayload,
  type EventStatus,
  type SoldOutAction,
  type TicketPhaseStatus,
  type TicketPhaseVisibility,
} from '@utils/organizers/events';

interface PriceAdjustmentDraft {
  tipo: AdjustmentType;
  valor: string;
}

interface EventFormState {
  titulo: string;
  descripcion: string;
  lugar: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  idOrganizador: number;
  idCategoria: number;
  moneda: 'PEN';
  impuestos: PriceAdjustmentDraft;
  comisiones: PriceAdjustmentDraft;
}

interface BuyerProfileDraft {
  id: string;
  nombre: string;
  descripcion: string;
}

interface SectorDraft {
  id: string;
  nombre: string;
  capacidad: string;
  accesibilidad: {
    sillaRuedas: boolean;
    acompaniamientoPermitido: boolean;
    acompaniamientoObligatorio: boolean;
    sectorVinculadoId: string;
  };
}

interface PhaseDraft {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  visibilidad: TicketPhaseVisibility;
  bloqueadoHasta: string;
  estado: TicketPhaseStatus;
}

interface PriceCombinationDraft {
  id: string;
  sectorId: string;
  perfilId: string;
  faseId: string;
  disponible: boolean;
  precio: string;
  accionAgotado: SoldOutAction;
  mensajeAgotado: string;
}

interface CouponDraft {
  id: string;
  codigo: string;
  tipo: 'PORCENTAJE' | 'FIJO';
  valor: string;
  requisito: string;
  descripcion: string;
}

interface PricePreview extends PriceCombinationDraft {
  finalPrice: number;
  sectorNombre: string;
  perfilNombre: string;
  faseNombre: string;
}

const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const createBuyerProfileDraft = (): BuyerProfileDraft => ({
  id: generateId(),
  nombre: '',
  descripcion: '',
});

const createSectorDraft = (): SectorDraft => ({
  id: generateId(),
  nombre: '',
  capacidad: '',
  accesibilidad: {
    sillaRuedas: false,
    acompaniamientoPermitido: true,
    acompaniamientoObligatorio: false,
    sectorVinculadoId: '',
  },
});

const createPhaseDraft = (): PhaseDraft => ({
  id: generateId(),
  nombre: '',
  fechaInicio: '',
  fechaFin: '',
  visibilidad: 'PUBLICO',
  bloqueadoHasta: '',
  estado: 'BORRADOR',
});

const createPriceDraft = (
  sectorId: string,
  perfilId: string,
  faseId: string
): PriceCombinationDraft => ({
  id: generateId(),
  sectorId,
  perfilId,
  faseId,
  disponible: true,
  precio: '',
  accionAgotado: 'DETENER',
  mensajeAgotado: '',
});

const createCouponDraft = (): CouponDraft => ({
  id: generateId(),
  codigo: '',
  tipo: 'PORCENTAJE',
  valor: '',
  requisito: '',
  descripcion: '',
});

const adjustmentLabels: Record<AdjustmentType, string> = {
  PORCENTAJE: 'Porcentaje',
  FIJO: 'Monto fijo',
};

const visibilityLabels: Record<TicketPhaseVisibility, string> = {
  PUBLICO: 'Público',
  OCULTO: 'Oculto (solo enlace)',
  BLOQUEADO: 'Bloqueado hasta una fecha',
};

const phaseStatusLabels: Record<TicketPhaseStatus, string> = {
  BORRADOR: 'Borrador',
  ACTIVO: 'Activo',
  PAUSADO: 'Pausado',
  AGOTADO: 'Agotado',
  FINALIZADO: 'Finalizado',
};

const soldOutActionLabels: Record<SoldOutAction, string> = {
  DETENER: 'Detener venta',
  LISTA_ESPERA: 'Habilitar lista de espera',
};

const eventStatusLabels: Record<EventStatus, string> = {
  BORRADOR: 'Borrador',
  PUBLICADO: 'Publicado',
  CANCELADO: 'Cancelado',
};

const formatDateTimePreview = (value: string): string => {
  if (!value) {
    return 'Por definir';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Fecha inválida';
  }

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
};

const buildCombinationKey = (sectorId: string, perfilId: string, faseId: string): string =>
  `${sectorId}::${perfilId}::${faseId}`;

const EventCreator: FC = () => {
  const { showAlert, hideAlert } = useAlert();

  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formState, setFormState] = useState<EventFormState>(() => ({
    titulo: '',
    descripcion: '',
    lugar: '',
    fechaHoraInicio: '',
    fechaHoraFin: '',
    idOrganizador: organizers[0]?.idOrganizador ?? 0,
    idCategoria: eventCategories[0]?.idCategoria ?? 0,
    moneda: 'PEN',
    impuestos: { tipo: 'PORCENTAJE', valor: '0' },
    comisiones: { tipo: 'PORCENTAJE', valor: '0' },
  }));
  const [buyerProfiles, setBuyerProfiles] = useState<BuyerProfileDraft[]>(() => [
    { ...createBuyerProfileDraft(), nombre: 'Adulto' },
  ]);
  const [ticketSectors, setTicketSectors] = useState<SectorDraft[]>(() => [
    { ...createSectorDraft(), nombre: 'General', capacidad: '0' },
  ]);
  const [ticketPhases, setTicketPhases] = useState<PhaseDraft[]>(() => [
    { ...createPhaseDraft(), nombre: 'Preventa' },
  ]);
  const [priceMatrix, setPriceMatrix] = useState<PriceCombinationDraft[]>([]);
  const [coupons, setCoupons] = useState<CouponDraft[]>([]);
  const [templateCombinationId, setTemplateCombinationId] = useState<string | null>(null);
  useEffect(() => {
    const fetchEvents = async (): Promise<void> => {
      const data = await adminEventApi.listEvents();

      setEvents(data);
    };

    void fetchEvents();
  }, []);

  const syncPriceMatrix = useCallback(() => {
    setPriceMatrix((prev) => {
      const map = new Map<string, PriceCombinationDraft>();

      prev.forEach((item) => {
        map.set(buildCombinationKey(item.sectorId, item.perfilId, item.faseId), item);
      });

      const next: PriceCombinationDraft[] = [];

      ticketSectors.forEach((sector) => {
        if (sector.nombre.trim() === '' || sector.id === '') {
          return;
        }

        buyerProfiles.forEach((perfil) => {
          if (perfil.nombre.trim() === '' || perfil.id === '') {
            return;
          }

          ticketPhases.forEach((fase) => {
            if (fase.nombre.trim() === '' || fase.id === '') {
              return;
            }

            const key = buildCombinationKey(sector.id, perfil.id, fase.id);
            const existing = map.get(key);

            next.push(
              existing ?? {
                ...createPriceDraft(sector.id, perfil.id, fase.id),
              }
            );
          });
        });
      });

      return next;
    });
  }, [buyerProfiles, ticketPhases, ticketSectors]);

  useEffect(() => {
    syncPriceMatrix();
  }, [syncPriceMatrix]);

  const handleGeneralInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = event.target;

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGeneralSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const { name, value } = event.target;

    setFormState((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleAdjustmentChange = (
    key: 'impuestos' | 'comisiones',
    field: 'tipo' | 'valor',
    value: string
  ): void => {
    setFormState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: field === 'valor' ? value.replace(/[^0-9.,-]/g, '').replace(',', '.') : value,
      },
    }));
  };

  const handleBuyerProfileChange = (
    id: string,
    field: keyof Omit<BuyerProfileDraft, 'id'>,
    value: string
  ): void => {
    setBuyerProfiles((prev) =>
      prev.map((profile) =>
        profile.id === id
          ? {
              ...profile,
              [field]: value,
            }
          : profile
      )
    );
  };

  const addBuyerProfile = (): void => {
    setBuyerProfiles((prev) => [...prev, createBuyerProfileDraft()]);
  };

  const removeBuyerProfile = (id: string): void => {
    setBuyerProfiles((prev) =>
      prev.length === 1 ? prev : prev.filter((profile) => profile.id !== id)
    );
  };

  const handleSectorChange = (
    id: string,
    field: keyof Omit<SectorDraft, 'id' | 'accesibilidad'>,
    value: string
  ): void => {
    setTicketSectors((prev) =>
      prev.map((sector) =>
        sector.id === id
          ? {
              ...sector,
              [field]: field === 'capacidad' ? value.replace(/[^0-9]/g, '') : value,
            }
          : sector
      )
    );
  };

  const handleSectorAccessibilityChange = (
    id: string,
    field: keyof SectorDraft['accesibilidad'],
    value: string | boolean
  ): void => {
    setTicketSectors((prev) =>
      prev.map((sector) =>
        sector.id === id
          ? {
              ...sector,
              accesibilidad: {
                ...sector.accesibilidad,
                [field]: value,
              },
            }
          : sector
      )
    );
  };

  const addSector = (): void => {
    setTicketSectors((prev) => [...prev, createSectorDraft()]);
  };

  const removeSector = (id: string): void => {
    setTicketSectors((prev) =>
      prev.length === 1 ? prev : prev.filter((sector) => sector.id !== id)
    );
  };

  const handlePhaseChange = (
    id: string,
    field: keyof Omit<PhaseDraft, 'id' | 'visibilidad' | 'estado'>,
    value: string
  ): void => {
    setTicketPhases((prev) =>
      prev.map((phase) =>
        phase.id === id
          ? {
              ...phase,
              [field]: value,
            }
          : phase
      )
    );
  };

  const handlePhaseSelectChange = (
    id: string,
    field: 'visibilidad' | 'estado',
    value: TicketPhaseVisibility | TicketPhaseStatus
  ): void => {
    setTicketPhases((prev) =>
      prev.map((phase) =>
        phase.id === id
          ? {
              ...phase,
              [field]: value,
            }
          : phase
      )
    );
  };

  const addPhase = (): void => {
    setTicketPhases((prev) => [...prev, createPhaseDraft()]);
  };

  const removePhase = (id: string): void => {
    setTicketPhases((prev) => (prev.length === 1 ? prev : prev.filter((phase) => phase.id !== id)));
  };

  const handlePriceDraftChange = (
    id: string,
    field: keyof Omit<
      PriceCombinationDraft,
      'id' | 'sectorId' | 'perfilId' | 'faseId' | 'disponible' | 'accionAgotado'
    >,
    value: string
  ): void => {
    setPriceMatrix((prev) =>
      prev.map((combination) =>
        combination.id === id
          ? {
              ...combination,
              [field]: value,
            }
          : combination
      )
    );
  };

  const handlePriceToggle = (id: string, available: boolean): void => {
    setPriceMatrix((prev) =>
      prev.map((combination) =>
        combination.id === id
          ? {
              ...combination,
              disponible: available,
            }
          : combination
      )
    );
  };

  const handleSoldOutActionChange = (id: string, action: SoldOutAction): void => {
    setPriceMatrix((prev) =>
      prev.map((combination) =>
        combination.id === id
          ? {
              ...combination,
              accionAgotado: action,
            }
          : combination
      )
    );
  };

  const addCoupon = (): void => {
    setCoupons((prev) => [...prev, createCouponDraft()]);
  };

  const removeCoupon = (id: string): void => {
    setCoupons((prev) => prev.filter((coupon) => coupon.id !== id));
  };

  const handleCouponChange = (
    id: string,
    field: keyof Omit<CouponDraft, 'id'>,
    value: string
  ): void => {
    setCoupons((prev) =>
      prev.map((coupon) =>
        coupon.id === id
          ? {
              ...coupon,
              [field]:
                field === 'valor' ? value.replace(/[^0-9.,-]/g, '').replace(',', '.') : value,
            }
          : coupon
      )
    );
  };

  const selectedTemplate = useMemo(
    () => priceMatrix.find((combination) => combination.id === templateCombinationId) ?? null,
    [priceMatrix, templateCombinationId]
  );

  const applyTemplate = (scope: 'ALL' | 'SECTOR' | 'PERFIL' | 'FASE'): void => {
    if (selectedTemplate === null) {
      showAlert({ type: 'error', text: 'Selecciona una combinación como plantilla primero.' });

      return;
    }

    setPriceMatrix((prev) =>
      prev.map((combination) => {
        if (combination.id === selectedTemplate.id) {
          return combination;
        }

        const sameSector = combination.sectorId === selectedTemplate.sectorId;
        const samePerfil = combination.perfilId === selectedTemplate.perfilId;
        const samePhase = combination.faseId === selectedTemplate.faseId;

        const shouldApply =
          scope === 'ALL' ||
          (scope === 'SECTOR' && sameSector) ||
          (scope === 'PERFIL' && samePerfil) ||
          (scope === 'FASE' && samePhase);

        if (!shouldApply) {
          return combination;
        }

        return {
          ...combination,
          precio: selectedTemplate.precio,
          disponible: selectedTemplate.disponible,
          accionAgotado: selectedTemplate.accionAgotado,
          mensajeAgotado: selectedTemplate.mensajeAgotado,
        };
      })
    );

    showAlert({ type: 'success', text: 'Plantilla aplicada correctamente.' });
  };
  const calculateFinalPrice = useCallback(
    (rawPrice: number): number => {
      if (Number.isNaN(rawPrice)) {
        return 0;
      }

      const applyAdjustment = (base: number, adjustment: PriceAdjustmentDraft): number => {
        const amount = Number(adjustment.valor) || 0;

        if (adjustment.tipo === 'PORCENTAJE') {
          return base + (base * amount) / 100;
        }

        return base + amount;
      };

      let price = rawPrice;

      price = applyAdjustment(price, formState.impuestos);
      price = applyAdjustment(price, formState.comisiones);

      return price;
    },
    [formState.comisiones, formState.impuestos]
  );

  const pricePreview = useMemo<PricePreview[]>(() => {
    return priceMatrix.map((combination) => {
      const basePrice = Number(combination.precio) || 0;
      const finalPrice = calculateFinalPrice(basePrice);
      const sectorNombre =
        ticketSectors.find((sector) => sector.id === combination.sectorId)?.nombre ?? 'Sector';
      const perfilNombre =
        buyerProfiles.find((perfil) => perfil.id === combination.perfilId)?.nombre ?? 'Perfil';
      const faseNombre =
        ticketPhases.find((phase) => phase.id === combination.faseId)?.nombre ?? 'Fase';

      return {
        ...combination,
        finalPrice,
        sectorNombre,
        perfilNombre,
        faseNombre,
      };
    });
  }, [buyerProfiles, calculateFinalPrice, priceMatrix, ticketPhases, ticketSectors]);

  const totalCapacity = useMemo(() => {
    return ticketSectors.reduce((acc, sector) => acc + (Number(sector.capacidad) || 0), 0);
  }, [ticketSectors]);

  const exportMatrix = (): void => {
    if (priceMatrix.length === 0) {
      showAlert({ type: 'error', text: 'No hay combinaciones para exportar.' });

      return;
    }

    const header = 'Sector,Perfil,Fase,Precio,Disponible,AccionAgotado,MensajeAgotado\n';
    const rows = pricePreview
      .map((combination) => {
        const data = [
          combination.sectorNombre,
          combination.perfilNombre,
          combination.faseNombre,
          combination.precio,
          combination.disponible ? 'SI' : 'NO',
          combination.accionAgotado,
          combination.mensajeAgotado?.replaceAll('\n', ' '),
        ];

        return data.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',');
      })
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formState.titulo || 'matriz-precios'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const importMatrix = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    if (file === undefined) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const text = reader.result;

      if (typeof text !== 'string') {
        showAlert({ type: 'error', text: 'No se pudo leer el archivo seleccionado.' });

        return;
      }

      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');

      if (lines.length <= 1) {
        showAlert({ type: 'error', text: 'El archivo no contiene datos para importar.' });

        return;
      }

      const [, ...rows] = lines;
      const updates: Array<
        [
          string,
          string,
          string,
          {
            precio: string;
            disponible: boolean;
            accionAgotado: SoldOutAction;
            mensajeAgotado: string;
          },
        ]
      > = [];

      rows.forEach((row) => {
        const values = row
          .split(',')
          .map((value) => value.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

        if (values.length < 6) {
          return;
        }

        const [
          sectorNombre,
          perfilNombre,
          faseNombre,
          precio,
          disponible,
          accionAgotado,
          mensajeAgotado = '',
        ] = values;

        const sector = ticketSectors.find(
          (current) => current.nombre.toLowerCase() === sectorNombre.toLowerCase()
        );
        const perfil = buyerProfiles.find(
          (current) => current.nombre.toLowerCase() === perfilNombre.toLowerCase()
        );
        const fase = ticketPhases.find(
          (current) => current.nombre.toLowerCase() === faseNombre.toLowerCase()
        );

        if (!sector || !perfil || !fase) {
          return;
        }

        const key = buildCombinationKey(sector.id, perfil.id, fase.id);

        updates.push([
          key,
          sector.id,
          perfil.id,
          {
            precio,
            disponible: disponible.toUpperCase() === 'SI',
            accionAgotado: (accionAgotado as SoldOutAction) ?? 'DETENER',
            mensajeAgotado,
          },
        ]);
      });

      if (updates.length === 0) {
        showAlert({ type: 'error', text: 'No se encontraron coincidencias en la matriz.' });

        return;
      }

      setPriceMatrix((prev) => {
        const map = new Map<string, PriceCombinationDraft>();

        prev.forEach((combination) => {
          map.set(
            buildCombinationKey(combination.sectorId, combination.perfilId, combination.faseId),
            combination
          );
        });

        updates.forEach(([key, sectorId, perfilId, data]) => {
          const existing = map.get(key);

          if (existing !== undefined) {
            map.set(key, {
              ...existing,
              sectorId,
              perfilId,
              precio: data.precio,
              disponible: data.disponible,
              accionAgotado: data.accionAgotado,
              mensajeAgotado: data.mensajeAgotado,
            });
          }
        });

        return Array.from(map.values());
      });

      showAlert({ type: 'success', text: 'Matriz importada exitosamente.' });
    };

    reader.readAsText(file, 'utf-8');
  };

  const resetForm = (): void => {
    setFormState({
      titulo: '',
      descripcion: '',
      lugar: '',
      fechaHoraInicio: '',
      fechaHoraFin: '',
      idOrganizador: organizers[0]?.idOrganizador ?? 0,
      idCategoria: eventCategories[0]?.idCategoria ?? 0,
      moneda: 'PEN',
      impuestos: { tipo: 'PORCENTAJE', valor: '0' },
      comisiones: { tipo: 'PORCENTAJE', valor: '0' },
    });
    setBuyerProfiles([{ ...createBuyerProfileDraft(), nombre: 'Adulto' }]);
    setTicketSectors([{ ...createSectorDraft(), nombre: 'General', capacidad: '0' }]);
    setTicketPhases([{ ...createPhaseDraft(), nombre: 'Preventa' }]);
    setPriceMatrix([]);
    setCoupons([]);
    setTemplateCombinationId(null);
  };
  const validateForm = (): string | null => {
    if (formState.titulo.trim() === '') {
      return 'Debes ingresar un título para el evento.';
    }

    if (formState.descripcion.trim() === '') {
      return 'Completa la descripción del evento para continuar.';
    }

    if (formState.lugar.trim() === '') {
      return 'Especifica el lugar del evento.';
    }

    if (formState.fechaHoraInicio === '' || formState.fechaHoraFin === '') {
      return 'Selecciona la fecha y hora de inicio y fin.';
    }

    const startDate = new Date(formState.fechaHoraInicio);
    const endDate = new Date(formState.fechaHoraFin);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return 'Las fechas del evento no son válidas.';
    }

    if (endDate <= startDate) {
      return 'La fecha de fin debe ser posterior a la fecha de inicio.';
    }

    if (formState.moneda !== 'PEN') {
      return 'La moneda del evento debe ser siempre soles peruanos (PEN).';
    }

    const impuestosValor = Number(formState.impuestos.valor);
    const comisionesValor = Number(formState.comisiones.valor);

    if (Number.isNaN(impuestosValor) || impuestosValor < 0) {
      return 'Define un valor válido para los impuestos del evento.';
    }

    if (Number.isNaN(comisionesValor) || comisionesValor < 0) {
      return 'Define un valor válido para las comisiones del evento.';
    }

    const validProfiles = buyerProfiles.filter((profile) => profile.nombre.trim() !== '');

    if (validProfiles.length === 0) {
      return 'Agrega al menos un perfil de comprador con nombre.';
    }

    const validSectors = ticketSectors.filter(
      (sector) => sector.nombre.trim() !== '' && Number(sector.capacidad) > 0
    );

    if (validSectors.length === 0) {
      return 'Define al menos un sector con capacidad mayor a cero.';
    }

    const validPhases = ticketPhases.filter((phase) => {
      if (
        phase.nombre.trim() === '' ||
        phase.fechaInicio === '' ||
        phase.fechaFin === '' ||
        new Date(phase.fechaFin) <= new Date(phase.fechaInicio)
      ) {
        return false;
      }

      if (phase.visibilidad === 'BLOQUEADO' && phase.bloqueadoHasta.trim() === '') {
        return false;
      }

      return true;
    });

    if (validPhases.length === 0) {
      return 'Configura al menos una fase de venta con rango de fechas válido.';
    }

    const groupedByName = new Map<string, PhaseDraft[]>();

    validPhases.forEach((phase) => {
      const key = phase.nombre.trim().toLowerCase();
      const current = groupedByName.get(key) ?? [];
      current.push(phase);
      groupedByName.set(key, current);
    });

    for (const phases of groupedByName.values()) {
      const sorted = phases
        .map((phase) => ({
          ...phase,
          start: new Date(phase.fechaInicio).getTime(),
          end: new Date(phase.fechaFin).getTime(),
        }))
        .sort((a, b) => a.start - b.start);

      for (let index = 1; index < sorted.length; index += 1) {
        if (sorted[index].start < sorted[index - 1].end) {
          return `Revisa las fechas de la fase "${sorted[index].nombre}". No puede solaparse con fases del mismo tipo.`;
        }
      }
    }

    if (priceMatrix.length === 0) {
      return 'Genera al menos una combinación de sector, perfil y fase.';
    }

    const hasActivePrice = priceMatrix.some(
      (combination) => combination.disponible && Number(combination.precio) > 0
    );

    if (!hasActivePrice) {
      return 'Debes tener al menos una combinación disponible con precio mayor a cero.';
    }

    const waitlistWithoutMessage = priceMatrix.some(
      (combination) =>
        combination.disponible &&
        combination.accionAgotado === 'LISTA_ESPERA' &&
        combination.mensajeAgotado.trim() === ''
    );

    if (waitlistWithoutMessage) {
      return 'Indica un mensaje para las combinaciones que habiliten lista de espera.';
    }

    return null;
  };

  const toPayload = (status: EventStatus): AdminEventPayload => {
    const payloadProfiles = buyerProfiles
      .filter((profile) => profile.nombre.trim() !== '')
      .map((profile) => ({
        id: profile.id,
        nombre: profile.nombre,
        descripcion: profile.descripcion.trim() || undefined,
      }));

    const payloadSectors = ticketSectors
      .filter((sector) => sector.nombre.trim() !== '' && Number(sector.capacidad) > 0)
      .map((sector) => ({
        id: sector.id,
        nombre: sector.nombre,
        capacidad: Number(sector.capacidad) || 0,
        accesibilidad: {
          sillaRuedas: sector.accesibilidad.sillaRuedas,
          acompaniamientoPermitido: sector.accesibilidad.acompaniamientoPermitido,
          acompaniamientoObligatorio: sector.accesibilidad.acompaniamientoObligatorio,
          sectorVinculadoId: sector.accesibilidad.sectorVinculadoId || undefined,
        },
      }));

    const payloadPhases = ticketPhases
      .filter(
        (phase) =>
          phase.nombre.trim() !== '' &&
          phase.fechaInicio !== '' &&
          phase.fechaFin !== '' &&
          new Date(phase.fechaFin) > new Date(phase.fechaInicio)
      )
      .map((phase) => ({
        id: phase.id,
        nombre: phase.nombre,
        fechaInicio: phase.fechaInicio,
        fechaFin: phase.fechaFin,
        visibilidad: phase.visibilidad,
        bloqueadoHasta:
          phase.visibilidad === 'BLOQUEADO' ? phase.bloqueadoHasta || undefined : undefined,
        estado: phase.estado,
      }));

    const payloadPrices = priceMatrix
      .filter(
        (combination) =>
          payloadSectors.some((sector) => sector.id === combination.sectorId) &&
          payloadProfiles.some((profile) => profile.id === combination.perfilId) &&
          payloadPhases.some((phase) => phase.id === combination.faseId)
      )
      .map((combination) => ({
        id: combination.id,
        sectorId: combination.sectorId,
        perfilId: combination.perfilId,
        faseId: combination.faseId,
        disponible: combination.disponible,
        precio: Number(combination.precio) || 0,
        accionAgotado: combination.accionAgotado,
        mensajeAgotado: combination.mensajeAgotado.trim() || undefined,
      }));

    const payloadCoupons = coupons
      .filter((coupon) => coupon.codigo.trim() !== '' && Number(coupon.valor) > 0)
      .map((coupon) => ({
        id: coupon.id,
        codigo: coupon.codigo,
        tipo: coupon.tipo,
        valor: Number(coupon.valor) || 0,
        requisito: coupon.requisito.trim() || undefined,
        descripcion: coupon.descripcion.trim() || undefined,
      }));

    return {
      titulo: formState.titulo,
      descripcion: formState.descripcion,
      lugar: formState.lugar,
      fechaHoraInicio: formState.fechaHoraInicio,
      fechaHoraFin: formState.fechaHoraFin,
      idOrganizador: formState.idOrganizador,
      idCategoria: formState.idCategoria,
      estado: status,
      like: 0,
      noInteres: 0,
      comentario: [],
      moneda: 'PEN',
      impuestos: {
        tipo: formState.impuestos.tipo,
        valor: Number(formState.impuestos.valor) || 0,
      },
      comisiones: {
        tipo: formState.comisiones.tipo,
        valor: Number(formState.comisiones.valor) || 0,
      },
      perfilesComprador: payloadProfiles,
      sectores: payloadSectors,
      fases: payloadPhases,
      precios: payloadPrices,
      cupones: payloadCoupons,
      imagenDestacada: undefined,
    };
  };
  const handleSave = async (status: EventStatus): Promise<void> => {
    hideAlert();

    const validationMessage = validateForm();

    if (validationMessage !== null) {
      showAlert({ type: 'error', text: validationMessage });

      return;
    }

    setLoading(true);

    const payload: AdminEventPayload = toPayload(status);

    try {
      const created = await adminEventApi.createEvent(payload);

      setEvents((prev) => [created, ...prev]);
      showAlert({
        type: 'success',
        text:
          status === 'PUBLICADO'
            ? 'Evento publicado correctamente para organizadores.'
            : 'Borrador guardado. Podrás continuar editando cuando lo necesites.',
      });
      resetForm();
    } catch {
      showAlert({
        type: 'error',
        text: 'No pudimos guardar el evento. Intenta nuevamente en unos minutos.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (idEvento: number, status: EventStatus): Promise<void> => {
    setLoading(true);

    try {
      const updated = await adminEventApi.updateEventStatus(idEvento, status);

      if (updated === null) {
        showAlert({ type: 'error', text: 'El evento ya no existe en la bandeja.' });
      } else {
        setEvents((prev) => prev.map((event) => (event.idEvento === idEvento ? updated : event)));
        showAlert({ type: 'success', text: `Estado actualizado a ${eventStatusLabels[status]}.` });
      }
    } catch {
      showAlert({ type: 'error', text: 'No se pudo actualizar el estado. Inténtalo nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  const previewStatus: EventStatus = 'BORRADOR';
  return (
    <div className='admin-event-grid organizer-grid'>
      <div>
        <div className='admin-card'>
          <Heading type={3} color='white' text='Información general' />
          <p className='gray'>Define la información base del evento y su responsable.</p>
          <div className='admin-field'>
            <label htmlFor='titulo'>Título del evento</label>
            <Input
              type='text'
              name='titulo'
              value={formState.titulo}
              maxLength={120}
              placeholder='Ej: Festival de verano Nexivent'
              required
              onChange={handleGeneralInputChange}
            />
          </div>
          <div className='admin-field'>
            <label htmlFor='descripcion'>Descripción</label>
            <textarea
              id='descripcion'
              name='descripcion'
              value={formState.descripcion}
              onChange={handleGeneralInputChange}
              className='admin-input'
              placeholder='Describe la experiencia, beneficios y servicios.'
              rows={6}
            />
          </div>
          <div className='admin-field'>
            <label htmlFor='lugar'>Lugar</label>
            <Input
              type='text'
              name='lugar'
              value={formState.lugar}
              maxLength={140}
              placeholder='Ingresa el recinto o dirección del evento'
              required
              onChange={handleGeneralInputChange}
            />
          </div>
          <div className='admin-field admin-field-grid'>
            <div>
              <label htmlFor='idOrganizador'>Organizador</label>
              <select
                id='idOrganizador'
                name='idOrganizador'
                className='select admin-select'
                value={formState.idOrganizador}
                onChange={handleGeneralSelectChange}
              >
                {organizers.map((organizer) => (
                  <option key={organizer.idOrganizador} value={organizer.idOrganizador}>
                    {organizer.nombre} · {organizer.contacto}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor='idCategoria'>Categoría principal</label>
              <select
                id='idCategoria'
                name='idCategoria'
                className='select admin-select'
                value={formState.idCategoria}
                onChange={handleGeneralSelectChange}
              >
                {eventCategories.map((category) => (
                  <option key={category.idCategoria} value={category.idCategoria}>
                    {category.nombre} · {category.descripcion}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className='admin-field admin-field-grid'>
            <div>
              <label htmlFor='fechaHoraInicio'>Inicio</label>
              <input
                id='fechaHoraInicio'
                name='fechaHoraInicio'
                type='datetime-local'
                className='input-text admin-input'
                value={formState.fechaHoraInicio}
                onChange={handleGeneralInputChange}
              />
            </div>
            <div>
              <label htmlFor='fechaHoraFin'>Fin</label>
              <input
                id='fechaHoraFin'
                name='fechaHoraFin'
                type='datetime-local'
                className='input-text admin-input'
                value={formState.fechaHoraFin}
                onChange={handleGeneralInputChange}
              />
            </div>
          </div>
          <div className='admin-field admin-field-grid organizer-adjustments'>
            <div>
              <label>Moneda</label>
              <div className='admin-input readonly'>PEN · Sol peruano</div>
              <small className='gray'>Los eventos de Nexivent se cobran siempre en soles.</small>
            </div>
            <div>
              <label>Impuestos</label>
              <div className='admin-field-grid organizer-adjustment-controls'>
                <select
                  value={formState.impuestos.tipo}
                  onChange={(event) => {
                    handleAdjustmentChange('impuestos', 'tipo', event.target.value);
                  }}
                  className='select admin-select'
                >
                  {Object.entries(adjustmentLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  type='number'
                  min='0'
                  className='input-text admin-input'
                  value={formState.impuestos.valor}
                  onChange={(event) => {
                    handleAdjustmentChange('impuestos', 'valor', event.target.value);
                  }}
                  placeholder={formState.impuestos.tipo === 'PORCENTAJE' ? 'Ej: 18' : 'Ej: 5.90'}
                />
              </div>
            </div>
            <div>
              <label>Comisiones y fees</label>
              <div className='admin-field-grid organizer-adjustment-controls'>
                <select
                  value={formState.comisiones.tipo}
                  onChange={(event) => {
                    handleAdjustmentChange('comisiones', 'tipo', event.target.value);
                  }}
                  className='select admin-select'
                >
                  {Object.entries(adjustmentLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  type='number'
                  min='0'
                  className='input-text admin-input'
                  value={formState.comisiones.valor}
                  onChange={(event) => {
                    handleAdjustmentChange('comisiones', 'valor', event.target.value);
                  }}
                  placeholder={formState.comisiones.tipo === 'PORCENTAJE' ? 'Ej: 7' : 'Ej: 12.50'}
                />
              </div>
            </div>
          </div>
        </div>

        <div className='admin-card'>
          <Heading type={3} color='white' text='Perfiles de comprador' />
          <p className='gray'>Configura los perfiles admitidos (debe existir al menos uno).</p>
          <div className='organizer-collection'>
            {buyerProfiles.map((profile) => (
              <div key={profile.id} className='organizer-collection-card'>
                <div className='organizer-collection-header'>
                  <strong>Perfil</strong>
                  <button
                    type='button'
                    className='icon-button'
                    onClick={() => {
                      removeBuyerProfile(profile.id);
                    }}
                    disabled={buyerProfiles.length === 1}
                    title='Eliminar perfil'
                  >
                    <span className='material-symbols-outlined'>delete</span>
                  </button>
                </div>
                <div className='organizer-collection-grid'>
                  <div>
                    <label htmlFor={`perfil-nombre-${profile.id}`}>Nombre</label>
                    <input
                      id={`perfil-nombre-${profile.id}`}
                      type='text'
                      className='input-text admin-input'
                      value={profile.nombre}
                      onChange={(event) => {
                        handleBuyerProfileChange(profile.id, 'nombre', event.target.value);
                      }}
                      placeholder='Ej: Adulto, Niño, CONADIS'
                    />
                  </div>
                  <div>
                    <label htmlFor={`perfil-descripcion-${profile.id}`}>Descripción interna</label>
                    <input
                      id={`perfil-descripcion-${profile.id}`}
                      type='text'
                      className='input-text admin-input'
                      value={profile.descripcion}
                      onChange={(event) => {
                        handleBuyerProfileChange(profile.id, 'descripcion', event.target.value);
                      }}
                      placeholder='Requisitos o notas operativas'
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type='button' className='button gray-outline' onClick={addBuyerProfile}>
            <span className='material-symbols-outlined left-icon'>add</span>
            Agregar perfil
          </button>
        </div>

        <div className='admin-card'>
          <Heading type={3} color='white' text='Sectores del evento' />
          <p className='gray'>Determina el aforo y accesibilidad de cada sector disponible.</p>
          <div className='organizer-collection'>
            {ticketSectors.map((sector) => (
              <div key={sector.id} className='organizer-collection-card'>
                <div className='organizer-collection-header'>
                  <strong>Sector</strong>
                  <button
                    type='button'
                    className='icon-button'
                    onClick={() => {
                      removeSector(sector.id);
                    }}
                    disabled={ticketSectors.length === 1}
                    title='Eliminar sector'
                  >
                    <span className='material-symbols-outlined'>delete</span>
                  </button>
                </div>
                <div className='organizer-collection-grid organizer-sector-grid'>
                  <div>
                    <label htmlFor={`sector-nombre-${sector.id}`}>Nombre</label>
                    <input
                      id={`sector-nombre-${sector.id}`}
                      type='text'
                      className='input-text admin-input'
                      value={sector.nombre}
                      onChange={(event) => {
                        handleSectorChange(sector.id, 'nombre', event.target.value);
                      }}
                      placeholder='Ej: VIP, Platea, Campo'
                    />
                  </div>
                  <div>
                    <label htmlFor={`sector-capacidad-${sector.id}`}>Capacidad</label>
                    <input
                      id={`sector-capacidad-${sector.id}`}
                      type='number'
                      min='0'
                      className='input-text admin-input'
                      value={sector.capacidad}
                      onChange={(event) => {
                        handleSectorChange(sector.id, 'capacidad', event.target.value);
                      }}
                      placeholder='Ej: 500'
                    />
                  </div>
                  <div>
                    <label htmlFor={`sector-vinculo-${sector.id}`}>Sector vinculado</label>
                    <select
                      id={`sector-vinculo-${sector.id}`}
                      className='select admin-select'
                      value={sector.accesibilidad.sectorVinculadoId}
                      onChange={(event) => {
                        handleSectorAccessibilityChange(
                          sector.id,
                          'sectorVinculadoId',
                          event.target.value
                        );
                      }}
                    >
                      <option value=''>Sin vincular</option>
                      {ticketSectors
                        .filter((current) => current.id !== sector.id)
                        .map((current) => (
                          <option key={current.id} value={current.id}>
                            {current.nombre || 'Sector'}
                          </option>
                        ))}
                    </select>
                    <small className='gray'>Ideal para acompañantes o cupos compartidos.</small>
                  </div>
                </div>
                <div className='organizer-accessibility'>
                  <label>Accesibilidad</label>
                  <div className='organizer-accessibility-controls'>
                    <label className='organizer-checkbox'>
                      <input
                        type='checkbox'
                        checked={sector.accesibilidad.sillaRuedas}
                        onChange={(event) => {
                          handleSectorAccessibilityChange(
                            sector.id,
                            'sillaRuedas',
                            event.target.checked
                          );
                        }}
                      />
                      <span>Espacios para silla de ruedas</span>
                    </label>
                    <label className='organizer-checkbox'>
                      <input
                        type='checkbox'
                        checked={sector.accesibilidad.acompaniamientoPermitido}
                        onChange={(event) => {
                          handleSectorAccessibilityChange(
                            sector.id,
                            'acompaniamientoPermitido',
                            event.target.checked
                          );
                        }}
                      />
                      <span>Acompañante permitido</span>
                    </label>
                    <label className='organizer-checkbox'>
                      <input
                        type='checkbox'
                        checked={sector.accesibilidad.acompaniamientoObligatorio}
                        onChange={(event) => {
                          handleSectorAccessibilityChange(
                            sector.id,
                            'acompaniamientoObligatorio',
                            event.target.checked
                          );
                        }}
                      />
                      <span>Acompañante obligatorio</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type='button' className='button gray-outline' onClick={addSector}>
            <span className='material-symbols-outlined left-icon'>add_business</span>
            Agregar sector
          </button>
        </div>

        <div className='admin-card'>
          <Heading type={3} color='white' text='Fases y tipos de ticket' />
          <p className='gray'>Define los tipos de tickets y su vigencia sin solaparse.</p>
          <div className='organizer-collection'>
            {ticketPhases.map((phase) => (
              <div key={phase.id} className='organizer-collection-card'>
                <div className='organizer-collection-header'>
                  <strong>{phase.nombre || 'Nueva fase'}</strong>
                  <div className='organizer-phase-actions'>
                    <button
                      type='button'
                      className='icon-button'
                      onClick={() => {
                        setTicketPhases((prev) => [...prev, { ...phase, id: generateId() }]);
                      }}
                      title='Duplicar fase'
                    >
                      <span className='material-symbols-outlined'>content_copy</span>
                    </button>
                    <button
                      type='button'
                      className='icon-button'
                      onClick={() => {
                        removePhase(phase.id);
                      }}
                      disabled={ticketPhases.length === 1}
                      title='Eliminar fase'
                    >
                      <span className='material-symbols-outlined'>delete</span>
                    </button>
                  </div>
                </div>
                <div className='organizer-collection-grid organizer-phase-grid'>
                  <div>
                    <label htmlFor={`fase-nombre-${phase.id}`}>Nombre</label>
                    <input
                      id={`fase-nombre-${phase.id}`}
                      type='text'
                      className='input-text admin-input'
                      value={phase.nombre}
                      onChange={(event) => {
                        handlePhaseChange(phase.id, 'nombre', event.target.value);
                      }}
                      placeholder='Ej: Preventa, Regular, Último minuto'
                    />
                  </div>
                  <div>
                    <label htmlFor={`fase-estado-${phase.id}`}>Estado</label>
                    <select
                      id={`fase-estado-${phase.id}`}
                      className='select admin-select'
                      value={phase.estado}
                      onChange={(event) => {
                        handlePhaseSelectChange(
                          phase.id,
                          'estado',
                          event.target.value as TicketPhaseStatus
                        );
                      }}
                    >
                      {Object.entries(phaseStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`fase-visibilidad-${phase.id}`}>Visibilidad</label>
                    <select
                      id={`fase-visibilidad-${phase.id}`}
                      className='select admin-select'
                      value={phase.visibilidad}
                      onChange={(event) => {
                        handlePhaseSelectChange(
                          phase.id,
                          'visibilidad',
                          event.target.value as TicketPhaseVisibility
                        );
                      }}
                    >
                      {Object.entries(visibilityLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className='organizer-collection-grid organizer-phase-grid'>
                  <div>
                    <label htmlFor={`fase-inicio-${phase.id}`}>Desde</label>
                    <input
                      id={`fase-inicio-${phase.id}`}
                      type='datetime-local'
                      className='input-text admin-input'
                      value={phase.fechaInicio}
                      onChange={(event) => {
                        handlePhaseChange(phase.id, 'fechaInicio', event.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor={`fase-fin-${phase.id}`}>Hasta</label>
                    <input
                      id={`fase-fin-${phase.id}`}
                      type='datetime-local'
                      className='input-text admin-input'
                      value={phase.fechaFin}
                      onChange={(event) => {
                        handlePhaseChange(phase.id, 'fechaFin', event.target.value);
                      }}
                    />
                  </div>
                  {phase.visibilidad === 'BLOQUEADO' ? (
                    <div>
                      <label htmlFor={`fase-bloqueo-${phase.id}`}>Bloqueado hasta</label>
                      <input
                        id={`fase-bloqueo-${phase.id}`}
                        type='datetime-local'
                        className='input-text admin-input'
                        value={phase.bloqueadoHasta}
                        onChange={(event) => {
                          handlePhaseChange(phase.id, 'bloqueadoHasta', event.target.value);
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <button type='button' className='button gray-outline' onClick={addPhase}>
            <span className='material-symbols-outlined left-icon'>add_alarm</span>
            Agregar fase
          </button>
        </div>
        <div className='admin-card'>
          <Heading type={3} color='white' text='Matriz de precios' />
          <p className='gray'>
            Asigna precios por sector, perfil y fase. Marca combinaciones como no disponibles cuando
            corresponda.
          </p>
          <div className='organizer-template-controls'>
            <div>
              <label>Plantilla seleccionada</label>
              <div className='organizer-template-actions'>
                <select
                  value={templateCombinationId ?? ''}
                  onChange={(event) => {
                    setTemplateCombinationId(event.target.value || null);
                  }}
                  className='select admin-select'
                >
                  <option value=''>Sin plantilla</option>
                  {pricePreview.map((combination) => (
                    <option key={combination.id} value={combination.id}>
                      {`${combination.sectorNombre} · ${combination.perfilNombre} · ${combination.faseNombre}`}
                    </option>
                  ))}
                </select>
                <div className='organizer-template-buttons'>
                  <button
                    type='button'
                    className='button gray-outline'
                    onClick={() => applyTemplate('ALL')}
                  >
                    Aplicar a todos
                  </button>
                  <button
                    type='button'
                    className='button gray-outline'
                    onClick={() => applyTemplate('SECTOR')}
                  >
                    Mismo sector
                  </button>
                  <button
                    type='button'
                    className='button gray-outline'
                    onClick={() => applyTemplate('PERFIL')}
                  >
                    Mismo perfil
                  </button>
                  <button
                    type='button'
                    className='button gray-outline'
                    onClick={() => applyTemplate('FASE')}
                  >
                    Misma fase
                  </button>
                </div>
              </div>
            </div>
            <div className='organizer-import-export'>
              <button type='button' className='button gray-outline' onClick={exportMatrix}>
                <span className='material-symbols-outlined left-icon'>download</span>
                Exportar CSV
              </button>
              <label className='button gray-outline organizer-import-label'>
                <span className='material-symbols-outlined left-icon'>upload</span>
                Importar CSV
                <input type='file' accept='.csv' onChange={importMatrix} />
              </label>
            </div>
          </div>
          {priceMatrix.length === 0 ? (
            <p className='organizer-empty'>
              Crea perfiles, sectores y fases válidos para generar la matriz.
            </p>
          ) : (
            <div className='organizer-matrix'>
              {pricePreview.map((combination) => (
                <div key={combination.id} className='organizer-matrix-row'>
                  <div className='organizer-matrix-header'>
                    <span className='organizer-pill'>{combination.sectorNombre}</span>
                    <span className='organizer-pill'>{combination.perfilNombre}</span>
                    <span className='organizer-pill'>{combination.faseNombre}</span>
                  </div>
                  <div className='organizer-matrix-body'>
                    <div>
                      <label htmlFor={`precio-${combination.id}`}>Precio base (PEN)</label>
                      <input
                        id={`precio-${combination.id}`}
                        type='number'
                        min='0'
                        className='input-text admin-input'
                        value={combination.precio}
                        onChange={(event) => {
                          handlePriceDraftChange(combination.id, 'precio', event.target.value);
                        }}
                        disabled={!combination.disponible}
                        placeholder='Ej: 150.00'
                      />
                    </div>
                    <div>
                      <label>Disponibilidad</label>
                      <div className='organizer-toggle'>
                        <button
                          type='button'
                          className={`button ${combination.disponible ? 'yellow-filled' : 'gray-outline'}`}
                          onClick={() => {
                            handlePriceToggle(combination.id, true);
                          }}
                        >
                          Disponible
                        </button>
                        <button
                          type='button'
                          className={`button ${!combination.disponible ? 'gray-filled' : 'gray-outline'}`}
                          onClick={() => {
                            handlePriceToggle(combination.id, false);
                          }}
                        >
                          No disponible
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor={`agotado-${combination.id}`}>Acción al agotar stock</label>
                      <select
                        id={`agotado-${combination.id}`}
                        className='select admin-select'
                        value={combination.accionAgotado}
                        onChange={(event) => {
                          handleSoldOutActionChange(
                            combination.id,
                            event.target.value as SoldOutAction
                          );
                        }}
                      >
                        {Object.entries(soldOutActionLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`mensaje-agotado-${combination.id}`}>
                        Mensaje por agotamiento
                      </label>
                      <input
                        id={`mensaje-agotado-${combination.id}`}
                        type='text'
                        className='input-text admin-input'
                        value={combination.mensajeAgotado}
                        onChange={(event) => {
                          handlePriceDraftChange(
                            combination.id,
                            'mensajeAgotado',
                            event.target.value
                          );
                        }}
                        placeholder='Ej: Únete a la lista de espera completando tus datos.'
                      />
                    </div>
                    <div>
                      <label>Precio final estimado</label>
                      <div className='admin-input readonly'>
                        {combination.disponible
                          ? `PEN ${combination.finalPrice.toFixed(2)}`
                          : 'No disponible'}
                      </div>
                      <small className='gray'>Incluye impuestos y comisiones configuradas.</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='admin-card'>
          <Heading type={3} color='white' text='Cupones y descuentos' />
          <p className='gray'>
            Gestiona promociones con requisitos específicos (porcentaje o monto fijo).
          </p>
          {coupons.length === 0 ? (
            <p className='organizer-empty'>No hay cupones configurados por el momento.</p>
          ) : (
            <div className='organizer-collection'>
              {coupons.map((coupon) => (
                <div key={coupon.id} className='organizer-collection-card'>
                  <div className='organizer-collection-header'>
                    <strong>Cupón</strong>
                    <button
                      type='button'
                      className='icon-button'
                      onClick={() => {
                        removeCoupon(coupon.id);
                      }}
                      title='Eliminar cupón'
                    >
                      <span className='material-symbols-outlined'>delete</span>
                    </button>
                  </div>
                  <div className='organizer-collection-grid organizer-coupon-grid'>
                    <div>
                      <label htmlFor={`cupon-codigo-${coupon.id}`}>Código</label>
                      <input
                        id={`cupon-codigo-${coupon.id}`}
                        type='text'
                        className='input-text admin-input'
                        value={coupon.codigo}
                        onChange={(event) => {
                          handleCouponChange(coupon.id, 'codigo', event.target.value.toUpperCase());
                        }}
                        placeholder='Ej: CONADIS50'
                      />
                    </div>
                    <div>
                      <label htmlFor={`cupon-tipo-${coupon.id}`}>Tipo de descuento</label>
                      <select
                        id={`cupon-tipo-${coupon.id}`}
                        className='select admin-select'
                        value={coupon.tipo}
                        onChange={(event) => {
                          handleCouponChange(
                            coupon.id,
                            'tipo',
                            event.target.value as CouponDraft['tipo']
                          );
                        }}
                      >
                        <option value='PORCENTAJE'>Porcentaje</option>
                        <option value='FIJO'>Monto fijo</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`cupon-valor-${coupon.id}`}>
                        {coupon.tipo === 'PORCENTAJE' ? 'Porcentaje %' : 'Monto PEN'}
                      </label>
                      <input
                        id={`cupon-valor-${coupon.id}`}
                        type='number'
                        min='0'
                        className='input-text admin-input'
                        value={coupon.valor}
                        onChange={(event) => {
                          handleCouponChange(coupon.id, 'valor', event.target.value);
                        }}
                        placeholder={coupon.tipo === 'PORCENTAJE' ? 'Ej: 50' : 'Ej: 30.00'}
                      />
                    </div>
                    <div>
                      <label htmlFor={`cupon-requisito-${coupon.id}`}>Requisito</label>
                      <input
                        id={`cupon-requisito-${coupon.id}`}
                        type='text'
                        className='input-text admin-input'
                        value={coupon.requisito}
                        onChange={(event) => {
                          handleCouponChange(coupon.id, 'requisito', event.target.value);
                        }}
                        placeholder='Ej: Presentar documento CONADIS'
                      />
                    </div>
                    <div>
                      <label htmlFor={`cupon-descripcion-${coupon.id}`}>Descripción interna</label>
                      <input
                        id={`cupon-descripcion-${coupon.id}`}
                        type='text'
                        className='input-text admin-input'
                        value={coupon.descripcion}
                        onChange={(event) => {
                          handleCouponChange(coupon.id, 'descripcion', event.target.value);
                        }}
                        placeholder='Visible para el equipo operativo'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button type='button' className='button gray-outline' onClick={addCoupon}>
            <span className='material-symbols-outlined left-icon'>confirmation_number</span>
            Agregar cupón
          </button>
        </div>

        <div className='admin-actions'>
          <button
            type='button'
            className='button gray-overlay'
            disabled={loading}
            onClick={() => {
              handleSave('BORRADOR').catch(() => {});
            }}
          >
            <span className='material-symbols-outlined left-icon'>draft</span>
            Guardar borrador
          </button>
          <button
            type='button'
            className='button yellow-filled'
            disabled={loading}
            onClick={() => {
              handleSave('PUBLICADO').catch(() => {});
            }}
          >
            {loading ? (
              <span className='material-symbols-outlined left-icon'>hourglass_top</span>
            ) : (
              <span className='material-symbols-outlined left-icon'>rocket_launch</span>
            )}
            Publicar evento
          </button>
        </div>
      </div>
      <div className='admin-preview-column'>
        <div className='admin-card sticky'>
          <Heading type={4} color='white' text='Vista previa para asistentes' />
          <div className='admin-preview-card'>
            <div className='admin-preview-card__header'>
              <span className={`admin-status admin-status--${previewStatus.toLowerCase()}`}>
                {eventStatusLabels[previewStatus]}
              </span>
              <span className='admin-preview-card__category'>
                {eventCategories.find((category) => category.idCategoria === formState.idCategoria)
                  ?.nombre ?? ''}
              </span>
            </div>
            <h3>{formState.titulo !== '' ? formState.titulo : 'Nuevo evento Nexivent'}</h3>
            <p className='admin-preview-card__location'>
              <span className='material-symbols-outlined'>location_on</span>
              {formState.lugar !== '' ? formState.lugar : 'Por confirmar'}
            </p>
            <p className='admin-preview-card__datetime'>
              <span className='material-symbols-outlined'>event</span>
              {formatDateTimePreview(formState.fechaHoraInicio)}
              <span className='admin-preview-card__separator'>→</span>
              {formatDateTimePreview(formState.fechaHoraFin)}
            </p>
            <p className='admin-preview-card__description'>
              {formState.descripcion !== ''
                ? formState.descripcion
                : 'Comparte aquí los highlights del evento, servicios incluidos y horarios especiales.'}
            </p>
            <div className='organizer-preview-section'>
              <h4>Perfiles y sectores</h4>
              <p className='gray'>
                Capacidad total planificada: {totalCapacity.toLocaleString('es-PE')}
              </p>
              <ul>
                {ticketSectors.map((sector) => (
                  <li key={sector.id}>
                    {sector.nombre || 'Sector'} · {Number(sector.capacidad) || 0} lugares ·{' '}
                    {sector.accesibilidad.sillaRuedas ? '♿' : '—'} accesible
                  </li>
                ))}
              </ul>
              <ul>
                {buyerProfiles.map((profile) => (
                  <li key={profile.id}>
                    {profile.nombre || 'Perfil'}
                    {profile.descripcion ? ` · ${profile.descripcion}` : ''}
                  </li>
                ))}
              </ul>
            </div>
            <div className='organizer-preview-section'>
              <h4>Fases activas</h4>
              <ul>
                {ticketPhases.map((phase) => (
                  <li key={phase.id}>
                    <strong>{phase.nombre || 'Fase'}</strong> · {phaseStatusLabels[phase.estado]} ·{' '}
                    {visibilityLabels[phase.visibilidad]}
                    <br />
                    {formatDateTimePreview(phase.fechaInicio)} →{' '}
                    {formatDateTimePreview(phase.fechaFin)}
                  </li>
                ))}
              </ul>
            </div>
            <div className='admin-preview-card__tickets organizer-preview-table'>
              <table>
                <thead>
                  <tr>
                    <th>Sector</th>
                    <th>Perfil</th>
                    <th>Fase</th>
                    <th>Base</th>
                    <th>Final</th>
                    <th>Acción agotado</th>
                  </tr>
                </thead>
                <tbody>
                  {pricePreview.map((combination) => (
                    <tr key={combination.id}>
                      <td>{combination.sectorNombre}</td>
                      <td>{combination.perfilNombre}</td>
                      <td>{combination.faseNombre}</td>
                      <td>
                        {combination.disponible
                          ? `PEN ${(Number(combination.precio) || 0).toFixed(2)}`
                          : '—'}
                      </td>
                      <td>
                        {combination.disponible
                          ? `PEN ${combination.finalPrice.toFixed(2)}`
                          : 'No disponible'}
                      </td>
                      <td>{soldOutActionLabels[combination.accionAgotado]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className='organizer-preview-section'>
              <h4>Cupones habilitados</h4>
              {coupons.length === 0 ? (
                <p className='gray'>Sin descuentos activos.</p>
              ) : (
                <ul>
                  {coupons.map((coupon) => (
                    <li key={coupon.id}>
                      <strong>{coupon.codigo}</strong> ·{' '}
                      {coupon.tipo === 'PORCENTAJE' ? `${coupon.valor}%` : `PEN ${coupon.valor}`}
                      {coupon.requisito ? ` · ${coupon.requisito}` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className='admin-card'>
          <Heading type={4} color='white' text='Eventos en gestión' />
          <p className='gray'>
            Supervisa el estado actual y actúa rápidamente sobre los eventos existentes.
          </p>
          <ul className='admin-event-list'>
            {events.map((event) => (
              <li key={event.idEvento} className='admin-event-list__item'>
                <div>
                  <p className='admin-event-list__title'>{event.titulo}</p>
                  <p className='admin-event-list__meta'>
                    {formatDateTimePreview(event.fechaHoraInicio)} · {event.lugar}
                  </p>
                  <p className='admin-event-list__meta'>
                    {event.sectores.length} sectores · {event.perfilesComprador.length} perfiles ·{' '}
                    {event.fases.length} fases
                  </p>
                </div>
                <div className='admin-event-list__actions'>
                  <span className={`admin-status admin-status--${event.estado.toLowerCase()}`}>
                    {eventStatusLabels[event.estado]}
                  </span>
                  <button
                    type='button'
                    className='button gray-outline'
                    onClick={() => {
                      handleStatusUpdate(
                        event.idEvento,
                        event.estado === 'PUBLICADO' ? 'BORRADOR' : 'PUBLICADO'
                      ).catch(() => {});
                    }}
                  >
                    {event.estado === 'PUBLICADO' ? 'Pasar a borrador' : 'Publicar'}
                  </button>
                  <button
                    type='button'
                    className='button gray-outline'
                    onClick={() => {
                      handleStatusUpdate(event.idEvento, 'CANCELADO').catch(() => {});
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EventCreator;
