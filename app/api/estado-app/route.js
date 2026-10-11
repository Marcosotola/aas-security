// app/api/estado-app/route.js
// Endpoint público (sin auth) que consulta middleware.js en cada request para
// decidir si mostrar el sitio o la pantalla de mantenimiento. Usa el Admin
// SDK porque un visitante anónimo no tiene permiso para leer /config según
// firestore.rules. Cachea la respuesta unos segundos en memoria del proceso
// para no pegarle a Firestore en cada visita (el campo "bypass" no se
// cachea: depende de la cookie de cada request, no del estado global).
import { NextResponse } from 'next/server';
import { adminDb, hasAdminConfig } from '../../lib/firebaseAdmin';
import { estaBloqueada } from '../../lib/suscripcion';
import { hasMercadoPagoConfig } from '../../lib/mercadopago';
import { verificarCobroAntesDeBloquear } from '../../lib/cobroSuscripcion';
import { SUPERADMIN_COOKIE_NAME, verificarCookieSuperAdmin } from '../../lib/superAdminSesion';

const CACHE_MS = 30_000;
let cache = null;
let cacheEn = 0;

export async function GET(request) {
  const bypass = verificarCookieSuperAdmin(request.cookies.get(SUPERADMIN_COOKIE_NAME)?.value);

  // Sin Admin SDK configurado (ej. entorno local sin esas env vars): nunca
  // bloquear el sitio por un problema de configuración del servidor.
  if (!hasAdminConfig) {
    return NextResponse.json({ habilitada: true, bypass });
  }

  const ahora = Date.now();
  if (cache && ahora - cacheEn < CACHE_MS) {
    return NextResponse.json({ ...cache, bypass });
  }

  try {
    const configRef = adminDb.doc('config/suscripcion');
    let data = (await configRef.get()).data() || {};

    // Antes de bloquear por vencimiento se confirma con MercadoPago: si el
    // cobro entró y su notificación todavía no llegó, se registra acá.
    if (estaBloqueada(data) && hasMercadoPagoConfig) {
      try {
        if (await verificarCobroAntesDeBloquear(data)) {
          data = (await configRef.get()).data() || {};
        }
      } catch (error) {
        console.error('No se pudo verificar el cobro con MercadoPago:', error);
      }
    }

    cache = { habilitada: !estaBloqueada(data) };
    cacheEn = ahora;

    return NextResponse.json({ ...cache, bypass });
  } catch (error) {
    console.error('Error al consultar el estado de la app:', error);
    // Ante cualquier falla, no bloquear el sitio.
    return NextResponse.json({ habilitada: true, bypass });
  }
}
