'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { esSuperAdmin } from '../lib/superAdmin';
import { resolverPerfilStaff } from '../lib/useStaffAuth';
import AdminHeader from '../components/admin/AdminHeader';
import MantenimientoAviso from '../components/MantenimientoAviso';

// Layout compartido por todo /admin/*: agrega un navegador persistente entre
// módulos (presupuestos, remitos, recibos, etc.) para no tener que volver al
// panel cada vez. La pantalla de login (/admin) queda sin este header.
//
// También es el gatekeeper de rol durante una suscripción vencida: el Admin
// solo ve el aviso de pago (ver AdminHeader) y la pantalla de Suscripción,
// sin acceso al resto del panel, pero un Técnico (o
// cualquier otro rol no-Admin) ve la misma pantalla de mantenimiento que el
// sitio público, en vez de acceso normal al panel. El SuperAdmin nunca se
// bloquea (ver app/lib/superAdmin.js) y además navega el sitio público con
// la cookie de bypass (ver app/lib/superAdminSesion.js).
export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const esLogin = pathname === '/admin';

  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const rol = perfil?.role || null;
  const [suscripcionVencida, setSuscripcionVencida] = useState(false);
  // Hasta saber el rol y el estado de la suscripción no se muestra el panel:
  // si no, durante esos primeros instantes un Admin con la suscripción
  // vencida (o un Personal) podría usarlo antes de que se active el bloqueo.
  const [perfilCargado, setPerfilCargado] = useState(false);
  const [estadoCargado, setEstadoCargado] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setPerfil(null);
      setPerfilCargado(false);
      return;
    }
    resolverPerfilStaff(user.uid, user.email)
      .then((p) => setPerfil(p || null))
      .catch(() => setPerfil(null))
      .finally(() => setPerfilCargado(true));
  }, [user]);

  // Vía /api/estado-app (Admin SDK, sin auth) en vez de leer
  // config/suscripcion directo desde el cliente: firestore.rules solo deja
  // leer ese doc a Admin, así que un Técnico nunca podría enterarse de que
  // está vencida y el bloqueo de abajo no se activaría nunca.
  useEffect(() => {
    if (!user) {
      setEstadoCargado(false);
      return;
    }
    fetch('/api/estado-app', { cache: 'no-store' })
      .then((res) => res.json())
      .then(({ habilitada }) => setSuscripcionVencida(!habilitada))
      .catch(() => {})
      .finally(() => setEstadoCargado(true));
  }, [user]);

  if (esLogin) {
    return children;
  }

  const superAdmin = Boolean(user) && esSuperAdmin(user.email);

  if (user && !superAdmin && (!perfilCargado || !estadoCargado)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  const bloqueadoPorMantenimiento =
    Boolean(user) && suscripcionVencida && Boolean(rol) && rol !== 'Admin' && !superAdmin;

  if (bloqueadoPorMantenimiento) {
    return <MantenimientoAviso />;
  }

  // Con la suscripción vencida, el Admin no puede usar el panel: solo ve el
  // aviso para ir a pagar (lo muestra AdminHeader) y, si quiere, la pantalla
  // de Suscripción con el detalle. Las páginas del panel no se renderizan, así
  // que tampoco cargan datos por debajo del aviso.
  const soloPago =
    Boolean(user) && suscripcionVencida && rol === 'Admin' && !superAdmin && pathname !== '/admin/suscripcion';

  if (soloPago) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader user={user} perfil={perfil} suscripcionVencida={suscripcionVencida} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0">
      <AdminHeader user={user} perfil={perfil} suscripcionVencida={suscripcionVencida} />
      {children}
    </div>
  );
}
