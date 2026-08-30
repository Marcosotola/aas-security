// app/lib/useClienteAuth.js
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import {
  obtenerUsuarioPorId,
  obtenerPresupuestosPorCliente,
  obtenerRemitosPorCliente,
  obtenerRecibosPorCliente,
  obtenerFacturasPorCliente,
  obtenerCertificadosPorCliente,
  obtenerEstadosPorCliente,
  obtenerOrdenesTrabajoPorCliente
} from './firestore';

const ClienteAuthContext = createContext(null);

const DOCUMENTOS_VACIOS = {
  presupuestos: [], remitos: [], recibos: [], facturas: [],
  certificados: [], estados: [], ordenesTrabajo: []
};

// Gatekeeper + fuente de datos única de /cuenta/*: resuelve sesión, perfil y
// los 7 tipos de documento del cliente una sola vez en el layout, para que
// cada página (Inicio, Documentos, Sedes, Perfil) los consuma vía useCliente()
// sin repetir la lectura a Firestore en cada navegación. Mismo criterio de
// guard que useStaffAuth.js para /admin, pero centralizado en vez de por
// página porque acá casi todas las pantallas necesitan el mismo perfil/sedes.
export function ClienteAuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [documentos, setDocumentos] = useState(DOCUMENTOS_VACIOS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      try {
        const perfilData = await obtenerUsuarioPorId(currentUser.uid);

        if (!perfilData) {
          router.push('/registro/datos');
          return;
        }
        if (perfilData.role !== 'Cliente') {
          router.push('/admin/dashboard');
          return;
        }
        if (!perfilData.perfilCompleto) {
          router.push('/registro/datos');
          return;
        }

        const [presupuestos, remitos, recibos, facturas, certificados, estados, ordenesTrabajo] = await Promise.all([
          obtenerPresupuestosPorCliente(currentUser.uid),
          obtenerRemitosPorCliente(currentUser.uid),
          obtenerRecibosPorCliente(currentUser.uid),
          obtenerFacturasPorCliente(currentUser.uid),
          obtenerCertificadosPorCliente(currentUser.uid),
          obtenerEstadosPorCliente(currentUser.uid),
          obtenerOrdenesTrabajoPorCliente(currentUser.uid)
        ]);

        setUser(currentUser);
        setPerfil(perfilData);
        setDocumentos({ presupuestos, remitos, recibos, facturas, certificados, estados, ordenesTrabajo });
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar la cuenta del cliente:', error);
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <ClienteAuthContext.Provider value={{ user, perfil, setPerfil, documentos, loading }}>
      {children}
    </ClienteAuthContext.Provider>
  );
}

// Hook de acceso para las páginas de /cuenta/*: expone user/perfil/documentos
// ya resueltos por ClienteAuthProvider (ver app/cuenta/layout.js).
export function useCliente() {
  const ctx = useContext(ClienteAuthContext);
  if (!ctx) throw new Error('useCliente debe usarse dentro de /cuenta (falta ClienteAuthProvider)');
  return ctx;
}
