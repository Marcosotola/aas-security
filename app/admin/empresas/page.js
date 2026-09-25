// app/admin/empresas/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Search, Building2, PlusCircle, Trash, MapPin, X, ChevronRight } from 'lucide-react';
import { obtenerEmpresas, crearEmpresa, eliminarEmpresa, contarDocumentosDeEmpresa } from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';
import { buscarEmpresasSimilares, normalizarNombreEmpresa, sedesActivas } from '../../lib/empresas';
import ViewToggle from '../../components/admin/ViewToggle';
import EmpresaForm from '../../components/admin/EmpresaForm';
import { accionIconoClase, ACCION_ICONO_TAMANO } from '../../components/admin/accionIcono';

export default function EmpresasPage() {
  const router = useRouter();
  const { loading: loadingAuth } = useStaffAuth(['Admin']);
  const [empresas, setEmpresas] = useState([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [vista, setVista] = useState('tabla');
  const [creando, setCreando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

  useEffect(() => {
    if (loadingAuth) return;
    obtenerEmpresas()
      .then(setEmpresas)
      .catch(() => setEmpresas([]))
      .finally(() => setLoadingEmpresas(false));
  }, [loadingAuth]);

  const handleCrear = async (datos) => {
    const similares = buscarEmpresasSimilares(empresas, datos);
    if (similares.length > 0) {
      const nombres = similares.map((e) => `• ${e.nombre}${e.cuit ? ` (CUIT ${e.cuit})` : ''}`).join('\n');
      if (!confirm(`Ya hay empresas que parecen ser la misma:\n${nombres}\n\n¿Crear "${datos.nombre}" igual?`)) return;
    }

    setGuardando(true);
    try {
      const { id } = await crearEmpresa(datos);
      router.push(`/admin/empresas/${id}`);
    } catch (error) {
      alert('No se pudo crear la empresa. Inténtalo de nuevo.');
      setGuardando(false);
    }
  };

  const handleEliminar = async (empresa) => {
    setEliminandoId(empresa.id);
    try {
      const cantidad = await contarDocumentosDeEmpresa(empresa.id);
      if (cantidad > 0) {
        alert(`"${empresa.nombre}" tiene ${cantidad} ${cantidad === 1 ? 'documento emitido' : 'documentos emitidos'}, así que no se puede eliminar.`);
        return;
      }
      if (!confirm(`¿Eliminar la empresa "${empresa.nombre}" y todas sus sedes? La acción no se puede deshacer.`)) return;
      await eliminarEmpresa(empresa.id);
      setEmpresas((actuales) => actuales.filter((e) => e.id !== empresa.id));
    } catch (error) {
      alert('No se pudo eliminar la empresa.');
    } finally {
      setEliminandoId(null);
    }
  };

  const termino = normalizarNombreEmpresa(filtro);
  const terminoTexto = filtro.trim().toLowerCase();
  const empresasFiltradas = empresas.filter((e) => {
    if (!terminoTexto) return true;
    return normalizarNombreEmpresa(e.nombre).includes(termino)
      || e.razonSocial?.toLowerCase().includes(terminoTexto)
      || e.cuit?.includes(terminoTexto)
      || (e.sedes || []).some((s) => s.nombre?.toLowerCase().includes(terminoTexto) || s.direccion?.toLowerCase().includes(terminoTexto));
  });

  const textoSedes = (empresa) => {
    const n = sedesActivas(empresa).length;
    return n === 0 ? 'Sin sedes' : `${n} ${n === 1 ? 'sede' : 'sedes'}`;
  };

  const acciones = (empresa) => (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/admin/empresas/${empresa.id}`} title="Ver ficha" className={accionIconoClase('primary')}>
        <ChevronRight size={ACCION_ICONO_TAMANO} />
      </Link>
      <button
        type="button"
        onClick={() => handleEliminar(empresa)}
        disabled={eliminandoId === empresa.id}
        title="Eliminar"
        className={accionIconoClase('red')}
      >
        <Trash size={ACCION_ICONO_TAMANO} />
      </button>
    </div>
  );

  if (loadingAuth || loadingEmpresas) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
            <Home size={16} className="mr-1" /> Panel
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">Empresas</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold font-montserrat text-primary">Empresas</h2>
          <button
            type="button"
            onClick={() => setCreando(true)}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
          >
            <PlusCircle size={18} />
            Nueva empresa
          </button>
        </div>

        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex items-center flex-1">
              <Search size={18} className="absolute text-gray-400 left-3" />
              <input
                type="text"
                placeholder="Buscar por nombre, CUIT o sede..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <ViewToggle vista={vista} onChange={setVista} />
          </div>

          {empresas.length === 0 ? (
            <div className="py-10 text-center">
              <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Todavía no hay empresas cargadas</p>
            </div>
          ) : empresasFiltradas.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500">No hay empresas que coincidan con tu búsqueda</div>
          ) : vista === 'cards' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {empresasFiltradas.map((e) => (
                <div key={e.id} className="p-4 border border-gray-200 rounded-lg">
                  <Link href={`/admin/empresas/${e.id}`} className="block text-sm font-medium text-gray-900 hover:text-primary hover:underline">
                    {e.nombre}
                  </Link>
                  <div className="mt-1 text-sm text-gray-500">{e.razonSocial || '-'}</div>
                  <div className="mt-1 text-sm text-gray-500">{e.cuit ? `CUIT ${e.cuit}` : '-'}</div>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin size={14} /> {textoSedes(e)}
                    </span>
                    {acciones(e)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Razón social</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">CUIT</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Sedes</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {empresasFiltradas.map((e) => (
                    <tr key={e.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        <Link href={`/admin/empresas/${e.id}`} className="hover:text-primary hover:underline">{e.nombre}</Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{e.razonSocial || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{e.cuit || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{textoSedes(e)}</td>
                      <td className="px-4 py-3 text-sm text-right whitespace-nowrap">{acciones(e)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {creando && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/50 sm:items-center sm:p-4"
          onClick={() => !guardando && setCreando(false)}
        >
          <div
            className="w-full max-w-lg p-6 bg-white shadow-xl rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold font-montserrat text-primary">Nueva empresa</h3>
                <p className="text-sm text-gray-500">Después de crearla vas a poder cargar sus sedes.</p>
              </div>
              <button
                onClick={() => setCreando(false)}
                disabled={guardando}
                className="p-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            <EmpresaForm
              onGuardar={handleCrear}
              onCancelar={() => setCreando(false)}
              guardando={guardando}
              textoGuardar="Crear empresa"
            />
          </div>
        </div>
      )}
    </div>
  );
}
