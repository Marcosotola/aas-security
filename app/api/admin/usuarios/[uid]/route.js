// app/api/admin/usuarios/[uid]/route.js
import { NextResponse } from 'next/server';
import { adminAuth, adminDb, hasAdminConfig } from '../../../../lib/firebaseAdmin';

// Borra la cuenta de Firebase Auth Y el perfil de Firestore de un usuario.
// Solo el Admin SDK puede borrar cuentas de Auth: firestore.rules no tiene
// ningún poder sobre esos registros, por eso esta operación no puede hacerse
// desde el cliente (ver eliminarUsuario en app/lib/firestore.js, que solo
// borra el documento de Firestore).
export async function DELETE(request, { params }) {
  if (!hasAdminConfig) {
    return NextResponse.json(
      { error: 'El servidor no tiene configurado Firebase Admin.' },
      { status: 500 }
    );
  }

  const { uid } = await params;

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'Falta el token de autenticación.' }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return NextResponse.json({ error: 'Token inválido o expirado.' }, { status: 401 });
  }

  try {
    const solicitanteSnap = await adminDb.doc(`usuarios/${decodedToken.uid}`).get();
    if (solicitanteSnap.data()?.role !== 'Admin') {
      return NextResponse.json({ error: 'No tenés permisos para eliminar usuarios.' }, { status: 403 });
    }
  } catch (error) {
    console.error('Error al verificar el rol del solicitante:', error);
    return NextResponse.json({ error: 'No se pudo verificar el permiso.' }, { status: 500 });
  }

  if (uid === decodedToken.uid) {
    return NextResponse.json({ error: 'No podés eliminar tu propia cuenta desde acá.' }, { status: 400 });
  }

  try {
    try {
      await adminAuth.deleteUser(uid);
    } catch (error) {
      if (error.code !== 'auth/user-not-found') throw error;
    }

    await adminDb.doc(`usuarios/${uid}`).delete();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    return NextResponse.json({ error: 'No se pudo eliminar el usuario.' }, { status: 500 });
  }
}
