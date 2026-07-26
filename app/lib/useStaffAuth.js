// app/lib/useStaffAuth.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { obtenerUsuarioPorId, crearUsuarioStaffHistorico } from './firestore';
import { esSuperAdmin } from './superAdmin';

// Cuentas de Firebase Auth creadas manualmente antes de que existiera la
// colección de roles. Se auto-provisionan como Admin la primera vez que
// entran (coincide con la excepción de firestore.rules).
const CUENTAS_ADMIN_HISTORICAS = ['marcosotola@gmail.com', 'spitelalan@gmail.com'];

// Guard de acceso al panel: exige que el usuario esté logueado y que su rol
// (leído desde /usuarios/{uid}) esté entre los permitidos. Redirige a /admin
// si no hay sesión, o a la ruta que corresponda a su rol si no tiene permiso.
export function useStaffAuth(rolesPermitidos = ['Admin']) {
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
        let perfil = await obtenerUsuarioPorId(currentUser.uid);

        if (!perfil && CUENTAS_ADMIN_HISTORICAS.includes(currentUser.email)) {
          await crearUsuarioStaffHistorico(currentUser.uid, currentUser.email);
          perfil = { id: currentUser.uid, email: currentUser.email, role: 'Admin', sedes: [] };
        }

        if (!perfil || !rolesPermitidos.includes(perfil.role)) {
          if (perfil?.role === 'Cliente') {
            router.push('/cuenta');
          } else if (perfil?.role === 'Tecnico') {
            router.push('/admin/proximamente');
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

  return { user, usuario, loading };
}
