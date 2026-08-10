// middleware.js
// Gatekeeper del sitio público: si la suscripción está vencida o el
// SuperAdmin deshabilitó la app manualmente, todo lo que no sea /admin,
// /api, /login, /registro ni /mantenimiento se reescribe a la pantalla de
// mantenimiento. El panel de administración queda siempre accesible para
// poder pagar o revisar el estado (ver /admin/suscripcion). /login y
// /registro también quedan afuera del bloqueo: son la puerta de entrada del
// panel para Admin/Técnico y del portal para Cliente, y cada uno decide
// después de loguearse qué mostrarle a ese rol (ver app/admin/layout.js y
// app/cuenta/page.js) — si se bloquearan acá, nadie podría ni siquiera
// intentar iniciar sesión. El SuperAdmin, con la cookie de bypass (ver
// app/lib/superAdminSesion.js), navega todo el sitio sin que se lo redirija.
import { NextResponse } from 'next/server';

const PREFIJOS_EXCLUIDOS = ['/admin', '/api', '/mantenimiento', '/login', '/registro'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (PREFIJOS_EXCLUIDOS.some((prefijo) => pathname === prefijo || pathname.startsWith(`${prefijo}/`))) {
    return NextResponse.next();
  }

  try {
    const res = await fetch(new URL('/api/estado-app', request.url), {
      cache: 'no-store',
      headers: { cookie: request.headers.get('cookie') || '' }
    });
    const { habilitada, bypass } = await res.json();
    if (!habilitada && !bypass) {
      const response = NextResponse.rewrite(new URL('/mantenimiento', request.url));
      response.headers.set('x-mantenimiento', '1');
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }
  } catch (error) {
    // Ante cualquier falla de red/consulta, no bloqueamos el sitio.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)'],
};
