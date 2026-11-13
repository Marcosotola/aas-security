// app/lib/cobroSuscripcion.js
// Uso exclusivo en server. Registra los pagos de la suscripción de la app y,
// antes de bloquear el sitio por vencimiento, le confirma a MercadoPago si el
// cobro del mes entró aunque su notificación todavía no haya llegado (o se
// haya perdido).
//
// La cuenta de MercadoPago es la misma que cobra otros sistemas y pagos
// sueltos, así que solo se tienen en cuenta los pagos y suscripciones que
// son nuestros: la suscripción vigente (mercadoPago.preapprovalId) o una
// nueva creada desde el último plan que generamos (mercadoPago.planId).
import { adminDb } from './firebaseAdmin';
import {
  REF_PAGO_UNICO,
  buscarCobrosPreapproval,
  cancelarPreapproval,
  obtenerPago,
  obtenerPreapproval
} from './mercadopago';
import { estaVencida, fechaEnArgentina, limiteDelDiaDeCobro, sumarUnMes, vencimientoTrasPago } from './suscripcion';

// Cada cuánto, como mucho, se le vuelve a preguntar a MercadoPago antes de bloquear.
const VERIFICACION_THROTTLE_MS = 5 * 60 * 1000;
// Un cobro cuenta para el mes vencido si se hizo desde un par de días antes
// del vencimiento: así un pago viejo nunca destraba un ciclo impago.
const VENTANA_COBRO_MS = 2 * 24 * 60 * 60 * 1000;

export const esDeLaSuscripcion = (preapproval, mercadoPago) =>
  preapproval.id === mercadoPago?.preapprovalId ||
  Boolean(mercadoPago?.planId && preapproval.preapproval_plan_id === mercadoPago.planId);

export const procesarPago = async (id) => {
  const pago = await obtenerPago(id);
  // card_validation es el cobro mínimo (y después devuelto) con el que
  // MercadoPago valida una tarjeta al cargarla o cambiarla: no es una
  // mensualidad y no debe extender el vencimiento.
  if (pago.status !== 'approved' || pago.operation_type === 'card_validation') return;

  if (String(pago.external_reference || '').startsWith(`${REF_PAGO_UNICO}:`)) {
    await procesarPagoUnico(pago);
    return;
  }

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
    ...vencimientoTrasPago(preapproval.next_payment_date),
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

// Pago único del mes (ver crearPagoUnico en app/lib/mercadopago.js): corre el
// vencimiento un mes desde el que estaba impago, así el ciclo no se desplaza
// por pagar unos días tarde (si pasó más de un mes, un mes desde hoy). Lo
// llaman tanto el webhook como la vuelta de MercadoPago al panel, por eso va
// en una transacción: el mismo pago nunca suma dos meses.
const procesarPagoUnico = async (pago) => {
  const configRef = adminDb.doc('config/suscripcion');
  const registrado = await adminDb.runTransaction(async (tx) => {
    const config = (await tx.get(configRef)).data() || {};
    if (String(config.ultimoPago?.id) === String(pago.id)) return null;

    const vencimientoAnterior = config.vencimientoExacto
      ? new Date(config.vencimientoExacto)
      : config.fechaVencimiento ? new Date(`${config.fechaVencimiento}T21:00:00-03:00`) : new Date();
    let proximo = sumarUnMes(vencimientoAnterior);
    if (proximo <= new Date()) proximo = sumarUnMes(new Date());
    const limite = limiteDelDiaDeCobro(proximo);

    tx.set(configRef, {
      fechaVencimiento: fechaEnArgentina(limite),
      vencimientoExacto: limite.toISOString(),
      appHabilitada: true,
      ultimoPago: {
        id: pago.id,
        monto: pago.transaction_amount,
        fecha: new Date().toISOString(),
        tipo: 'unico'
      }
    }, { merge: true });
    return config;
  });
  if (!registrado) return;

  // El débito automático que falló se cancela: si MercadoPago reintentara el
  // cobro, el mes quedaría pagado dos veces. El mes que viene el Admin
  // autoriza un débito nuevo desde el panel.
  const preapprovalId = registrado.mercadoPago?.preapprovalId;
  if (!preapprovalId) return;
  try {
    const preapproval = await obtenerPreapproval(preapprovalId);
    if (['authorized', 'paused'].includes(preapproval.status)) {
      await cancelarPreapproval(preapprovalId);
    }
    await configRef.set({ mercadoPago: { estado: 'cancelled' } }, { merge: true });
  } catch (error) {
    console.error('No se pudo cancelar el débito automático tras el pago único:', error);
  }
};

// Se llama solo cuando el sitio estaría bloqueado por vencimiento. Devuelve
// true si encontró en MercadoPago el cobro del mes y lo registró.
export const verificarCobroAntesDeBloquear = async (config) => {
  const preapprovalId = config?.mercadoPago?.preapprovalId;
  if (!preapprovalId || !estaVencida(config)) return false;

  const ultimaVerificacion = config.ultimaVerificacionMP ? new Date(config.ultimaVerificacionMP) : null;
  if (ultimaVerificacion && Date.now() - ultimaVerificacion.getTime() < VERIFICACION_THROTTLE_MS) return false;

  const configRef = adminDb.doc('config/suscripcion');
  await configRef.set({ ultimaVerificacionMP: new Date().toISOString() }, { merge: true });

  const vencimiento = config.vencimientoExacto
    ? new Date(config.vencimientoExacto)
    : new Date(`${config.fechaVencimiento}T00:00:00-03:00`);
  const desde = new Date(vencimiento.getTime() - VENTANA_COBRO_MS);

  const cobros = await buscarCobrosPreapproval(preapprovalId);
  const cobroDelMes = cobros.find(
    (cobro) => cobro.payment?.status === 'approved' && new Date(cobro.debit_date || cobro.date_created) >= desde
  );
  if (!cobroDelMes) return false;

  await procesarPago(cobroDelMes.payment.id);
  return true;
};
