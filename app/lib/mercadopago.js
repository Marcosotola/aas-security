// app/lib/mercadopago.js
// Uso exclusivo en server (API routes): usa el Access Token privado de
// MercadoPago. Nunca importar desde un componente 'use client'.
import { MercadoPagoConfig, PreApproval, PreApprovalPlan, Payment } from 'mercadopago';

export const hasMercadoPagoConfig = Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);

let client;
if (hasMercadoPagoConfig) {
  client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
} else {
  console.warn('MercadoPago no está configurado. Definí MERCADOPAGO_ACCESS_TOKEN para habilitar el cobro recurrente.');
}

// Crea un plan (preapproval_plan) mensual. Usamos un plan y no un
// preapproval directo a propósito: el preapproval exige payer_email y
// MercadoPago rechaza la autorización si quien paga entra con otra cuenta;
// el plan no lleva email, así que su link (init_point) lo autoriza
// cualquier cuenta de MercadoPago. La suscripción que se crea desde el link
// la vincula el webhook comparando preapproval_plan_id.
export const crearPlan = async ({ monto, backUrl, reason }) => {
  const plan = new PreApprovalPlan(client);
  return plan.create({
    body: {
      reason: reason || 'Suscripción mensual - Panel AAS Security',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: monto,
        currency_id: 'ARS'
      },
      back_url: backUrl
    }
  });
};

export const obtenerPreapproval = async (id) => {
  const preapproval = new PreApproval(client);
  return preapproval.get({ id });
};

// Cancela una preapproval existente en MercadoPago. Solo se usa con las que
// quedaron 'pending' (links del modelo anterior que nadie llegó a
// autorizar): una 'authorized' nunca se cancela desde el panel.
export const cancelarPreapproval = async (id) => {
  const preapproval = new PreApproval(client);
  return preapproval.update({ id, body: { status: 'cancelled' } });
};

// Cambia el monto que MercadoPago debita en los próximos cobros de una
// suscripción ya autorizada. Sin esto, editar el monto en el panel solo
// cambiaba Firestore y MercadoPago seguía cobrando el monto original.
export const actualizarMontoPreapproval = async (id, monto) => {
  const preapproval = new PreApproval(client);
  return preapproval.update({ id, body: { auto_recurring: { transaction_amount: monto, currency_id: 'ARS' } } });
};

export const obtenerPago = async (id) => {
  const payment = new Payment(client);
  return payment.get({ id });
};
