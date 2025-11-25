import { NextRequest, NextResponse } from 'next/server';

type CouponType = 'PORCENTAJE' | 'MONTO';

export type OrganizerCoupon = {
  idCupon: number;
  idEvento: number;
  descripcion: string;
  tipo: 0 | 1;
  activo: 0 | 1;
  valor: number;
  codigo: string;
  uso_por_usuario: number;
  uso_realizados: number;
  fechaInicio: string;
  fechaFin: string;
};

type UpstreamCoupon = {
  id?: number;
  descripcion?: string;
  tipo?: number | string;
  estadoCupon?: number | string;
  valor?: number;
  codigo?: string;
  usoPorUsuario?: number;
  usoRealizados?: number;
  fechaInicio?: string;
  fechaFin?: string;
  eventoId?: number;
};

const getOrganizerApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_URL ??
    process.env.NEXIVENT_API_URL ??
    '') as string;

const buildEndpoint = (baseUrl: string, path: string) => {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const parseResponseBody = async (response: Response) => {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
};

const toDateOnly = (value?: string | null) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const toIsoDateTime = (value?: string | null) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

const normalizeCoupon = (payload: UpstreamCoupon): OrganizerCoupon => {
  const tipoValue = payload.tipo;
  const tipo = tipoValue === 0 || tipoValue === '0' ? 0 : 1;
  const estadoValue = payload.estadoCupon;
  const activo = estadoValue === 0 || estadoValue === '0' ? 0 : 1;

  return {
    idCupon: payload.id ?? Date.now(),
    idEvento: payload.eventoId ?? 0,
    descripcion: payload.descripcion ?? '',
    tipo,
    activo,
    valor: payload.valor ?? 0,
    codigo: (payload.codigo ?? '').toString().trim().toUpperCase(),
    uso_por_usuario: payload.usoPorUsuario ?? 1,
    uso_realizados: payload.usoRealizados ?? 0,
    fechaInicio: toDateOnly(payload.fechaInicio),
    fechaFin: toDateOnly(payload.fechaFin),
  };
};

const cleanPayload = (payload: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );

type BuildPayloadOptions = {
  includeId?: boolean;
  includeEstado?: boolean;
};

const buildUpstreamPayload = (
  payload: Partial<OrganizerCoupon>,
  options: BuildPayloadOptions = {}
) => {
  const { includeId = false, includeEstado = false } = options;

  const resolvedType = payload.tipo

  const resolvedId = includeId
    ? resolveNumeric(
        (payload as { id?: number | string }).id ??
          (payload as { idCupon?: number | string }).idCupon
      )
    : null;

  const resolvedEstado = includeEstado
    ? payload.activo === 0 
      ? 0
      : 1
    : undefined;

  return cleanPayload({
    id: resolvedId,
    descripcion: payload.descripcion ?? '',
    tipo: resolvedType,
    valor: Math.max(0, Number(payload.valor ?? 0)),
    codigo: (payload.codigo ?? '').toString().trim().toUpperCase(),
    usoPorUsuario: Math.max(1, Number(payload.uso_por_usuario ?? 1)),
    fechaInicio: toIsoDateTime(payload.fechaInicio),
    fechaFin: toIsoDateTime(payload.fechaFin),
    eventoId: payload.idEvento ?? 0,
    estadoCupon: resolvedEstado,
  });
};

const resolveNumeric = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const organizerId =
    resolveNumeric(request.nextUrl.searchParams.get('organizerId')) ??
    resolveNumeric(request.nextUrl.searchParams.get('organizadorId')) ??
    resolveNumeric(process.env.NEXT_PUBLIC_ORGANIZER_ID) ??
    resolveNumeric(process.env.ORGANIZER_ID);

  const apiBaseUrl = getOrganizerApiBaseUrl();

  if (apiBaseUrl.length === 0) {
    return NextResponse.json(
      { message: 'NEXT_PUBLIC_API_URL o API_URL no esta configurada. No se pudo obtener cupones.' },
      { status: 500 }
    );
  }

  if (organizerId === null) {
    return NextResponse.json(
      { message: 'organizerId o usuario organizador no valido.' },
      { status: 400 }
    );
  }

  const endpoint = buildEndpoint(apiBaseUrl, `/cupon/organizador/${organizerId}`);

  try {
    const upstreamResponse = await fetch(endpoint, { cache: 'no-store' });
    const upstreamBody = await parseResponseBody(upstreamResponse);

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          message: 'La API real respondio con un error al listar los cupones.',
          details: upstreamBody,
        },
        { status: upstreamResponse.status }
      );
    }

    const coupons = Array.isArray((upstreamBody as { cupones?: UpstreamCoupon[] } | null)?.cupones)
      ? ((upstreamBody as { cupones?: UpstreamCoupon[] }).cupones as UpstreamCoupon[])
      : [];
    const data = coupons.map((coupon) => normalizeCoupon(coupon));

    return NextResponse.json({
      data,
      metadata: {
        total: data.length,
        source: endpoint,
        upstreamStatus: upstreamResponse.status,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'No se pudo obtener los cupones desde la API real.',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Partial<OrganizerCoupon> & {
      usuarioCreacion?: number;
    };

    const usuarioCreacion =
      resolveNumeric(request.nextUrl.searchParams.get('usuarioCreacion')) ??
      resolveNumeric(payload.usuarioCreacion) ??
      resolveNumeric(process.env.NEXT_PUBLIC_ORGANIZER_ID) ??
      resolveNumeric(process.env.ORGANIZER_ID);

    if (usuarioCreacion === null) {
      return NextResponse.json(
        { message: 'usuarioCreacion es requerido para crear cupones.' },
        { status: 400 }
      );
    }

    const apiBaseUrl = getOrganizerApiBaseUrl();

    if (apiBaseUrl.length === 0) {
      return NextResponse.json(
        {
          message: 'NEXT_PUBLIC_API_URL o API_URL no esta configurada. No se pudo crear el cupon.',
        },
        { status: 500 }
      );
    }

    const endpoint = buildEndpoint(apiBaseUrl, `/cupon/${usuarioCreacion}`);
    const upstreamPayload = buildUpstreamPayload(payload);

    const upstreamResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(upstreamPayload),
      cache: 'no-store',
    });

    const upstreamBody = await parseResponseBody(upstreamResponse);

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          message: 'La API real respondio con un error al crear el cupon.',
          details: upstreamBody,
        },
        { status: upstreamResponse.status }
      );
    }

    const candidateData =
      upstreamBody !== null &&
      typeof upstreamBody === 'object' &&
      'data' in (upstreamBody as Record<string, unknown>)
        ? (upstreamBody as Record<string, unknown>).data
        : upstreamBody;

    const data = normalizeCoupon(candidateData as UpstreamCoupon);

    return NextResponse.json(
      {
        message: 'Cupon sincronizado con la API real.',
        data,
        upstream: upstreamBody,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'No se pudo procesar el cupon.',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = (await request.json()) as Partial<OrganizerCoupon> & {
      usuarioModificacion?: number;
    };

    const usuarioModificacion =
      resolveNumeric(request.nextUrl.searchParams.get('usuarioModificacion')) ??
      resolveNumeric(payload.usuarioModificacion) ??
      resolveNumeric(process.env.NEXT_PUBLIC_ORGANIZER_ID) ??
      resolveNumeric(process.env.ORGANIZER_ID);

    if (usuarioModificacion === null) {
      return NextResponse.json(
        { message: 'usuarioModificacion es requerido para actualizar cupones.' },
        { status: 400 }
      );
    }

    const couponId = resolveNumeric(
      (payload as { id?: number | string }).id ??
        (payload as { idCupon?: number | string }).idCupon
    );

    if (couponId === null) {
      return NextResponse.json(
        { message: 'id del cupon es requerido para actualizar.' },
        { status: 422 }
      );
    }

    const apiBaseUrl = getOrganizerApiBaseUrl();

    if (apiBaseUrl.length === 0) {
      return NextResponse.json(
        {
          message: 'NEXT_PUBLIC_API_URL o API_URL no esta configurada. No se pudo actualizar el cupon.',
        },
        { status: 500 }
      );
    }

    const endpoint = buildEndpoint(apiBaseUrl, `/cupon/${usuarioModificacion}`);
    const upstreamPayload = buildUpstreamPayload(payload, {
      includeId: true,
      includeEstado: true,
    });

    const upstreamResponse = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(upstreamPayload),
      cache: 'no-store',
    });

    const upstreamBody = await parseResponseBody(upstreamResponse);

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          message: 'La API real respondio con un error al actualizar el cupon.',
          details: upstreamBody,
        },
        { status: upstreamResponse.status }
      );
    }

    const candidateData =
      upstreamBody !== null &&
      typeof upstreamBody === 'object' &&
      'data' in (upstreamBody as Record<string, unknown>)
        ? (upstreamBody as Record<string, unknown>).data
        : upstreamBody;

    const data = normalizeCoupon(candidateData as UpstreamCoupon);

    return NextResponse.json(
      {
        message: 'Cupon actualizado en la API real.',
        data,
        upstream: upstreamBody,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'No se pudo procesar la actualizacion del cupon.',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
