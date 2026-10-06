// app/api/mercadopago/webhook/route.js
// Endpoint público que MercadoPago llama ante cada evento (pago aprobado,
// cambio de estado de la suscripción, etc.). Nunca confiamos en el cuerpo de
// la notificación a ciegas: siempre volvemos a pedirle el recurso a la API
// de MercadoPago con nuestro Access Token antes de actualizar algo, así una
// notificación falsa no puede inventar un pago que no exista de verdad.
//
// La cuenta de MercadoPago es la misma que cobra otros sistemas y pagos
// sueltos, así que solo se tienen en cuenta los pagos y suscripciones que
// son nuestros: la suscripción vigente (mercadoPago.preapprovalId) o una
// nueva creada desde el último plan que generamos (mercadoPago.planId).
import { NextResponse } from 'next/server';
import { WebhookSignatureValidator } from 'mercadopago';
import { adminDb, hasAdminConfig } from '../../../lib/firebaseAdmin';
import { obtenerPago, obtenerPreapproval, hasMercadoPagoConfig } from '../../../lib/mercadopago';
import { vencimientoTrasPago } from '../../../lib/suscripcion';

const esDeLaSuscripcion = (preapproval, mercadoPago) =>
  preapproval.id === mercadoPago?.preapprovalId ||
  Boolean(mercadoPago?.planId && preapproval.preapproval_plan_id === mercadoPago.planId);

const procesarPago = async (id) => {
  const pago = await obtenerPago(id);
  // card_validation es el cobro mínimo (y después devuelto) con el que
  // MercadoPago valida una tarjeta al cargarla o cambiarla: no es una
  // mensualidad y no debe extender el vencimiento.
  if (pago.status !== 'approved' || pago.operation_type === 'card_validation') return;

  // Los pagos de una suscripción traen su id acá (también el primero, que
  // MercadoPago marca como regular_payment y no como recurring_payment).
  const subscriptionId =
    pago.point_of_interaction?.transaction_data?.subscription_id || pago.metadata?.preapproval_id;
  if (!subscriptionId) return;

  const configRef = adminDb.doc('config/suscripcion');
  const config = (await configRef.get()).data() || {};
  // MercadoPago reintenta la notificación si no respondemos a tiempo.
  if (String(config.ultimoPago?.id) === String(pago.id)) return;

  const preapproval = await obtenerPreapproval(subscriptionId);
  if (!esDeLaSuscripcion(preapproval, config.mercadoPago)) return;

  await configRef.set({
    fechaVencimiento: vencimientoTrasPago(preapproval.next_payment_date),
    appHabilitada: true,
    ultimoPago: {
      id: pago.id,
      monto: pago.transaction_amount,
      fecha: new Date().toISOString()
    },
    // Si el pago llegó antes que la notificación de la suscripción nueva,
    // la vinculamos acá.
    mercadoPago: { preapprovalId: preapproval.id, estado: preapproval.status }
  }, { merge: true });
};

const procesarPreapproval = async (id) => {
  const preapproval = await obtenerPreapproval(id);
  const configRef = adminDb.doc('config/suscripcion');
  const config = (await configRef.get()).data() || {};
  const esLaVigente = preapproval.id === config.mercadoPago?.preapprovalId;

  // De la vigente registramos cualquier cambio de estado (cancelada,
  // pausada...) para que el panel deje renovarla; una nueva de nuestro plan
  // pasa a ser la vigente recién cuando el pagador la autoriza. El
  // vencimiento no se toca acá: solo lo mueve un pago aprobado.
  if (esLaVigente || (preapproval.status === 'authorized' && esDeLaSuscripcion(preapproval, config.mercadoPago))) {
    await configRef.set({
      mercadoPago: { preapprovalId: preapproval.id, estado: preapproval.status }
    }, { merge: true });
  }
};

export async function POST(request) {
  if (!hasAdminConfig || !hasMercadoPagoConfig) {
    return NextResponse.json({ ok: true });
  }

  const url = new URL(request.url);
  let body = {};
  try {
    body = await request.json();
  } catch {
    // Algunas notificaciones llegan solo con query params, sin body JSON.
  }

  const tipo = body.type || body.topic || url.searchParams.get('type') || url.searchParams.get('topic');
  const id = body.data?.id || url.searchParams.get('data.id') || url.searchParams.get('id');

  if (process.env.MERCADOPAGO_WEBHOOK_SECRET) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get('x-signature'),
        xRequestId: request.headers.get('x-request-id'),
        dataId: id,
        secret: process.env.MERCADOPAGO_WEBHOOK_SECRET
      });
    } catch (error) {
      console.error('Firma de webhook de MercadoPago inválida:', error);
      return NextResponse.json({ error: 'Firma inválida.' }, { status: 401 });
    }
  }

  if (!tipo || !id) {
    return NextResponse.json({ ok: true });
  }

  try {
    if (tipo === 'payment') {
      await procesarPago(id);
    } else if (tipo === 'subscription_preapproval' || tipo === 'preapproval') {
      await procesarPreapproval(id);
    }
  } catch (error) {
    console.error('Error al procesar el webhook de MercadoPago:', error);
    // Devolvemos 200 igual: si respondemos error, MercadoPago reintenta
    // indefinidamente, y no queremos reintentos por un bug nuestro.
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  // MercadoPago valida el endpoint con un GET antes de guardar la URL del webhook.
  return NextResponse.json({ ok: true });
}
