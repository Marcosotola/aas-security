// scripts/migrar-personal.mjs
// Pasa el rol Técnico al nuevo rol Personal con perfiles de permisos.
//
// Uso (desde la raíz del proyecto, con las credenciales FIREBASE_ADMIN_*):
//   node --env-file=.env.local scripts/migrar-personal.mjs              (simulación, no escribe)
//   node --env-file=.env.local scripts/migrar-personal.mjs --confirmar  (escribe)
//
// - Crea (o reutiliza) el perfil "Técnico": OT y Mantenimiento Preventivo en
//   "propios" y el resto sin acceso, que es exactamente lo que el Técnico
//   podía hacer hasta ahora en el panel.
// - Cada usuario con role Tecnico pasa a role Personal con ese perfil.
// - Elimina las cuentas de CUENTAS_A_ELIMINAR (perfil y acceso), acordado
//   con el dueño: Admin quedan solo las cuentas de Marco y Alan.
//
// Correr DESPUÉS de publicar la app con soporte de perfiles: la versión
// anterior no deja entrar al rol Personal.
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const CUENTAS_A_ELIMINAR = ['admin@aassecurity.com'];

// Mismos módulos que app/lib/permisos.js (no se puede importar desde Node).
const MODULOS = ['presupuesto', 'remito', 'recibo', 'factura', 'certificado', 'estado', 'orden', 'mantenimiento', 'informe',
  'finanzas', 'listaPrecios', 'plantillas', 'consultas', 'empresas'];
const PERMISOS_TECNICO = Object.fromEntries(MODULOS.map((m) => [m, ['orden', 'mantenimiento'].includes(m) ? 'propios' : 'ninguno']));

const confirmar = process.argv.includes('--confirmar');
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});
const db = getFirestore(app);
const auth = getAuth(app);

const usuarios = (await db.collection('usuarios').get()).docs.map((d) => ({ id: d.id, ...d.data() }));
const perfiles = (await db.collection('perfiles').get()).docs.map((d) => ({ id: d.id, ...d.data() }));

const existente = perfiles.find((p) => p.nombre.trim().toLowerCase() === 'técnico');
const tecnicos = usuarios.filter((u) => u.role === 'Tecnico');
const aEliminar = usuarios.filter((u) => CUENTAS_A_ELIMINAR.includes((u.email || '').toLowerCase()));

console.log(`Perfil "Técnico": ${existente ? `ya existe (${existente.id})` : 'se crea'}`);
console.log(`Técnicos a pasar a Personal: ${tecnicos.map((u) => u.email).join(', ') || 'ninguno'}`);
console.log(`Cuentas a eliminar: ${aEliminar.map((u) => `${u.email} (${u.role})`).join(', ') || 'ninguna'}`);

if (!confirmar) {
  console.log('\nSimulación: no se escribió nada. Para aplicar, agregá --confirmar.');
  process.exit(0);
}

const perfilRef = existente ? db.collection('perfiles').doc(existente.id) : db.collection('perfiles').doc();
if (!existente) {
  await perfilRef.set({ nombre: 'Técnico', permisos: PERMISOS_TECNICO, fechaCreacion: FieldValue.serverTimestamp() });
}
const permisos = existente ? existente.permisos : PERMISOS_TECNICO;

for (const u of tecnicos) {
  await db.collection('usuarios').doc(u.id).update({
    role: 'Personal',
    perfilId: perfilRef.id,
    permisos,
    fechaActualizacion: FieldValue.serverTimestamp()
  });
  console.log(`- ${u.email}: Personal / Técnico`);
}

for (const u of aEliminar) {
  await auth.deleteUser(u.id).catch((e) => console.log(`  (cuenta de acceso de ${u.email}: ${e.code || e.message})`));
  await db.collection('usuarios').doc(u.id).delete();
  console.log(`- ${u.email}: eliminada`);
}

console.log('\nListo.');
