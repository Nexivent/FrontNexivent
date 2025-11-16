import { NextRequest, NextResponse } from 'next/server';

type CouponType = 'PORCENTAJE' | 'MONTO';

export type OrganizerCoupon = {
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

const baseCoupons: OrganizerCoupon[] = [
  {
    idCupon: 801,
    idEvento: 1024,
    descripcion: '20% para los primeros fanáticos del showcase.',
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

let coupons: OrganizerCoupon[] = [...baseCoupons];

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    data: coupons,
    metadata: { total: coupons.length, serverTime: new Date().toISOString() },
  });
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as OrganizerCoupon;
  const normalized: OrganizerCoupon = {
    ...payload,
    idCupon: payload.idCupon ?? Date.now(),
    codigo: payload.codigo.trim().toUpperCase(),
    tipo: payload.tipo === 'MONTO' ? 'MONTO' : 'PORCENTAJE',
    activo: payload.activo === 0 ? 0 : 1,
    uso_por_usuario: Math.max(1, payload.uso_por_usuario),
    valor: Math.max(0, payload.valor),
  };

  coupons = [normalized, ...coupons.filter((coupon) => coupon.idCupon !== normalized.idCupon)];

  return NextResponse.json(
    { message: 'Cupón sincronizado en memoria', data: normalized },
    { status: 201 }
  );
}
