// lib/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app;
let auth;
let db;
let storage;

if (hasFirebaseConfig) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  console.warn('Firebase no está configurado. Define NEXT_PUBLIC_FIREBASE_* para habilitar la conexión.');
}

// Instancia secundaria de Firebase: permite crear una cuenta de Firebase Auth
// (p. ej. un Admin dando de alta un Cliente desde el panel) sin reemplazar la
// sesión de quien está logueado en la app principal, ya que
// createUserWithEmailAndPassword inicia sesión automáticamente con la cuenta
// recién creada en la instancia de auth que se le pase.
export const getAppSecundaria = () => {
  if (!hasFirebaseConfig) throw new Error('Firebase no está configurado');
  const nombre = 'Secundaria';
  const appSecundaria = getApps().find((a) => a.name === nombre) || initializeApp(firebaseConfig, nombre);
  return {
    auth: getAuth(appSecundaria),
    db: getFirestore(appSecundaria)
  };
};

export { auth, db, storage };
export default app;