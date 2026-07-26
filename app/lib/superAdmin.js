// app/lib/superAdmin.js
// El SuperAdmin es una sola cuenta identificada por email (no por el campo
// "role" de Firestore, que sigue en 'Admin' para esa cuenta): así el Admin
// nunca la ve listada como usuario, y solo ella puede tocar la suscripción
// de la app. Mismo patrón que CUENTAS_ADMIN_HISTORICAS en useStaffAuth.js.
export const SUPER_ADMIN_EMAIL = 'marcosotola@gmail.com';

export const esSuperAdmin = (email) => email === SUPER_ADMIN_EMAIL;
