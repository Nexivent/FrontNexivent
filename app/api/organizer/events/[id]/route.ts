import { NextRequest, NextResponse } from 'next/server';

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

const resolveNumeric = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseResponseBody = async (response: Response) => {
  const text = await response.text();
  if (text.length === 0) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const eventId = resolveNumeric(resolvedParams.id);
  if (eventId === null) {
    return NextResponse.json({ message: 'idEvento no es valido.' }, { status: 400 });
  }
  console.log('Received PUT request for event ID:', eventId);
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: 'Body invalido o malformado.' }, { status: 400 });
  }

  const usuarioModificacion = resolveNumeric(
    (payload as { usuarioModificacion?: string | number | null })?.usuarioModificacion
  );
  if (usuarioModificacion === null) {
    return NextResponse.json(
      { message: 'usuarioModificacion es requerido para editar eventos.' },
      { status: 400 }
    );
  }

  console.log('PUT /api/organizer/events/:id', {
    eventId,
    usuarioModificacion,
    keys: Object.keys(payload ?? {}),
  });

  const apiBaseUrl = getOrganizerApiBaseUrl();
  if (apiBaseUrl.length === 0) {
    return NextResponse.json(
      { message: 'NEXT_PUBLIC_API_URL o API_URL no esta configurada.' },
      { status: 500 }
    );
  }

  const endpoint = buildEndpoint(apiBaseUrl, `/api/eventos/${eventId}`);
  console.log('Endpoint built:', endpoint);
  try {
    console.log('Sending PUT request to:', endpoint);
    const upstreamResponse = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const upstreamBody = await parseResponseBody(upstreamResponse);

    return NextResponse.json(upstreamBody ?? {}, { status: upstreamResponse.status });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'No se pudo editar el evento.',
        detail: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
