// app/api/mercadopago/crear-suscripcion/route.js
// Consigue el link de suscripción mensual de MercadoPago: un plan sin email
// fijo (ver crearPlan en app/lib/mercadopago.js), así que el Admin autoriza
// con la cuenta de MercadoPago y la tarjeta que quiera. Lo llama el propio
// panel cuando el Admin pide regularizar el pago, para mandarlo directo a
// pagar sin que nadie tenga que generarlo ni compartirlo a mano.
import { NextResponse } from 'next/server';
import { adminAuth, adminDb, hasAdminConfig } from '../../../lib/firebaseAdmin';
import {
  cancelarPreapproval,
  crearPagoUnico,
  crearPlan,
  hasMercadoPagoConfig,
  obtenerPreapproval
} from '../../../lib/mercadopago';
import { estaVencida } from '../../../lib/suscripcion';

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
    const configRef = adminDb.doc('config/suscripcion');
    const configSnap = await configRef.get();
    const config = configSnap.exists ? configSnap.data() : {};
    const mercadoPago = config.mercadoPago || {};

    const monto = config.monto;
    if (!monto || monto <= 0) {
      return NextResponse.json(
        { error: 'Todavía no se configuró un monto de suscripción.' },
        { status: 400 }
      );
    }

    const backUrl = new URL('/admin/suscripcion', request.url).toString();

    // Consultamos el estado real de la suscripción guardada en vez de
    // confiar en Firestore: MercadoPago puede cancelarla sola (p. ej. tras
    // varios cobros fallidos) sin que el webhook llegue a avisarnos.
    if (mercadoPago.preapprovalId) {
      let preapproval = null;
      try {
        preapproval = await obtenerPreapproval(mercadoPago.preapprovalId);
      } catch (error) {
        console.error('Error al consultar la suscripción vigente de MercadoPago:', error);
      }

      // Sigue activa pero el sitio está vencido: falló el débito del mes.
      // Crear otra suscripción haría que MercadoPago cobre dos veces, así que
      // se paga el mes con un pago único. Al acreditarse, la suscripción que
      // falló se cancela para que un reintento de MercadoPago no lo cobre de
      // nuevo (ver procesarPagoUnico en app/lib/cobroSuscripcion.js); el mes
      // que viene se autoriza un débito nuevo desde este mismo botón.
      if (preapproval && ['authorized', 'paused'].includes(preapproval.status)) {
        // Al día pero deshabilitada a mano por el SuperAdmin: no hay nada que pagar.
        if (!estaVencida(config)) {
          return NextResponse.json({
            error: 'La suscripción está al día. El sitio lo deshabilitó el proveedor de la app: consultalo con él.',
            suscripcionActiva: true
          }, { status: 409 });
        }
        const notificationUrl = new URL('/api/mercadopago/webhook?source_news=webhooks', request.url).toString();
        const preferencia = await crearPagoUnico({ monto, backUrl, notificationUrl });
        return NextResponse.json({ initPoint: preferencia.init_point, pagoUnico: true });
      }

      // Link del modelo anterior que nadie llegó a autorizar: lo cancelamos
      // para no dejarlo dando vueltas.
      if (preapproval?.status === 'pending') {
        try {
          await cancelarPreapproval(preapproval.id);
        } catch (error) {
          console.error('Error al cancelar la suscripción pendiente de MercadoPago:', error);
        }
      }
    }

    // El plan se reusa mientras no cambie el monto: cada uno tiene el suyo.
    if (mercadoPago.planId && mercadoPago.planMonto === monto && mercadoPago.initPoint) {
      return NextResponse.json({ initPoint: mercadoPago.initPoint });
    }

    // El plan anterior no se cancela: un plan sin suscriptores no cobra nada,
    // y si alguien ya se suscribió desde ese link no queremos afectarlo.
    const plan = await crearPlan({ monto, backUrl });

    await configRef.set({
      mercadoPago: { planId: plan.id, planMonto: monto, initPoint: plan.init_point }
    }, { merge: true });

    return NextResponse.json({ initPoint: plan.init_point });
  } catch (error) {
    console.error('Error al crear la suscripción de MercadoPago:', error);
    return NextResponse.json({ error: 'No se pudo generar el link de pago.' }, { status: 500 });
  }
}
