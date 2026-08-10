// app/lib/superAdminSesion.js
// Cookie de sesión del SuperAdmin: le permite saltear la pantalla de
// mantenimiento sin depender de Firebase Auth en middleware.js, que corre en
// Edge y no puede verificar un ID token contra el Admin SDK. No es un JWT
// (no hace falta una librería aparte para firmar un solo campo): el valor es
// "<expMs>.<firma>", firmado con HMAC-SHA256 sobre SUPERADMIN_COOKIE_SECRET
// y verificado con timingSafeEqual para evitar timing attacks. Server-only:
// nunca importar desde un componente 'use client'.
import { createHmac, timingSafeEqual } from 'crypto';

export const SUPERADMIN_COOKIE_NAME = 'aas_superadmin';
export const SUPERADMIN_COOKIE_DURACION_MS = 8 * 60 * 60 * 1000; // 8 horas

const firmar = (expMs, secret) => createHmac('sha256', secret).update(String(expMs)).digest('hex');

// Sin SUPERADMIN_COOKIE_SECRET configurado, siempre false: nunca queremos
// que un server mal configurado habilite el bypass por accidente.
export const crearCookieSuperAdmin = () => {
  const secret = process.env.SUPERADMIN_COOKIE_SECRET;
  if (!secret) return null;
  const expMs = Date.now() + SUPERADMIN_COOKIE_DURACION_MS;
  return `${expMs}.${firmar(expMs, secret)}`;
};

export const verificarCookieSuperAdmin = (valor) => {
  const secret = process.env.SUPERADMIN_COOKIE_SECRET;
  if (!secret || !valor) return false;

  const [expStr, firma] = valor.split('.');
  const expMs = Number(expStr);
  if (!expStr || !firma || !Number.isFinite(expMs)) return false;
  if (Date.now() > expMs) return false;

  const esperada = Buffer.from(firmar(expMs, secret));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length) return false;

  try {
    return timingSafeEqual(esperada, recibida);
  } catch {
    return false;
  }
};
