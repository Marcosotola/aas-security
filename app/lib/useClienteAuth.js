// app/lib/useClienteAuth.js
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { obtenerUsuarioPorId, obtenerEmpresaPorId, obtenerDocumentosConAcceso } from './firestore';
import { TIPOS_DOC } from './documentosCliente';

const ClienteAuthContext = createContext(null);

// Clave en `documentos` -> tipo de TIPOS_DOC.
const CLAVES = {
  presupuestos: 'presupuesto',
  remitos: 'remito',
  recibos: 'recibo',
  facturas: 'factura',
  certificados: 'certificado',
  estados: 'estado',
  ordenesTrabajo: 'orden',
  mantenimientosPreventivos: 'mantenimiento',
  informes: 'informe'
};

const DOCUMENTOS_VACIOS = Object.fromEntries(Object.keys(CLAVES).map((clave) => [clave, []]));

// Para cada tipo, qué sedes de la empresa puede ver: null = todas (acceso
// '*'), o la lista de sedeIds. Los tipos sin ninguna sede no aparecen.
function sedesPorTipo(porSede) {
  const resultado = {};
  for (const tipo of Object.keys(TIPOS_DOC)) {
    if ((porSede['*'] || []).includes(tipo)) {
      resultado[tipo] = null;
      continue;
    }
    const sedes = Object.entries(porSede).filter(([id, tipos]) => id !== '*' && tipos.includes(tipo)).map(([id]) => id);
    if (sedes.length > 0) resultado[tipo] = sedes;
  }
  return resultado;
}

// Gatekeeper + fuente de datos única de /cuenta/*: resuelve sesión, perfil,
// las empresas a las que tiene acceso y sus documentos una sola vez en el
// layout, para que cada página (Inicio, Documentos, Sedes, Perfil) los
// consuma vía useCliente() sin repetir la lectura a Firestore en cada
// navegación. Qué documentos ve lo deciden sus `accesos` (empresa → sede →
// tipos), que asigna el Admin desde la ficha del usuario.
export function ClienteAuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [documentos, setDocumentos] = useState(DOCUMENTOS_VACIOS);
  const [empresas, setEmpresas] = useState([]);
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

        // Empresas con algún acceso. Si alguna se borró o no se puede leer,
        // se ignora en vez de romper todo el portal.
        const accesos = perfilData.accesos || {};
        const empresasData = (await Promise.all(
          Object.keys(accesos).map((id) => obtenerEmpresaPorId(id).catch(() => null))
        )).filter(Boolean);

        // Por empresa: las sedes visibles (con los tipos habilitados en cada
        // una) y los documentos de cada tipo que puede ver.
        const variasEmpresas = empresasData.length > 1;
        const porEmpresa = await Promise.all(empresasData.map(async (empresa) => {
          const porSede = accesos[empresa.id] || {};
          const tipos = sedesPorTipo(porSede);
          const nombreSede = new Map((empresa.sedes || []).map((s) => [s.id, s.nombre]));

          const resultados = await Promise.all(Object.entries(CLAVES).map(async ([clave, tipo]) => {
            if (!(tipo in tipos)) return [clave, []];
            const docs = await obtenerDocumentosConAcceso(tipo, empresa.id, tipos[tipo]).catch((error) => {
              console.error(`Error al cargar ${clave} de ${empresa.nombre}:`, error);
              return [];
            });
            // Nombre de sede actual de la empresa (no el que quedó copiado en
            // el documento) y, si ve más de una empresa, también cuál.
            return [clave, docs.map((d) => ({
              ...d,
              sedeActual: nombreSede.get(d.sedeId) || null,
              empresaNombre: variasEmpresas ? empresa.nombre : null
            }))];
          }));

          const tiposTodas = porSede['*'] || [];
          const sedes = (empresa.sedes || [])
            .map((s) => ({ ...s, tipos: [...new Set([...tiposTodas, ...(porSede[s.id] || [])])] }))
            .filter((s) => s.tipos.length > 0 && (s.activa !== false || (porSede[s.id] || []).length > 0));

          return { empresa: { id: empresa.id, nombre: empresa.nombre, sedes }, resultados };
        }));

        const nuevosDocumentos = Object.fromEntries(Object.keys(CLAVES).map((clave) => [
          clave,
          porEmpresa.flatMap(({ resultados }) => resultados.find(([c]) => c === clave)[1])
        ]));

        setUser(currentUser);
        setPerfil(perfilData);
        setEmpresas(porEmpresa.map(({ empresa }) => empresa));
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
    <ClienteAuthContext.Provider value={{ user, perfil, setPerfil, documentos, empresas, loading }}>
      {children}
    </ClienteAuthContext.Provider>
  );
}

// Hook de acceso para las páginas de /cuenta/*: expone user/perfil/documentos
// y las empresas (con sus sedes visibles) ya resueltos por
// ClienteAuthProvider (ver app/cuenta/layout.js).
export function useCliente() {
  const ctx = useContext(ClienteAuthContext);
  if (!ctx) throw new Error('useCliente debe usarse dentro de /cuenta (falta ClienteAuthProvider)');
  return ctx;
}
