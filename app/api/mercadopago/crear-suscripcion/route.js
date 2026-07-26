// app/api/mercadopago/crear-suscripcion/route.js
// Genera (o regenera) el link de suscripción mensual de MercadoPago. Solo el
// SuperAdmin puede dispararlo: crea el preapproval con el monto configurado
// y guarda el link/estado en config/suscripcion para que el Admin lo vea.
import { NextResponse } from 'next/server';
import { adminAuth, adminDb, hasAdminConfig } from '../../../lib/firebaseAdmin';
import { crearPreapproval, hasMercadoPagoConfig } from '../../../lib/mercadopago';
import { esSuperAdmin } from '../../../lib/superAdmin';

export async function POST(request) {
  if (!hasAdminConfig || !hasMercadoPagoConfig) {
    return NextResponse.json(
      { error: 'El servidor no tiene configurado Firebase Admin o MercadoPago.' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'Falta el token de autenticación.' }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return NextResponse.json({ error: 'Token inválido o expirado.' }, { status: 401 });
  }

  if (!esSuperAdmin(decodedToken.email)) {
    return NextResponse.json({ error: 'No tenés permisos para generar el link de pago.' }, { status: 403 });
  }

  try {
    const configSnap = await adminDb.doc('config/suscripcion').get();
    const monto = configSnap.exists ? configSnap.data().monto : 0;
    if (!monto || monto <= 0) {
      return NextResponse.json(
        { error: 'Configurá un monto mayor a cero antes de generar el link.' },
        { status: 400 }
      );
    }

    const backUrl = new URL('/admin/suscripcion', request.url).toString();
    const preapproval = await crearPreapproval({ monto, backUrl });

    await adminDb.doc('config/suscripcion').set({
      mercadoPago: {
        preapprovalId: preapproval.id,
        initPoint: preapproval.init_point,
        estado: preapproval.status
      }
    }, { merge: true });

    return NextResponse.json({ initPoint: preapproval.init_point, estado: preapproval.status });
  } catch (error) {
    console.error('Error al crear la suscripción de MercadoPago:', error);
    return NextResponse.json({ error: 'No se pudo generar el link de pago.' }, { status: 500 });
  }
}
