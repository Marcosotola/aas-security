'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { obtenerConfigSuscripcion } from '../lib/firestore';
import { estaBloqueada } from '../lib/suscripcion';
import { esSuperAdmin } from '../lib/superAdmin';
import { resolverPerfilStaff } from '../lib/useStaffAuth';
import AdminHeader from '../components/admin/AdminHeader';
import MantenimientoAviso from '../components/MantenimientoAviso';

// Layout compartido por todo /admin/*: agrega un navegador persistente entre
// módulos (presupuestos, remitos, recibos, etc.) para no tener que volver al
// panel cada vez. La pantalla de login (/admin) queda sin este header.
//
// También es el gatekeeper de rol durante una suscripción vencida: el Admin
// entra igual y ve el modal de pago (ver AdminHeader), pero un Técnico (o
// cualquier otro rol no-Admin) ve la misma pantalla de mantenimiento que el
// sitio público, en vez de acceso normal al panel. El SuperAdmin nunca se
// bloquea (ver app/lib/superAdmin.js) y además navega el sitio público con
// la cookie de bypass (ver app/lib/superAdminSesion.js).
export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const esLogin = pathname === '/admin';

  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [suscripcionVencida, setSuscripcionVencida] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setRol(null);
      return;
    }
    resolverPerfilStaff(user.uid, user.email)
      .then((perfil) => setRol(perfil?.role || null))
      .catch(() => setRol(null));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    obtenerConfigSuscripcion()
      .then((config) => setSuscripcionVencida(estaBloqueada(config)))
      .catch(() => {});
  }, [user]);

  if (esLogin) {
    return children;
  }

  const bloqueadoPorMantenimiento =
    Boolean(user) && suscripcionVencida && Boolean(rol) && rol !== 'Admin' && !esSuperAdmin(user.email);

  if (bloqueadoPorMantenimiento) {
    return <MantenimientoAviso />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} suscripcionVencida={suscripcionVencida} />
      {children}
    </div>
  );
}
