// app/api/superadmin/sesion/route.js
// Setea/borra la cookie que le permite al SuperAdmin saltear la pantalla de
// mantenimiento (ver app/lib/superAdminSesion.js y middleware.js). La cookie
// nunca es la fuente de verdad de la sesión: acá se verifica el ID token de
// Firebase y se confirma que el email coincide con SUPER_ADMIN_EMAIL antes
// de setearla.
import { NextResponse } from 'next/server';
import { adminAuth, hasAdminConfig } from '../../../lib/firebaseAdmin';
import { esSuperAdmin } from '../../../lib/superAdmin';
import {
  SUPERADMIN_COOKIE_NAME,
  SUPERADMIN_COOKIE_DURACION_MS,
  crearCookieSuperAdmin
} from '../../../lib/superAdminSesion';

export async function POST(request) {
  if (!hasAdminConfig) {
    return NextResponse.json({ error: 'El servidor no tiene configurado Firebase Admin.' }, { status: 500 });
  }

  const { token } = await request.json().catch(() => ({}));
  if (!token) {
    return NextResponse.json({ error: 'Falta el token de autenticación.' }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token, true);
  } catch (error) {
    console.error('Error al verificar el token del SuperAdmin:', error);
    return NextResponse.json({ error: 'Token inválido o expirado.' }, { status: 401 });
  }

  if (!esSuperAdmin(decodedToken.email)) {
    return NextResponse.json({ error: 'No sos el SuperAdmin.' }, { status: 403 });
  }

  const valor = crearCookieSuperAdmin();
  if (!valor) {
    return NextResponse.json(
      { error: 'El servidor no tiene configurado el bypass del SuperAdmin.' },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SUPERADMIN_COOKIE_NAME, valor, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SUPERADMIN_COOKIE_DURACION_MS / 1000
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SUPERADMIN_COOKIE_NAME);
  return response;
}
