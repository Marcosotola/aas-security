// app/api/mercadopago/actualizar-monto/route.js
// Lleva a MercadoPago el monto nuevo cuando el SuperAdmin lo edita en
// Suscripción: MercadoPago debita el monto fijado en la suscripción, no el
// que está en Firestore, así que sin esto el cambio de precio no llegaba al
// próximo cobro. El panel lo llama antes de guardar el monto en Firestore,
// para que no queden desincronizados si MercadoPago rechaza el cambio. Los
// links nuevos ya salen con el monto nuevo (ver crear-suscripcion).
import { NextResponse } from 'next/server';
import { adminAuth, adminDb, hasAdminConfig } from '../../../lib/firebaseAdmin';
import { esSuperAdmin } from '../../../lib/superAdmin';
import {
  actualizarMontoPreapproval,
  hasMercadoPagoConfig,
  obtenerPreapproval
} from '../../../lib/mercadopago';

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
    return NextResponse.json({ error: 'Solo el proveedor de la app puede cambiar el monto.' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const monto = Number(body?.monto);
  if (!monto || monto <= 0) {
    return NextResponse.json({ error: 'El monto no es válido.' }, { status: 400 });
  }

  try {
    const configSnap = await adminDb.doc('config/suscripcion').get();
    const preapprovalId = configSnap.data()?.mercadoPago?.preapprovalId;
    if (!preapprovalId) {
      return NextResponse.json({ sincronizada: false });
    }

    // Una cancelada ya no cobra: no hay nada que actualizar.
    const preapproval = await obtenerPreapproval(preapprovalId);
    if (!['authorized', 'paused'].includes(preapproval.status)) {
      return NextResponse.json({ sincronizada: false });
    }

    if (preapproval.auto_recurring?.transaction_amount !== monto) {
      await actualizarMontoPreapproval(preapprovalId, monto);
    }
    return NextResponse.json({ sincronizada: true });
  } catch (error) {
    console.error('Error al actualizar el monto en MercadoPago:', error);
    return NextResponse.json({ error: 'MercadoPago no aceptó el cambio de monto.' }, { status: 502 });
  }
}
