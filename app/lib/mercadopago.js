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

// Crea una suscripción (preapproval) mensual. payer_email es obligatorio
// para la API de MercadoPago (sin plan asociado, rechaza la creación con
// "payer_email is required" si no se manda). Por eso el admin lo carga a
// mano antes de ser redirigido (ver AdminHeader.jsx): tiene que ser el
// email de su cuenta de MercadoPago, no el que usa para entrar al panel.
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
      payer_email: payerEmail
    }
  });
};

export const obtenerPreapproval = async (id) => {
  const preapproval = new PreApproval(client);
  return preapproval.get({ id });
};

// Cancela una preapproval existente en MercadoPago. Se usa cuando el admin
// cambia el email de pago o cuando el link guardado quedó desincronizado
// (p. ej. MercadoPago lo canceló solo y el webhook no llegó a avisarnos),
// para no dejar suscripciones huérfanas dando vueltas.
export const cancelarPreapproval = async (id) => {
  const preapproval = new PreApproval(client);
  return preapproval.update({ id, body: { status: 'cancelled' } });
};

export const obtenerPago = async (id) => {
  const payment = new Payment(client);
  return payment.get({ id });
};
