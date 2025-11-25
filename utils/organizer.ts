import { type Usuario } from './api';

const toNumericId = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const numeric = typeof value === 'string' ? Number(value) : (value as number);
  if (typeof numeric !== 'number' || Number.isNaN(numeric)) return null;
  return numeric > 0 ? numeric : null;
};

export const resolveOrganizerIdFromUser = (user?: Partial<Usuario> | null): number | null => {
  if (!user) return null;

  const candidates: Array<unknown> = [
    (user as { organizerId?: unknown }).organizerId,
    (user as { idOrganizador?: unknown }).idOrganizador,
    (user as { usuarioId?: unknown }).usuarioId,
    (user as { userId?: unknown }).userId,
    user.idUsuario,
    user.id,
  ];

  for (const candidate of candidates) {
    const numeric = toNumericId(candidate);
    if (numeric !== null) return numeric;
  }

  return null;
};
