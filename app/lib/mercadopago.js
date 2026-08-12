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

// Crea una suscripción (preapproval) mensual. Nunca mandamos payer_email:
// si se manda, MercadoPago exige que el checkout se autorice con esa cuenta
// puntual y, si el navegador ya tiene otra cuenta logueada en MercadoPago,
// rechaza el pago con un error de "la cuenta no coincide" sin dar forma de
// resolverlo desde acá. Sin payer_email, el link lo puede autorizar
// cualquier cuenta que esté logueada (o se loguee) en MercadoPago al abrirlo.
export const crearPreapproval = async ({ monto, backUrl, reason }) => {
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
      external_reference: 'aas-security-suscripcion'
    }
  });
};

export const obtenerPreapproval = async (id) => {
  const preapproval = new PreApproval(client);
  return preapproval.get({ id });
};

// Cancela una preapproval existente en MercadoPago. Se usa para dar de baja
// links viejos creados con payer_email (de antes de este arreglo), que
// quedan rechazando pagos por "cuenta no coincide" y hay que reemplazar por
// uno sin esa restricción.
export const cancelarPreapproval = async (id) => {
  const preapproval = new PreApproval(client);
  return preapproval.update({ id, body: { status: 'cancelled' } });
};

export const obtenerPago = async (id) => {
  const payment = new Payment(client);
  return payment.get({ id });
};
