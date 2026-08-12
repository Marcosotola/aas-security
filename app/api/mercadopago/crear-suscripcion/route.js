// app/api/mercadopago/crear-suscripcion/route.js
// Consigue el link de suscripción mensual de MercadoPago: si ya existe uno
// vigente con el mismo email lo devuelve tal cual, si cambió el email o no
// hay ninguno lo crea (cancelando el anterior si hacía falta). Lo llama el
// propio panel cuando el Admin confirma su email de MercadoPago en el
// modal/pantalla de Suscripción, para mandarlo directo a pagar sin que
// nadie tenga que generarlo ni compartirlo a mano.
import { NextResponse } from 'next/server';
import { adminAuth, adminDb, hasAdminConfig } from '../../../lib/firebaseAdmin';
import {
  cancelarPreapproval,
  crearPreapproval,
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

  const body = await request.json().catch(() => ({}));
  const payerEmail = String(body?.payerEmail || '').trim();
  if (!payerEmail) {
    return NextResponse.json({ error: 'Falta el email de tu cuenta de MercadoPago.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail)) {
    return NextResponse.json({ error: 'El email no es válido.' }, { status: 400 });
  }

  try {
    const configSnap = await adminDb.doc('config/suscripcion').get();
    const config = configSnap.exists ? configSnap.data() : {};

    // Si hay una preapproval guardada, consultamos su estado real en
    // MercadoPago en vez de confiar en lo que quedó cacheado en Firestore:
    // MercadoPago puede cancelarla sola (p. ej. tras varios intentos
    // fallidos) sin que el webhook llegue a avisarnos, y quedaría
    // desincronizado.
    let preapprovalPrevia = null;
    if (config.mercadoPago?.preapprovalId) {
      try {
        preapprovalPrevia = await obtenerPreapproval(config.mercadoPago.preapprovalId);
      } catch (error) {
        console.error('Error al consultar la suscripción previa de MercadoPago:', error);
      }
    }

    if (preapprovalPrevia && preapprovalPrevia.status !== 'cancelled') {
      // Mismo email que la última vez y sigue vigente: reusamos el link en
      // vez de crear una suscripción duplicada.
      if (config.mercadoPago.payerEmail === payerEmail) {
        return NextResponse.json({
          initPoint: preapprovalPrevia.init_point,
          estado: preapprovalPrevia.status
        });
      }
      // Cambió el email: cancelamos la anterior para no dejarla huérfana.
      try {
        await cancelarPreapproval(preapprovalPrevia.id);
      } catch (error) {
        console.error('Error al cancelar la suscripción anterior de MercadoPago:', error);
      }
    }

    const monto = config.monto;
    if (!monto || monto <= 0) {
      return NextResponse.json(
        { error: 'Todavía no se configuró un monto de suscripción.' },
        { status: 400 }
      );
    }

    const backUrl = new URL('/admin/suscripcion', request.url).toString();
    const preapproval = await crearPreapproval({ monto, backUrl, payerEmail });

    await adminDb.doc('config/suscripcion').set({
      mercadoPago: {
        preapprovalId: preapproval.id,
        initPoint: preapproval.init_point,
        estado: preapproval.status,
        payerEmail
      }
    }, { merge: true });

    return NextResponse.json({ initPoint: preapproval.init_point, estado: preapproval.status });
  } catch (error) {
    console.error('Error al crear la suscripción de MercadoPago:', error);
    return NextResponse.json({ error: 'No se pudo generar el link de pago.' }, { status: 500 });
  }
}
