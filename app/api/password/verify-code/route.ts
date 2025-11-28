import { NextRequest, NextResponse } from 'next/server';
import { verificationCodes } from '../send-code/route';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ message: 'Email y código son requeridos' }, { status: 400 });
    }

    const stored = verificationCodes.get(email);

    if (!stored) {
      return NextResponse.json({ message: 'Código no encontrado o expirado' }, { status: 400 });
    }

    // Verificar si el código expiró
    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(email);
      return NextResponse.json({ message: 'El código ha expirado' }, { status: 400 });
    }

    // Verificar si el código coincide
    if (stored.code !== code) {
      return NextResponse.json({ message: 'Código incorrecto' }, { status: 400 });
    }

    // Código válido - eliminarlo para que no se pueda usar de nuevo
    verificationCodes.delete(email);

    console.log(`✅ Código verificado correctamente para ${email}`);

    return NextResponse.json({
      message: 'Código verificado correctamente',
      verified: true,
    });
  } catch (error: any) {
    console.error('❌ Error al verificar código:', error);
    return NextResponse.json(
      { message: error.message || 'Error al verificar código' },
      { status: 500 }
    );
  }
}
