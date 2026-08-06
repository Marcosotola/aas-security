// app/lib/mercadopago.js
// Uso exclusivo en server (API routes): usa el Access Token privado de
// MercadoPago. Nunca importar desde un componente 'use client'.
import { MercadoPagoConfig, PreApproval, Payment } from 'mercadopago';

export const hasMercadoPagoConfig = Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);

let client;
if (hasMercadoPagoConfig) {
  client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
} else {
  console.warn('MercadoPago no está configurado. Definí MERCADOPAGO_ACCESS_TOKEN para habilitar el cobro recurrente.');
}

// Crea una suscripción (preapproval) mensual. payer_email es opcional: si se
// pasa, MercadoPago exige que el checkout se autorice con esa cuenta
// puntual (el admin lo confirma/edita antes de ser redirigido, ver
// AdminHeader.jsx). Si no se pasa, el link sirve para que lo abra quien
// tenga que pagar, sin depender de un email específico.
export const crearPreapproval = async ({ monto, backUrl, reason, payerEmail }) => {
  const preapproval = new PreApproval(client);
  return preapproval.create({
    body: {
      reason: reason || 'Suscripción mensual - Panel AAS Security',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: monto,
        currency_id: 'ARS'
      },
      back_url: backUrl,
      external_reference: 'aas-security-suscripcion',
      ...(payerEmail ? { payer_email: payerEmail } : {})
    }
  });
};

export const obtenerPreapproval = async (id) => {
  const preapproval = new PreApproval(client);
  return preapproval.get({ id });
};

export const obtenerPago = async (id) => {
  const payment = new Payment(client);
  return payment.get({ id });
};
