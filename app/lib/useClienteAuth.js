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
  obtenerOrdenesTrabajoPorCliente,
  obtenerMantenimientosPreventivosPorCliente
} from './firestore';
import { nombreCuenta } from './documentosCliente';

const ClienteAuthContext = createContext(null);

const DOCUMENTOS_VACIOS = {
  presupuestos: [], remitos: [], recibos: [], facturas: [],
  certificados: [], estados: [], ordenesTrabajo: [], mantenimientosPreventivos: []
};

// Clave en `documentos` -> consulta por clienteId.
const TIPOS_CONSULTA = [
  ['presupuestos', obtenerPresupuestosPorCliente],
  ['remitos', obtenerRemitosPorCliente],
  ['recibos', obtenerRecibosPorCliente],
  ['facturas', obtenerFacturasPorCliente],
  ['certificados', obtenerCertificadosPorCliente],
  ['estados', obtenerEstadosPorCliente],
  ['ordenesTrabajo', obtenerOrdenesTrabajoPorCliente],
  ['mantenimientosPreventivos', obtenerMantenimientosPreventivosPorCliente]
];

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
  const [cuentasVinculadas, setCuentasVinculadas] = useState([]);
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

        // Cuentas vinculadas (las asigna el Admin desde la ficha del usuario):
        // esta cuenta ve también sus documentos y sedes. Si alguna se borró o
        // no se puede leer, se ignora en vez de romper todo el portal.
        const vinculadasIds = (perfilData.cuentasVinculadas || []).filter((id) => id && id !== currentUser.uid);
        const vinculadas = (await Promise.all(
          vinculadasIds.map((id) => obtenerUsuarioPorId(id).catch(() => null))
        )).filter(Boolean);

        const cuentas = [
          { id: currentUser.uid, nombre: null },
          ...vinculadas.map((c) => ({ id: c.id, nombre: nombreCuenta(c) }))
        ];

        // Una consulta por cuenta y tipo (clienteId == uid, igual que antes):
        // así las reglas de Firestore pueden validar cada consulta. Los
        // documentos de una cuenta vinculada se marcan con `cuentaNombre`
        // para mostrar de quién son (ver documentosCliente.js).
        const porCuenta = await Promise.all(cuentas.map(async ({ id, nombre }) => {
          const resultados = await Promise.all(TIPOS_CONSULTA.map(([, obtener]) => obtener(id)));
          return resultados.map((docs) => (nombre ? docs.map((d) => ({ ...d, cuentaNombre: nombre })) : docs));
        }));

        const nuevosDocumentos = Object.fromEntries(
          TIPOS_CONSULTA.map(([clave], i) => [clave, porCuenta.flatMap((resultados) => resultados[i])])
        );

        setUser(currentUser);
        setPerfil(perfilData);
        setCuentasVinculadas(vinculadas);
        setDocumentos(nuevosDocumentos);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar la cuenta del cliente:', error);
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <ClienteAuthContext.Provider value={{ user, perfil, setPerfil, documentos, cuentasVinculadas, loading }}>
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
