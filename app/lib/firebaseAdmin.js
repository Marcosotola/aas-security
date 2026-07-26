// app/lib/firebaseAdmin.js
// Uso exclusivo en server (API routes): permite operaciones que las reglas de
// Firestore no pueden cubrir, como borrar una cuenta de Firebase Auth. Nunca
// importar este archivo desde un componente 'use client'.
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const hasAdminConfig = Boolean(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  process.env.FIREBASE_ADMIN_PRIVATE_KEY
);

let adminAuth;
let adminDb;

if (hasAdminConfig) {
  const nombre = 'admin';
  const app = getApps().find((a) => a.name === nombre) || initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // Las env vars no soportan saltos de línea reales: la private key se
      // pega con "\n" literales y hay que revertirlos antes de usarla.
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  }, nombre);
  adminAuth = getAuth(app);
  adminDb = getFirestore(app);
} else {
  console.warn('Firebase Admin no está configurado. Define FIREBASE_ADMIN_* para habilitar operaciones server-side (p. ej. borrar cuentas de usuario).');
}

export { adminAuth, adminDb, hasAdminConfig };
