// app/api/mercadopago/crear-suscripcion/route.js
// Consigue el link de suscripción mensual de MercadoPago: si ya existe uno
// vigente (no cancelado) lo devuelve tal cual, si no lo crea. Lo llama el
// propio panel automáticamente cuando el Admin entra con la suscripción
// vencida, para mandarlo directo a pagar sin que nadie tenga que generarlo
// ni compartirlo a mano.
import { NextResponse } from 'next/server';
import { adminAuth, adminDb, hasAdminConfig } from '../../../lib/firebaseAdmin';
import { crearPreapproval, hasMercadoPagoConfig } from '../../../lib/mercadopago';

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
    // Cubre tanto al Admin como al SuperAdmin: esa cuenta también tiene
    // role 'Admin' en Firestore (ver app/lib/superAdmin.js).
    if (solicitanteSnap.data()?.role !== 'Admin') {
      return NextResponse.json({ error: 'No tenés permisos para generar el link de pago.' }, { status: 403 });
    }
  } catch (error) {
    console.error('Error al verificar el rol del solicitante:', error);
    return NextResponse.json({ error: 'No se pudo verificar el permiso.' }, { status: 500 });
  }

  try {
    const configSnap = await adminDb.doc('config/suscripcion').get();
    const config = configSnap.exists ? configSnap.data() : {};

    // Ya hay un link vigente (pendiente de autorizar o autorizado): lo
    // reusamos en vez de crear una suscripción duplicada en MercadoPago.
    if (config.mercadoPago?.initPoint && config.mercadoPago.estado !== 'cancelled') {
      return NextResponse.json({
        initPoint: config.mercadoPago.initPoint,
        estado: config.mercadoPago.estado
      });
    }

    const monto = config.monto;
    if (!monto || monto <= 0) {
      return NextResponse.json(
        { error: 'Todavía no se configuró un monto de suscripción.' },
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
