'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FC } from 'react';

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
  type AdminEvent,
  type AdminEventPayload,
  type DiscountType,
  type EventStatus,
  type TicketPhaseState,
} from '@utils/organizers/events';

interface EventFormState {
  titulo: string;
  descripcion: string;
  lugar: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  idOrganizador: number;
  idCategoria: number;
}

interface BuyerProfileDraft {
  id: string;
  name: string;
  description: string;
}

interface TicketSectorDraft {
  id: string;
  name: string;
  capacity: string;
}

interface PhaseCombinationDraft {
  id: string;
  sectorId: string;
  profileId: string;
  basePrice: string;
  allocation: string;
}

interface TicketPhaseDraft {
  id: string;
  name: string;
  ticketType: string;
  startDate: string;
  endDate: string;
  state: TicketPhaseState;
  combinations: PhaseCombinationDraft[];
}

interface DiscountDraft {
  id: string;
  code: string;
  type: DiscountType;
  value: string;
  limitPerUser: string;
  isActive: boolean;
}

interface TaxConfigDraft {
  taxType: DiscountType;
  taxValue: string;
  feeType: DiscountType;
  feeValue: string;
}

interface PhaseTemplate {
  id: string;
  name: string;
  ticketType: string;
  state: TicketPhaseState;
  combinations: Array<{
    sectorName: string;
    profileName: string;
    basePrice: string;
    allocation: string;
  }>;
}

const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const createBuyerProfileDraft = (name = ''): BuyerProfileDraft => ({
  id: generateId(),
  name,
  description: '',
});

const createTicketSectorDraft = (name = ''): TicketSectorDraft => ({
  id: generateId(),
  name,
  capacity: '',
});

const createCombinationDraft = (sectorId: string, profileId: string): PhaseCombinationDraft => ({
  id: `${sectorId}-${profileId}-${generateId()}`,
  sectorId,
  profileId,
  basePrice: '',
  allocation: '',
});

const createTicketPhaseDraft = (
  buyerProfiles: BuyerProfileDraft[],
  ticketSectors: TicketSectorDraft[]
): TicketPhaseDraft => ({
  id: generateId(),
  name: 'Nueva fase',
  ticketType: '',
  startDate: '',
  endDate: '',
  state: 'BORRADOR',
  combinations: ticketSectors.flatMap((sector) =>
    buyerProfiles.map((profile) => createCombinationDraft(sector.id, profile.id))
  ),
});

const createDiscountDraft = (): DiscountDraft => ({
  id: generateId(),
  code: '',
  type: 'PORCENTAJE',
  value: '',
  limitPerUser: '',
  isActive: true,
});

const defaultTaxConfig = (): TaxConfigDraft => ({
  taxType: 'PORCENTAJE',
  taxValue: '18',
  feeType: 'PORCENTAJE',
  feeValue: '6',
});

const statusLabels: Record<EventStatus, string> = {
  BORRADOR: 'Borrador',
  PUBLICADO: 'Publicado',
  CANCELADO: 'Cancelado',
};

const phaseStateLabels: Record<TicketPhaseState, string> = {
  BORRADOR: 'Borrador',
  ACTIVO: 'Activo',
  PAUSADO: 'Pausado',
  AGOTADO: 'Agotado',
  FINALIZADO: 'Finalizado',
};

