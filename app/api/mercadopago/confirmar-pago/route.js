// app/api/mercadopago/confirmar-pago/route.js
// Al volver de MercadoPago tras un pago único del mes, el panel manda acá el
// payment_id que MercadoPago agrega a la URL de vuelta. Así el sitio se
// habilita en el momento, sin esperar al webhook. No se confía en el id: se
// le vuelve a pedir el pago a MercadoPago y procesarPago solo acepta pagos
// aprobados que sean de esta suscripción.
import { NextResponse } from 'next/server';
import { adminAuth, adminDb, hasAdminConfig } from '../../../lib/firebaseAdmin';
import { hasMercadoPagoConfig } from '../../../lib/mercadopago';
import { procesarPago } from '../../../lib/cobroSuscripcion';

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

  try {
    const solicitanteSnap = await adminDb.doc(`usuarios/${decodedToken.uid}`).get();
    if (solicitanteSnap.data()?.role !== 'Admin') {
      return NextResponse.json({ error: 'No tenés permisos.' }, { status: 403 });
    }
  } catch (error) {
    console.error('Error al verificar el rol del solicitante:', error);
    return NextResponse.json({ error: 'No se pudo verificar el permiso.' }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const paymentId = String(body?.paymentId || '');
  if (!/^\d+$/.test(paymentId)) {
    return NextResponse.json({ error: 'El pago no es válido.' }, { status: 400 });
  }

  try {
    await procesarPago(paymentId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error al confirmar el pago de MercadoPago:', error);
    return NextResponse.json({ error: 'No se pudo confirmar el pago.' }, { status: 500 });
  }
}
