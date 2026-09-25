// app/lib/useStaffAuth.js
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { obtenerUsuarioPorId, crearUsuarioStaffHistorico } from './firestore';
import { esSuperAdmin } from './superAdmin';
import { puede, esInterno, esAdmin as esAdminPerfil } from './permisos';

// Cuentas de Firebase Auth creadas manualmente antes de que existiera la
// colección de roles. Se auto-provisionan como Admin la primera vez que
// entran (coincide con la excepción de firestore.rules).
const CUENTAS_ADMIN_HISTORICAS = ['marcosotola@gmail.com', 'spitelalan@gmail.com'];

// Resuelve el perfil (y por lo tanto el rol) de una cuenta de staff. Vive
// acá afuera del hook porque también lo usa app/admin/layout.js para decidir
// si, con la suscripción vencida, un Técnico (o cualquier rol no-Admin) ve
// el panel o la pantalla de mantenimiento.
export async function resolverPerfilStaff(uid, email) {
  let perfil = await obtenerUsuarioPorId(uid);

  if (!perfil && CUENTAS_ADMIN_HISTORICAS.includes(email)) {
    await crearUsuarioStaffHistorico(uid, email);
    perfil = { id: uid, email, role: 'Admin', sedes: [] };
  }

  return perfil;
}

// Si el perfil cumple lo que pide la página:
// - 'admin': solo Admin.
// - 'interno': cualquier persona del panel (Admin, Personal, Técnico).
// - { modulo, accion }: según sus permisos (ver app/lib/permisos.js).
function cumple(perfil, requisito) {
  if (requisito === 'admin') return esAdminPerfil(perfil);
  if (requisito === 'interno') return esInterno(perfil);
  return puede(perfil, requisito.modulo, requisito.accion);
}

// Guard de acceso al panel: exige que el usuario esté logueado y que cumpla
// el requisito de la página. Redirige a /admin si no hay sesión, al portal
// si es un cliente, o al panel si es personal sin permiso para esta página.
// Devuelve también `puede(modulo, accion, doc)` para mostrar u ocultar
// acciones (Nuevo, Editar, Eliminar) según sus permisos.
export function useStaffAuth(requisito = 'admin') {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/admin');
        return;
      }

      try {
        const perfil = await resolverPerfilStaff(currentUser.uid, currentUser.email);

        if (!perfil || !cumple(perfil, requisito)) {
          if (perfil?.role === 'Cliente') {
            router.push('/cuenta');
          } else if (esInterno(perfil)) {
            router.push('/admin/dashboard');
          } else {
            router.push('/admin');
          }
          return;
        }

        setUser(currentUser);
        setUsuario({ ...perfil, esSuperAdmin: esSuperAdmin(currentUser.email) });
        setLoading(false);
      } catch (error) {
        console.error('Error al verificar el rol del usuario:', error);
        router.push('/admin');
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const puedeUsuario = useCallback(
    (modulo, accion, doc = null) => puede(usuario, modulo, accion, doc),
    [usuario]
  );

  return { user, usuario, loading, puede: puedeUsuario };
}