const calculateFinalPrice = (basePrice: number, taxConfig: TaxConfigDraft): number => {
  if (Number.isNaN(basePrice)) {
    return 0;
  }

  const taxValue = Number(taxConfig.taxValue) || 0;
  const feeValue = Number(taxConfig.feeValue) || 0;

  const taxAmount = taxConfig.taxType === 'PORCENTAJE' ? (basePrice * taxValue) / 100 : taxValue;

  const feeAmount = taxConfig.feeType === 'PORCENTAJE' ? (basePrice * feeValue) / 100 : feeValue;

  return basePrice + taxAmount + feeAmount;
};

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
  }));
  const [buyerProfiles, setBuyerProfiles] = useState<BuyerProfileDraft[]>(() => [
    createBuyerProfileDraft('Adulto'),
  ]);
  const [ticketSectors, setTicketSectors] = useState<TicketSectorDraft[]>(() => [
    createTicketSectorDraft('General'),
  ]);
  const [ticketPhases, setTicketPhases] = useState<TicketPhaseDraft[]>(() => {
    const profile = createBuyerProfileDraft('Adulto');
    const sector = createTicketSectorDraft('General');

    return [createTicketPhaseDraft([profile], [sector])];
  });
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [discounts, setDiscounts] = useState<DiscountDraft[]>(() => []);
  const [taxConfig, setTaxConfig] = useState<TaxConfigDraft>(() => defaultTaxConfig());
  const [phaseTemplates, setPhaseTemplates] = useState<PhaseTemplate[]>([]);

  useEffect(() => {
    const fetchEvents = async (): Promise<void> => {
      const data = await adminEventApi.listEvents();

      setEvents(data);
    };

    void fetchEvents();
  }, []);

  useEffect(() => {
    setTicketPhases((prev) => {
      return prev.map((phase) => {
        const existingMap = new Map(
          phase.combinations.map((combination) => [
            `${combination.sectorId}-${combination.profileId}`,
            combination,
          ])
        );

        const updatedCombinations: PhaseCombinationDraft[] = [];

        ticketSectors.forEach((sector) => {
          buyerProfiles.forEach((profile) => {
            const key = `${sector.id}-${profile.id}`;
            const current = existingMap.get(key);

            if (current !== undefined) {
              updatedCombinations.push({ ...current, sectorId: sector.id, profileId: profile.id });
            } else {
              updatedCombinations.push(createCombinationDraft(sector.id, profile.id));
            }
          });
        });

        return {
          ...phase,
          combinations: updatedCombinations,
        };
      });
    });
  }, [buyerProfiles, ticketSectors]);

  useEffect(() => {
    if (ticketPhases.length === 0) {
      setSelectedPhaseId(null);

      return;
    }

    setSelectedPhaseId((prev) => {
      if (prev === null) {
        return ticketPhases[0]?.id ?? null;
      }

      const stillExists = ticketPhases.some((phase) => phase.id === prev);

      return stillExists ? prev : (ticketPhases[0]?.id ?? null);
    });
  }, [ticketPhases]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    const { name, value } = event.target;

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const { name, value } = event.target;

    setFormState((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };
  const updateBuyerProfile = (
    profileId: string,
    field: keyof Omit<BuyerProfileDraft, 'id'>,
    value: string
  ): void => {
    setBuyerProfiles((prev) =>
      prev.map((profile) =>
        profile.id === profileId
          ? {
              ...profile,
              [field]: value,
            }
          : profile
      )
    );
  };

  const updateTicketSector = (
    sectorId: string,
    field: keyof Omit<TicketSectorDraft, 'id'>,
    value: string
  ): void => {
    setTicketSectors((prev) =>
      prev.map((sector) =>
        sector.id === sectorId
          ? {
              ...sector,
              [field]: value,
            }
          : sector
      )
    );
  };

  const updateCombination = (
    phaseId: string,
    combinationId: string,
    field: keyof Omit<PhaseCombinationDraft, 'id' | 'sectorId' | 'profileId'>,
    value: string
  ): void => {
    setTicketPhases((prev) =>
      prev.map((phase) => {
        if (phase.id !== phaseId) {
          return phase;
        }

        return {
          ...phase,
          combinations: phase.combinations.map((combination) =>
            combination.id === combinationId
              ? {
                  ...combination,
                  [field]: value,
                }
              : combination
          ),
        };
      })
    );
  };

  const updatePhase = <Key extends keyof Omit<TicketPhaseDraft, 'combinations'>>(
    phaseId: string,
    field: Key,
    value: TicketPhaseDraft[Key]
  ): void => {
    setTicketPhases((prev) =>
      prev.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              [field]: value,
            }
          : phase
      )
    );
  };

  const handleTaxConfigChange = (
    field: keyof TaxConfigDraft,
    value: string | DiscountType
  ): void => {
    setTaxConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addBuyerProfile = (): void => {
    setBuyerProfiles((prev) => [...prev, createBuyerProfileDraft()]);
  };

  const removeBuyerProfile = (profileId: string): void => {
    setBuyerProfiles((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((profile) => profile.id !== profileId);
    });
  };

  const addTicketSector = (): void => {
    setTicketSectors((prev) => [...prev, createTicketSectorDraft()]);
  };

  const removeTicketSector = (sectorId: string): void => {
    setTicketSectors((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((sector) => sector.id !== sectorId);
    });
  };

  const addPhase = (): void => {
    const newPhase = createTicketPhaseDraft(buyerProfiles, ticketSectors);

    setTicketPhases((prev) => [...prev, newPhase]);
    setSelectedPhaseId(newPhase.id);
  };

  const duplicatePhase = (phaseId: string): void => {
    const phaseToDuplicate = ticketPhases.find((phase) => phase.id === phaseId);

    if (phaseToDuplicate === undefined) {
      return;
    }

    const duplicatedPhase: TicketPhaseDraft = {
      ...phaseToDuplicate,
      id: generateId(),
      name: `${phaseToDuplicate.name} (copia)`,
      combinations: phaseToDuplicate.combinations.map((combination) => ({
        ...combination,
        id: `${combination.sectorId}-${combination.profileId}-${generateId()}`,
      })),
    };

    setTicketPhases((prev) => [...prev, duplicatedPhase]);
    setSelectedPhaseId(duplicatedPhase.id);
  };

  const removePhase = (phaseId: string): void => {
    setTicketPhases((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((phase) => phase.id !== phaseId);
    });
  };

  const addDiscount = (): void => {
    setDiscounts((prev) => [...prev, createDiscountDraft()]);
  };

  const updateDiscount = (
    discountId: string,
    field: keyof Omit<DiscountDraft, 'id'>,
    value: string | DiscountType | boolean
  ): void => {
    setDiscounts((prev) =>
      prev.map((discount) =>
        discount.id === discountId
          ? {
              ...discount,
              [field]: value,
            }
          : discount
      )
    );
  };

  const removeDiscount = (discountId: string): void => {
    setDiscounts((prev) => prev.filter((discount) => discount.id !== discountId));
  };

  const selectedPhase = useMemo(() => {
    if (selectedPhaseId === null) {
      return null;
    }

    return ticketPhases.find((phase) => phase.id === selectedPhaseId) ?? null;
  }, [selectedPhaseId, ticketPhases]);

  const combinationSummaries = useMemo(() => {
    if (selectedPhase === null) {
      return [];
    }

    return selectedPhase.combinations.map((combination) => {
      const sector = ticketSectors.find((item) => item.id === combination.sectorId);
      const profile = buyerProfiles.find((item) => item.id === combination.profileId);

      const basePriceNumber = Number(combination.basePrice) || 0;
      const allocationNumber = Number(combination.allocation) || 0;
      const finalPrice = calculateFinalPrice(basePriceNumber, taxConfig);

      return {
        ...combination,
        sectorName: sector?.name ?? 'Sector',
        profileName: profile?.name ?? 'Perfil',
        basePriceNumber,
        allocationNumber,
        finalPrice,
      };
    });
  }, [selectedPhase, ticketSectors, buyerProfiles, taxConfig]);

  const estimatedRevenue = useMemo(() => {
    return ticketPhases.reduce((eventAcc, phase) => {
      const phaseRevenue = phase.combinations.reduce((acc, combination) => {
        const basePriceNumber = Number(combination.basePrice) || 0;
        const allocationNumber = Number(combination.allocation) || 0;
        const finalPrice = calculateFinalPrice(basePriceNumber, taxConfig);

        return acc + finalPrice * allocationNumber;
      }, 0);

      return eventAcc + phaseRevenue;
    }, 0);
  }, [ticketPhases, taxConfig]);

  const totalPlannedCapacity = useMemo(() => {
    return ticketSectors.reduce((acc, sector) => acc + (Number(sector.capacity) || 0), 0);
  }, [ticketSectors]);
  const totalCombinations = useMemo(() => {
    return ticketPhases.reduce((acc, phase) => acc + phase.combinations.length, 0);
  }, [ticketPhases]);
  const activeCoupons = useMemo(() => {
    return discounts.filter((discount) => discount.isActive).length;
  }, [discounts]);
  const saveTemplateFromPhase = (phaseId: string): void => {
    const phase = ticketPhases.find((item) => item.id === phaseId);

    if (phase === undefined) {
      return;
    }

    const templateName = window.prompt(
      'Nombre de la plantilla',
      `${phase.ticketType || phase.name}`
    );

    if (templateName === null || templateName.trim() === '') {
      return;
    }

    const template: PhaseTemplate = {
      id: generateId(),
      name: templateName.trim(),
      ticketType: phase.ticketType,
      state: phase.state,
      combinations: phase.combinations.map((combination) => {
        const sectorName =
          ticketSectors.find((sector) => sector.id === combination.sectorId)?.name ?? '';
        const profileName =
          buyerProfiles.find((profile) => profile.id === combination.profileId)?.name ?? '';

        return {
          sectorName,
          profileName,
          basePrice: combination.basePrice,
          allocation: combination.allocation,
        };
      }),
    };

    setPhaseTemplates((prev) => [template, ...prev]);
    showAlert({ type: 'success', text: 'Plantilla guardada para reutilizar en próximos eventos.' });
  };

  const applyTemplateToPhase = (phaseId: string, templateId: string): void => {
    const template = phaseTemplates.find((item) => item.id === templateId);

    if (template === undefined) {
      return;
    }

    setTicketPhases((prev) =>
      prev.map((phase) => {
        if (phase.id !== phaseId) {
          return phase;
        }

        const updatedCombinations = phase.combinations.map((combination) => {
          const sectorName =
            ticketSectors.find((sector) => sector.id === combination.sectorId)?.name ?? '';
          const profileName =
            buyerProfiles.find((profile) => profile.id === combination.profileId)?.name ?? '';

          const templateCombination = template.combinations.find(
            (item) => item.sectorName === sectorName && item.profileName === profileName
          );

          if (templateCombination === undefined) {
            return combination;
          }

          return {
            ...combination,
            basePrice: templateCombination.basePrice,
            allocation: templateCombination.allocation,
          };
        });

        return {
          ...phase,
          ticketType: template.ticketType,
          state: template.state,
          combinations: updatedCombinations,
        };
      })
    );

    showAlert({
      type: 'success',
      text: 'Plantilla aplicada correctamente a la fase seleccionada.',
    });
  };

  const handleExportMatrix = (): void => {
    showAlert({
      type: 'info',
      text: 'La exportación generará un archivo CSV/Excel en la versión conectada al backend.',
    });
  };

  const handleImportMatrix = (): void => {
    showAlert({
      type: 'info',
      text: 'Podrás importar una matriz desde CSV/Excel cuando se integren los endpoints oficiales.',
    });
  };

  const validatePhaseOverlaps = (): string | null => {
    const phasesByType = new Map<string, TicketPhaseDraft[]>();

    ticketPhases.forEach((phase) => {
      const key = phase.ticketType.trim() !== '' ? phase.ticketType.trim().toLowerCase() : phase.id;
      const phases = phasesByType.get(key) ?? [];
      phases.push(phase);
      phasesByType.set(key, phases);
    });

    for (const [, phases] of phasesByType.entries()) {
      const sorted = phases
        .map((phase) => ({
          ...phase,
          start: new Date(phase.startDate),
          end: new Date(phase.endDate),
        }))
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      for (let index = 1; index < sorted.length; index += 1) {
        const prevPhase = sorted[index - 1];
        const currentPhase = sorted[index];

        if (
          prevPhase.start instanceof Date &&
          currentPhase.start instanceof Date &&
          prevPhase.end instanceof Date &&
          !Number.isNaN(prevPhase.start.getTime()) &&
          !Number.isNaN(prevPhase.end.getTime()) &&
          !Number.isNaN(currentPhase.start.getTime()) &&
          prevPhase.end > currentPhase.start
        ) {
          return `Las fechas de la fase "${currentPhase.name}" se solapan con otra fase del mismo tipo.`;
        }
      }
    }

    return null;
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

    if (buyerProfiles.length === 0) {
      return 'Agrega al menos un perfil de comprador.';
    }

    if (ticketSectors.length === 0) {
      return 'Agrega al menos un sector de tickets.';
    }

    const invalidSector = ticketSectors.find((sector) => Number(sector.capacity) <= 0);

    if (invalidSector !== undefined) {
      return `Define una capacidad válida para el sector "${invalidSector.name || 'Sin nombre'}".`;
    }

    if (ticketPhases.length === 0) {
      return 'Configura al menos una fase o tipo de ticket.';
    }

    for (const phase of ticketPhases) {
      if (phase.ticketType.trim() === '') {
        return 'Cada fase debe tener un tipo de ticket identificable.';
      }

      if (phase.startDate === '' || phase.endDate === '') {
        return `Completa las fechas de la fase "${phase.name}".`;
      }

      const start = new Date(phase.startDate);
      const end = new Date(phase.endDate);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return `Las fechas definidas para la fase "${phase.name}" no son válidas.`;
      }

      if (end <= start) {
        return `La fecha de fin debe ser posterior a la fecha de inicio en la fase "${phase.name}".`;
      }
      const combinationWithInvalidData = phase.combinations.find((combination) => {
        const basePriceNumber = Number(combination.basePrice) || 0;
        const allocationNumber = Number(combination.allocation) || 0;

        return basePriceNumber <= 0 || allocationNumber <= 0;
      });

      if (combinationWithInvalidData !== undefined) {
        return `Asigna precio y cupos válidos para las combinaciones de la fase "${phase.name}".`;
      }
    }

    const overlapMessage = validatePhaseOverlaps();

    if (overlapMessage !== null) {
      return overlapMessage;
    }

    return null;
  };

  const toPayload = (status: EventStatus): AdminEventPayload => {
    return {
      ...formState,
      estado: status,
      like: 0,
      noInteres: 0,
      comentario: [],
      currency: 'PEN',
      buyerProfiles: buyerProfiles.map((profile) => ({
        id: profile.id,
        name: profile.name,
        description: profile.description.trim() || undefined,
      })),
      ticketSectors: ticketSectors.map((sector) => ({
        id: sector.id,
        name: sector.name,
        capacity: Number(sector.capacity) || 0,
      })),
      ticketPhases: ticketPhases.map((phase) => ({
        id: phase.id,
        name: phase.name,
        ticketType: phase.ticketType,
        startDate: phase.startDate,
        endDate: phase.endDate,
        state: phase.state,
        combinations: phase.combinations.map((combination) => ({
          id: combination.id,
          sectorId: combination.sectorId,
          profileId: combination.profileId,
          basePrice: Number(combination.basePrice) || 0,
          allocation: Number(combination.allocation) || 0,
        })),
      })),
      discounts: discounts
        .filter((discount) => discount.code.trim() !== '')
        .map((discount) => ({
          id: discount.id,
          code: discount.code.trim().toUpperCase(),
          type: discount.type,
          value: Number(discount.value) || 0,
          limitPerUser: Number(discount.limitPerUser) || 0,
          isActive: discount.isActive,
        })),
      taxConfig: {
        currency: 'PEN',
        taxType: taxConfig.taxType,
        taxValue: Number(taxConfig.taxValue) || 0,
        feeType: taxConfig.feeType,
        feeValue: Number(taxConfig.feeValue) || 0,
      },
      imagenDestacada: undefined,
    };
  };

  const resetForm = (): void => {
    const initialProfile = createBuyerProfileDraft('Adulto');
    const initialSector = createTicketSectorDraft('General');
    const initialPhase = createTicketPhaseDraft([initialProfile], [initialSector]);

    setFormState({
      titulo: '',
      descripcion: '',
      lugar: '',
      fechaHoraInicio: '',
      fechaHoraFin: '',
      idOrganizador: organizers[0]?.idOrganizador ?? 0,
      idCategoria: eventCategories[0]?.idCategoria ?? 0,
    });
    setBuyerProfiles([initialProfile]);
    setTicketSectors([initialSector]);
    setTicketPhases([initialPhase]);
    setSelectedPhaseId(initialPhase.id);
    setDiscounts([]);
    setTaxConfig(defaultTaxConfig());
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
            ? 'Evento publicado correctamente. Las fases están listas para activarse.'
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
        showAlert({ type: 'success', text: `Estado actualizado a ${statusLabels[status]}.` });
      }
    } catch {
      showAlert({ type: 'error', text: 'No se pudo actualizar el estado. Inténtalo nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  const previewStatus: EventStatus = 'BORRADOR';
  return (
    <div className='admin-event-grid'>
      <div>
        <div className='admin-card'>
          <Heading type={3} color='white' text='Información general' />
          <p className='gray'>
            Define la información base del evento. Estos campos serán visibles para el público.
          </p>
          <div className='admin-field'>
            <label htmlFor='titulo'>Título del evento</label>
            <Input
              type='text'
              name='titulo'
              value={formState.titulo}
              maxLength={100}
              placeholder='Ej: Festival de verano Nexivent'
              required
              onChange={handleInputChange}
            />
          </div>
          <div className='admin-field'>
            <label htmlFor='descripcion'>Descripción</label>
            <textarea
              id='descripcion'
              name='descripcion'
              value={formState.descripcion}
              onChange={handleTextAreaChange}
              className='admin-input'
              placeholder='Describe la experiencia, artistas invitados y servicios incluidos.'
              rows={6}
            />
          </div>
          <div className='admin-field'>
            <label htmlFor='lugar'>Lugar</label>
            <Input
              type='text'
              name='lugar'
              value={formState.lugar}
              maxLength={120}
              placeholder='Ingresa el recinto o dirección del evento'
              required
              onChange={handleInputChange}
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
                onChange={handleSelectChange}
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
                onChange={handleSelectChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className='admin-card'>
          <Heading type={3} color='white' text='Gestión de cupones' />
          <p className='gray'>
            Monitorea el estado de tus códigos promocionales, crea nuevos y controla su
            disponibilidad en tiempo real.
          </p>
          {discounts.length > 0 ? (
            <div className='admin-coupon-table-wrapper'>
              <table className='admin-coupon-table'>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Tipo</th>
                    <th>Límite por usuario</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((discount) => (
                    <tr key={`manager-${discount.id}`}>
                      <td>{discount.code || 'Sin código'}</td>
                      <td>{discount.type === 'PORCENTAJE' ? 'Porcentaje' : 'Monto fijo'}</td>
                      <td>{discount.limitPerUser !== '' ? discount.limitPerUser : 'Sin límite'}</td>
                      <td>
                        <span
                          className={`admin-status admin-status--${discount.isActive ? 'activo' : 'pausado'}`}
                        >
                          {discount.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className='admin-coupon-actions-cell'>
                        <button
                          type='button'
                          className='button gray-outline'
                          onClick={() => {
                            updateDiscount(discount.id, 'isActive', !discount.isActive);
                          }}
                        >
                          <span className='material-symbols-outlined left-icon'>sync</span>
                          {discount.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className='gray'>Aún no has configurado cupones para este evento.</p>
          )}
          <div className='admin-coupon-actions'>
            <button type='button' className='button gray-overlay' onClick={addDiscount}>
              <span className='material-symbols-outlined left-icon'>add</span>
              Nuevo cupón
            </button>
          </div>
        </div>

        <div className='admin-card'>
          <Heading type={3} color='white' text='Perfiles de comprador' />
          <p className='gray'>
            Crea perfiles personalizados (adulto, niño, corporativo) y describe sus condiciones
            comerciales.
          </p>
          <div className='admin-dynamic-list'>
            {buyerProfiles.map((profile) => (
              <div key={profile.id} className='admin-dynamic-list__item'>
                <div className='admin-field'>
                  <label>Nombre del perfil</label>
                  <input
                    type='text'
                    className='input-text admin-input'
                    value={profile.name}
                    placeholder='Ej: Adulto, Niño, CONADIS'
                    onChange={(event) => {
                      updateBuyerProfile(profile.id, 'name', event.target.value);
                    }}
                  />
                </div>
                <div className='admin-field'>
                  <label>Descripción</label>
                  <input
                    type='text'
                    className='input-text admin-input'
                    value={profile.description}
                    placeholder='Información adicional opcional'
                    onChange={(event) => {
                      updateBuyerProfile(profile.id, 'description', event.target.value);
                    }}
                  />
                </div>
                <button
                  type='button'
                  className='admin-remove-button'
                  onClick={() => {
                    removeBuyerProfile(profile.id);
                  }}
                >
                  <span className='material-symbols-outlined'>delete</span>
                </button>
              </div>
            ))}
          </div>
          <button type='button' className='button gray-overlay' onClick={addBuyerProfile}>
            <span className='material-symbols-outlined left-icon'>add</span>
            Agregar perfil
          </button>
        </div>

        <div className='admin-card'>
          <Heading type={3} color='white' text='Sectores de tickets' />
          <p className='gray'>Define las zonas de venta y su capacidad total disponible.</p>
          <div className='admin-dynamic-list'>
            {ticketSectors.map((sector) => (
              <div key={sector.id} className='admin-dynamic-list__item'>
                <div className='admin-field'>
                  <label>Nombre del sector</label>
                  <input
                    type='text'
                    className='input-text admin-input'
                    value={sector.name}
                    placeholder='Ej: VIP, Platea, General'
                    onChange={(event) => {
                      updateTicketSector(sector.id, 'name', event.target.value);
                    }}
                  />
                </div>
                <div className='admin-field'>
                  <label>Capacidad disponible</label>
                  <input
                    type='number'
                    min='0'
                    className='input-text admin-input'
                    value={sector.capacity}
                    placeholder='Cantidad de cupos'
                    onChange={(event) => {
                      updateTicketSector(sector.id, 'capacity', event.target.value);
                    }}
                  />
                </div>
                <button
                  type='button'
                  className='admin-remove-button'
                  onClick={() => {
                    removeTicketSector(sector.id);
                  }}
                >
                  <span className='material-symbols-outlined'>delete</span>
                </button>
              </div>
            ))}
          </div>
          <button type='button' className='button gray-overlay' onClick={addTicketSector}>
            <span className='material-symbols-outlined left-icon'>add</span>
            Agregar sector
          </button>
        </div>

        <div className='admin-card'>
          <Heading type={3} color='white' text='Impuestos, comisiones y moneda' />
          <p className='gray'>
            La moneda del evento es siempre Soles (PEN). Ajusta impuestos y comisiones para calcular
            el precio final.
          </p>
          <div className='admin-tax-grid'>
            <div className='admin-field'>
              <label>Moneda</label>
              <div className='admin-badge'>PEN</div>
            </div>
            <div className='admin-field'>
              <label>Tipo de impuesto</label>
              <select
                className='select admin-select'
                value={taxConfig.taxType}
                onChange={(event) => {
                  handleTaxConfigChange('taxType', event.target.value as DiscountType);
                }}
              >
                <option value='PORCENTAJE'>Porcentaje</option>
                <option value='MONTO'>Monto fijo</option>
              </select>
            </div>
            <div className='admin-field'>
              <label>Valor del impuesto</label>
              <input
                type='number'
                min='0'
                className='input-text admin-input'
                value={taxConfig.taxValue}
                onChange={(event) => {
                  handleTaxConfigChange('taxValue', event.target.value);
                }}
              />
            </div>
            <div className='admin-field'>
              <label>Tipo de comisión</label>
              <select
                className='select admin-select'
                value={taxConfig.feeType}
                onChange={(event) => {
                  handleTaxConfigChange('feeType', event.target.value as DiscountType);
                }}
              >
                <option value='PORCENTAJE'>Porcentaje</option>
                <option value='MONTO'>Monto fijo</option>
              </select>
            </div>
            <div className='admin-field'>
              <label>Valor de la comisión</label>
              <input
                type='number'
                min='0'
                className='input-text admin-input'
                value={taxConfig.feeValue}
                onChange={(event) => {
                  handleTaxConfigChange('feeValue', event.target.value);
                }}
              />
            </div>
          </div>
        </div>

        <div className='admin-card'>
          <Heading type={3} color='white' text='Descuentos y cupones' />
          <p className='gray'>
            Configura descuentos porcentuales o montos fijos y define el límite de uso por cada
            comprador.
          </p>
          <div className='admin-discount-list'>
            {discounts.map((discount) => (
              <div key={discount.id} className='admin-discount-item'>
                <div className='admin-field'>
                  <label>Código</label>
                  <input
                    type='text'
                    className='input-text admin-input'
                    value={discount.code}
                    placeholder='Ej: PREVENTA20'
                    onChange={(event) => {
                      updateDiscount(discount.id, 'code', event.target.value);
                    }}
                  />
                </div>
                <div className='admin-field'>
                  <label>Tipo</label>
                  <select
                    className='select admin-select'
                    value={discount.type}
                    onChange={(event) => {
                      updateDiscount(discount.id, 'type', event.target.value as DiscountType);
                    }}
                  >
                    <option value='PORCENTAJE'>Porcentaje</option>
                    <option value='MONTO'>Monto fijo</option>
                  </select>
                </div>
                <div className='admin-field'>
                  <label>Valor</label>
                  <input
                    type='number'
                    min='0'
                    className='input-text admin-input'
                    value={discount.value}
                    placeholder='Ej: 10 o 30'
                    onChange={(event) => {
                      updateDiscount(discount.id, 'value', event.target.value);
                    }}
                  />
                </div>
                <div className='admin-field'>
                  <label>Límite por usuario</label>
                  <input
                    type='number'
                    className='input-text admin-input'
                    min='0'
                    value={discount.limitPerUser}
                    placeholder='Veces permitidas por comprador'
                    onChange={(event) => {
                      updateDiscount(discount.id, 'limitPerUser', event.target.value);
                    }}
                  />
                </div>
                <button
                  type='button'
                  className='admin-remove-button'
                  onClick={() => {
                    removeDiscount(discount.id);
                  }}
                >
                  <span className='material-symbols-outlined'>delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className='admin-card'>
          <Heading type={3} color='white' text='Fases y tipos de ticket' />
          <p className='gray'>
            Define rangos de fechas y precios por combinación de sector y perfil para cada fase de
            venta.
          </p>
          <div className='admin-phase-layout'>
            <aside className='admin-phase-sidebar'>
              <button type='button' className='button gray-overlay' onClick={addPhase}>
                <span className='material-symbols-outlined left-icon'>add</span>
                Nueva fase
              </button>
              <div className='admin-phase-list'>
                {ticketPhases.map((phase) => (
                  <button
                    key={phase.id}
                    type='button'
                    className={`admin-phase-list__item ${selectedPhaseId === phase.id ? 'is-active' : ''}`}
                    onClick={() => {
                      setSelectedPhaseId(phase.id);
                    }}
                  >
                    <div>
                      <span className='admin-phase-list__title'>
                        {phase.ticketType || 'Tipo sin nombre'}
                      </span>
                      <span className='admin-phase-list__subtitle'>{phase.name}</span>
                    </div>
                    <span className={`admin-status admin-status--${phase.state.toLowerCase()}`}>
                      {phaseStateLabels[phase.state]}
                    </span>
                  </button>
                ))}
              </div>
              {selectedPhase !== null && (
                <div className='admin-phase-actions'>
                  <button
                    type='button'
                    className='button gray-outline'
                    onClick={() => {
                      duplicatePhase(selectedPhase.id);
                    }}
                  >
                    <span className='material-symbols-outlined left-icon'>content_copy</span>
                    Duplicar fase
                  </button>
                  <button
                    type='button'
                    className='button gray-outline'
                    onClick={() => {
                      saveTemplateFromPhase(selectedPhase.id);
                    }}
                  >
                    <span className='material-symbols-outlined left-icon'>save</span>
                    Guardar como plantilla
                  </button>
                  {phaseTemplates.length > 0 && (
                    <div className='admin-field'>
                      <label>Aplicar plantilla</label>
                      <select
                        className='select admin-select'
                        onChange={(event) => {
                          if (event.target.value !== '') {
                            applyTemplateToPhase(selectedPhase.id, event.target.value);
                            event.target.value = '';
                          }
                        }}
                      >
                        <option value=''>Selecciona una plantilla</option>
                        {phaseTemplates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button
                    type='button'
                    className='button red-outline'
                    onClick={() => {
                      removePhase(selectedPhase.id);
                    }}
                  >
                    <span className='material-symbols-outlined left-icon'>delete</span>
                    Eliminar fase
                  </button>
                </div>
              )}
            </aside>
            <section className='admin-phase-editor'>
              {selectedPhase === null ? (
                <p className='gray'>Selecciona una fase para editar sus detalles.</p>
              ) : (
                <>
                  <div className='admin-field admin-field-grid'>
                    <div>
                      <label>Nombre interno</label>
                      <input
                        type='text'
                        className='input-text admin-input'
                        value={selectedPhase.name}
                        onChange={(event) => {
                          updatePhase(selectedPhase.id, 'name', event.target.value);
                        }}
                      />
                    </div>
                    <div>
                      <label>Tipo de ticket</label>
                      <input
                        type='text'
                        className='input-text admin-input'
                        value={selectedPhase.ticketType}
                        placeholder='Ej: Preventa, Regular, CONADIS'
                        onChange={(event) => {
                          updatePhase(selectedPhase.id, 'ticketType', event.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <div className='admin-field admin-field-grid'>
                    <div>
                      <label>Inicio de venta</label>
                      <input
                        type='datetime-local'
                        className='input-text admin-input'
                        value={selectedPhase.startDate}
                        onChange={(event) => {
                          updatePhase(selectedPhase.id, 'startDate', event.target.value);
                        }}
                      />
                    </div>
                    <div>
                      <label>Fin de venta</label>
                      <input
                        type='datetime-local'
                        className='input-text admin-input'
                        value={selectedPhase.endDate}
                        onChange={(event) => {
                          updatePhase(selectedPhase.id, 'endDate', event.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <div className='admin-field'>
                    <label>Estado de la fase</label>
                    <select
                      className='select admin-select'
                      value={selectedPhase.state}
                      onChange={(event) => {
                        updatePhase(
                          selectedPhase.id,
                          'state',
                          event.target.value as TicketPhaseState
                        );
                      }}
                    >
                      {Object.entries(phaseStateLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='admin-phase-toolbar'>
                    <button
                      type='button'
                      className='button gray-outline'
                      onClick={handleExportMatrix}
                    >
                      <span className='material-symbols-outlined left-icon'>download</span>
                      Exportar matriz
                    </button>
                    <button
                      type='button'
                      className='button gray-outline'
                      onClick={handleImportMatrix}
                    >
                      <span className='material-symbols-outlined left-icon'>upload</span>
                      Importar matriz
                    </button>
                  </div>

                  <div className='admin-combination-table-wrapper'>
                    <table className='admin-combination-table'>
                      <thead>
                        <tr>
                          <th>Perfil</th>
                          <th>Sector</th>
                          <th>Precio base (PEN)</th>
                          <th>Cupos asignados</th>
                          <th>Precio final (impuestos y comisiones)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {combinationSummaries.map((combination) => (
                          <tr key={combination.id}>
                            <td>{combination.profileName}</td>
                            <td>{combination.sectorName}</td>
                            <td>
                              <input
                                type='number'
                                min='0'
                                className='input-text admin-input'
                                value={combination.basePrice}
                                onChange={(event) => {
                                  updateCombination(
                                    selectedPhase.id,
                                    combination.id,
                                    'basePrice',
                                    event.target.value
                                  );
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type='number'
                                min='0'
                                className='input-text admin-input'
                                value={combination.allocation}
                                onChange={(event) => {
                                  updateCombination(
                                    selectedPhase.id,
                                    combination.id,
                                    'allocation',
                                    event.target.value
                                  );
                                }}
                              />
                            </td>
                            <td>
                              {`PEN ${combination.finalPrice.toLocaleString('es-PE', {
                                minimumFractionDigits: 2,
                              })}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          </div>
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
          <Heading type={4} color='white' text='Vista previa para organizadores' />
          <div className='admin-preview-card'>
            <div className='admin-preview-card__header'>
              <span className={`admin-status admin-status--${previewStatus.toLowerCase()}`}>
                {statusLabels[previewStatus]}
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
              {formState.fechaHoraInicio !== ''
                ? new Intl.DateTimeFormat('es-PE', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  }).format(new Date(formState.fechaHoraInicio))
                : 'Inicio por definir'}
              <span className='admin-preview-card__separator'>→</span>
              {formState.fechaHoraFin !== ''
                ? new Intl.DateTimeFormat('es-PE', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  }).format(new Date(formState.fechaHoraFin))
                : 'Fin por definir'}
            </p>
            <p className='admin-preview-card__description'>
              {formState.descripcion !== ''
                ? formState.descripcion
                : 'Comparte aquí los highlights del evento, servicios incluidos y horarios especiales.'}
            </p>
            <div className='admin-preview-card__section'>
              <h4>Perfiles y sectores</h4>
              <ul className='admin-preview-list'>
                {buyerProfiles.map((profile) => (
                  <li key={profile.id}>
                    <strong>{profile.name || 'Perfil sin nombre'}</strong>
                    {profile.description && <span> · {profile.description}</span>}
                  </li>
                ))}
              </ul>
              <ul className='admin-preview-list'>
                {ticketSectors.map((sector) => (
                  <li key={sector.id}>
                    <strong>{sector.name || 'Sector sin nombre'}</strong>
                    <span> · Capacidad: {sector.capacity || '0'}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className='admin-preview-card__section'>
              <h4>Fases configuradas</h4>
              {ticketPhases.map((phase) => (
                <div key={phase.id} className='admin-preview-phase'>
                  <div className='admin-preview-phase__header'>
                    <strong>{phase.ticketType || 'Sin tipo'}</strong>
                    <span className={`admin-status admin-status--${phase.state.toLowerCase()}`}>
                      {phaseStateLabels[phase.state]}
                    </span>
                  </div>
                  <p>
                    {phase.startDate !== ''
                      ? new Intl.DateTimeFormat('es-PE', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(phase.startDate))
                      : 'Inicio no definido'}{' '}
                    →{' '}
                    {phase.endDate !== ''
                      ? new Intl.DateTimeFormat('es-PE', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(phase.endDate))
                      : 'Fin no definido'}
                  </p>
                  <table>
                    <thead>
                      <tr>
                        <th>Perfil</th>
                        <th>Sector</th>
                        <th>Precio base</th>
                        <th>Cupos</th>
                        <th>Precio final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {phase.combinations.map((combination) => {
                        const sector = ticketSectors.find(
                          (item) => item.id === combination.sectorId
                        );
                        const profile = buyerProfiles.find(
                          (item) => item.id === combination.profileId
                        );
                        const basePriceNumber = Number(combination.basePrice) || 0;
                        const finalPrice = calculateFinalPrice(basePriceNumber, taxConfig);

                        return (
                          <tr key={combination.id}>
                            <td>{profile?.name ?? 'Perfil'}</td>
                            <td>{sector?.name ?? 'Sector'}</td>
                            <td>PEN {basePriceNumber.toLocaleString('es-PE')}</td>
                            <td>{combination.allocation}</td>
                            <td>
                              {`PEN ${finalPrice.toLocaleString('es-PE', {
                                minimumFractionDigits: 2,
                              })}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
            <div className='admin-preview-card__section'>
              <h4>Cupones configurados</h4>
              {discounts.length > 0 ? (
                <ul className='admin-preview-list'>
                  {discounts.map((discount) => (
                    <li key={discount.id}>
                      <strong>{discount.code || 'Cupón sin código'}</strong> ·{' '}
                      {discount.type === 'PORCENTAJE'
                        ? `${discount.value || '0'}%`
                        : `PEN ${discount.value || '0'}`}
                      {' · Límite: '}
                      {discount.limitPerUser !== '' ? discount.limitPerUser : 'Sin límite'}
                      {' · Estado: '}
                      {discount.isActive ? 'Activo' : 'Inactivo'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='gray'>Aún no has agregado cupones.</p>
              )}
            </div>
            <div className='admin-preview-card__footer'>
              <div>
                <span className='material-symbols-outlined'>paid</span>
                Ingreso potencial estimado:{' '}
                <strong>
                  PEN {estimatedRevenue.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                </strong>
              </div>
              <div>
                <span className='material-symbols-outlined'>group</span>
                Capacidad planificada por sectores:{' '}
                <strong>
                  {totalPlannedCapacity > 0
                    ? totalPlannedCapacity.toLocaleString('es-PE')
                    : 'Por definir'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className='admin-card'>
          <Heading type={4} color='white' text='Reportes del evento' />
          <p className='gray'>
            Analiza rápidamente la planificación y oportunidades de tus eventos en curso.
          </p>
          <div className='admin-report-grid'>
            <div className='admin-report-card'>
              <span className='admin-report-label'>Ingreso potencial</span>
              <strong>
                PEN {estimatedRevenue.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
              </strong>
            </div>
            <div className='admin-report-card'>
              <span className='admin-report-label'>Capacidad planificada</span>
              <strong>{totalPlannedCapacity.toLocaleString('es-PE')}</strong>
            </div>
            <div className='admin-report-card'>
              <span className='admin-report-label'>Fases y combinaciones</span>
              <strong>
                {ticketPhases.length} fases · {totalCombinations} combinaciones
              </strong>
            </div>
            <div className='admin-report-card'>
              <span className='admin-report-label'>Cupones activos</span>
              <strong>
                {activeCoupons} / {discounts.length}
              </strong>
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
                    {new Intl.DateTimeFormat('es-PE', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(event.fechaHoraInicio))}{' '}
                    · {event.lugar}
                  </p>
                  <p className='admin-event-list__meta'>
                    {event.ticketPhases.length} fases · {event.buyerProfiles.length} perfiles ·{' '}
                    {event.ticketSectors.length} sectores
                  </p>
                </div>
                <div className='admin-event-list__actions'>
                  <span className={`admin-status admin-status--${event.estado.toLowerCase()}`}>
                    {statusLabels[event.estado]}
                  </span>
                  <div className='admin-event-list__buttons'>
                    {event.estado !== 'PUBLICADO' && (
                      <button
                        type='button'
                        className='admin-status-button admin-status-button--publish'
                        disabled={loading}
                        onClick={() => {
                          handleStatusUpdate(event.idEvento, 'PUBLICADO').catch(() => {});
                        }}
                      >
                        <span className='material-symbols-outlined'>done</span>
                      </button>
                    )}
                    {event.estado !== 'BORRADOR' && (
                      <button
                        type='button'
                        className='admin-status-button admin-status-button--draft'
                        disabled={loading}
                        onClick={() => {
                          handleStatusUpdate(event.idEvento, 'BORRADOR').catch(() => {});
                        }}
                      >
                        <span className='material-symbols-outlined'>edit_note</span>
                      </button>
                    )}
                    {event.estado !== 'CANCELADO' && (
                      <button
                        type='button'
                        className='admin-status-button admin-status-button--cancel'
                        disabled={loading}
                        onClick={() => {
                          handleStatusUpdate(event.idEvento, 'CANCELADO').catch(() => {});
                        }}
                      >
                        <span className='material-symbols-outlined'>close</span>
                      </button>
                    )}
                  </div>
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
