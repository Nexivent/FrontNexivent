import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, context: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await context.params;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098';

    // Llamar al backend para obtener los asistentes
    const response = await fetch(`${API_URL}/eventos/${eventId}/asistentes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener asistentes del evento');
    }

    const data = await response.json();

    const attendees = data.asistentes.map((asistente: any) => ({
      email: asistente.email,
      nombre: asistente.nombre,
    }));

    console.log(`✅ [API] ${attendees.length} asistentes obtenidos`);

    return NextResponse.json({
      data: attendees,
      success: true,
      total: data.total || attendees.length,
    });
  } catch (error) {
    console.error('❌ [API] Error al obtener asistentes:', error);
    return NextResponse.json(
      {
        message: 'Error al obtener asistentes',
        error: error instanceof Error ? error.message : 'Error desconocido',
        data: [],
      },
      { status: 500 }
    );
  }
}
