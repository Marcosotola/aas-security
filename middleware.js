// middleware.js
// Gatekeeper del sitio público: si la suscripción está vencida o el
// SuperAdmin deshabilitó la app manualmente, todo lo que no sea /admin,
// /api ni /mantenimiento se reescribe a la pantalla de mantenimiento.
// El panel de administración queda siempre accesible para poder pagar o
// revisar el estado (ver /admin/suscripcion).
import { NextResponse } from 'next/server';

const PREFIJOS_EXCLUIDOS = ['/admin', '/api', '/mantenimiento'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (PREFIJOS_EXCLUIDOS.some((prefijo) => pathname === prefijo || pathname.startsWith(`${prefijo}/`))) {
    return NextResponse.next();
  }

  try {
    const res = await fetch(new URL('/api/estado-app', request.url), { cache: 'no-store' });
    const { habilitada } = await res.json();
    if (!habilitada) {
      return NextResponse.rewrite(new URL('/mantenimiento', request.url));
    }
  } catch (error) {
    // Ante cualquier falla de red/consulta, no bloqueamos el sitio.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)'],
};
