// app/api/mercadopago/webhook/route.js
// Endpoint público que MercadoPago llama ante cada evento (pago aprobado,
// cambio de estado de la suscripción, etc.). Nunca confiamos en el cuerpo de
// la notificación a ciegas: siempre volvemos a pedirle el recurso a la API
// de MercadoPago con nuestro Access Token antes de actualizar algo, así una
// notificación falsa no puede inventar un pago que no exista de verdad.
import { NextResponse } from 'next/server';
import { WebhookSignatureValidator } from 'mercadopago';
import { adminDb, hasAdminConfig } from '../../../lib/firebaseAdmin';
import { obtenerPago, obtenerPreapproval, hasMercadoPagoConfig } from '../../../lib/mercadopago';

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
      const pago = await obtenerPago(id);
      if (pago.status === 'approved') {
        const configSnap = await adminDb.doc('config/suscripcion').get();
        const actual = configSnap.exists ? configSnap.data() : {};
        const hoy = new Date();
        const hoyStr = hoy.toISOString().split('T')[0];
        // Si todavía no venció, extiende desde el vencimiento actual (no
        // "pierde" los días que quedaban); si ya venció o no había fecha,
        // extiende desde hoy.
        const baseFecha = actual.fechaVencimiento && actual.fechaVencimiento > hoyStr
          ? new Date(actual.fechaVencimiento)
          : hoy;
        baseFecha.setMonth(baseFecha.getMonth() + 1);
        const nuevaFecha = baseFecha.toISOString().split('T')[0];

        await adminDb.doc('config/suscripcion').set({
          fechaVencimiento: nuevaFecha,
          ultimoPago: {
            id: pago.id,
            monto: pago.transaction_amount,
            fecha: hoy.toISOString()
          }
        }, { merge: true });
      }
    } else if (tipo === 'subscription_preapproval' || tipo === 'preapproval') {
      const preapproval = await obtenerPreapproval(id);
      await adminDb.doc('config/suscripcion').set({
        mercadoPago: {
          preapprovalId: preapproval.id,
          initPoint: preapproval.init_point,
          estado: preapproval.status
        }
      }, { merge: true });
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
