'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FilePlus, Wrench, Home, Search, Download, Eye, Edit, Trash } from 'lucide-react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { eliminarMantenimientoPreventivo } from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';
import DescargarMantenimientoPreventivoPDF from '../../components/pdf/DescargarMantenimientoPreventivoPDF';
import ViewToggle from '../../components/admin/ViewToggle';
import SedeLink from '../../components/admin/SedeLink';
import { accionIconoClase, ACCION_ICONO_TAMANO } from '../../components/admin/accionIcono';
import { formatearFecha } from '../../lib/fecha';

export default function HistorialMantenimientosPreventivos() {
  const { user, usuario, loading: loadingAuth } = useStaffAuth(['Admin', 'Tecnico']);
  const [loadingData, setLoadingData] = useState(true);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [vista, setVista] = useState('tabla');
  const loading = loadingAuth || loadingData;
  const esTecnico = usuario?.role === 'Tecnico';

  useEffect(() => {
    if (!user || !usuario) return;
    cargarMantenimientos().then(() => setLoadingData(false));
  }, [user, usuario]);

  // El Técnico solo ve los mantenimientos que él mismo creó (mismo criterio
  // que firestore.rules); el Admin ve todos. La query del Técnico no lleva
  // orderBy junto al where (evita depender de un índice compuesto) y se
  // ordena en el cliente.
  const cargarMantenimientos = async () => {
    try {
      const mantenimientosRef = collection(db, 'mantenimientosPreventivos');
      if (esTecnico) {
        const q = query(mantenimientosRef, where('usuarioCreador', '==', user.email));
        const querySnapshot = await getDocs(q);
        const datos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        datos.sort((a, b) => (b.fechaCreacion?.toMillis?.() || 0) - (a.fechaCreacion?.toMillis?.() || 0));
        setMantenimientos(datos);
      } else {
        const q = query(mantenimientosRef, orderBy('fechaCreacion', 'desc'));
        const querySnapshot = await getDocs(q);
        setMantenimientos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (error) {
      console.error('Error al cargar mantenimientos preventivos:', error);
      setMantenimientos([]);
    }
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este mantenimiento preventivo? También se borrarán sus fotos.')) {
      try {
        await eliminarMantenimientoPreventivo(id);
        setMantenimientos(mantenimientos.filter(m => m.id !== id));
      } catch (error) {
        console.error('Error al eliminar el mantenimiento preventivo:', error);
        alert('Error al eliminar el mantenimiento preventivo. Inténtelo de nuevo más tarde.');
      }
    }
  };

  const mantenimientosFiltrados = mantenimientos.filter((mantenimiento) => {
    if (!filtro) return true;
    const terminoBusqueda = filtro.toLowerCase();
    return (
      mantenimiento.numero?.toLowerCase().includes(terminoBusqueda) ||
      mantenimiento.cliente?.nombre?.toLowerCase().includes(terminoBusqueda) ||
      mantenimiento.cliente?.empresa?.toLowerCase().includes(terminoBusqueda)
    );
  });

  if (loading) {
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
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center mb-4">
            <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
              <Home size={16} className="mr-1" /> Panel
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Mantenimiento Preventivo</span>
          </div>

          <Link
            href="/admin/mantenimiento-preventivo/nueva"
            className="flex items-center px-4 py-2 mb-4 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
          >
            <FilePlus size={18} className="mr-2" /> Nuevo Mantenimiento Preventivo
          </Link>
        </div>

        <h2 className="mb-1 text-2xl font-bold font-montserrat text-primary">
          Mantenimiento Preventivo
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          {esTecnico ? 'Mostrando solo los mantenimientos preventivos que vos creaste.' : ' '}
        </p>

        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex items-center flex-1">
              <Search size={18} className="absolute text-gray-400 left-3" />
              <input
                type="text"
                placeholder="Buscar por número, cliente o empresa..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <ViewToggle vista={vista} onChange={setVista} />
          </div>

          {vista === 'cards' ? (
            mantenimientosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mantenimientosFiltrados.map((mantenimiento) => (
                  <div key={mantenimiento.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="mb-1">
                      <SedeLink empresaId={mantenimiento.empresaId} sedeId={mantenimiento.sedeId} sede={mantenimiento.cliente?.sedeNombre} />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium text-gray-900">{mantenimiento.numero}</div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {mantenimiento.fechaCreacion
                          ? new Date(mantenimiento.fechaCreacion.toDate()).toLocaleDateString('es-AR')
                          : mantenimiento.fecha
                            ? formatearFecha(mantenimiento.fecha)
                            : 'No disponible'}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-900">{mantenimiento.cliente?.nombre || 'N/A'}</div>
                    <div className="mt-1 text-sm text-gray-500">{mantenimiento.cliente?.empresa || 'N/A'}</div>
                    {!esTecnico && mantenimiento.usuarioCreador && (
                      <div className="text-xs text-gray-400">Técnico: {mantenimiento.usuarioCreador}</div>
                    )}
                    <div className="mt-2 text-sm text-gray-500">{mantenimiento.fotos?.length || 0} foto(s)</div>

                    <div className="flex justify-end pt-3 mt-3 gap-1 border-t border-gray-100">
                      <Link
                        href={`/admin/mantenimiento-preventivo/${mantenimiento.id}`}
                        title="Ver detalles"
                        className={accionIconoClase('gray')}
                      >
                        <Eye size={ACCION_ICONO_TAMANO} />
                      </Link>
                      <DescargarMantenimientoPreventivoPDF mantenimiento={mantenimiento} className={accionIconoClase('primary')}>
                        <Download size={ACCION_ICONO_TAMANO} />
                      </DescargarMantenimientoPreventivoPDF>
                      <Link
                        href={`/admin/mantenimiento-preventivo/editar/${mantenimiento.id}`}
                        title="Editar"
                        className={accionIconoClase('secondary')}
                      >
                        <Edit size={ACCION_ICONO_TAMANO} />
                      </Link>
                      <button
                        onClick={() => handleEliminar(mantenimiento.id)}
                        title="Eliminar"
                        className={accionIconoClase('red')}
                      >
                        <Trash size={ACCION_ICONO_TAMANO} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                No hay mantenimientos preventivos que coincidan con su búsqueda
              </div>
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Sede</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Número</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Cliente</th>
                    {!esTecnico && (
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Técnico</th>
                    )}
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fotos</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mantenimientosFiltrados.length > 0 ? (
                    mantenimientosFiltrados.map((mantenimiento) => (
                      <tr key={mantenimiento.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <SedeLink empresaId={mantenimiento.empresaId} sedeId={mantenimiento.sedeId} sede={mantenimiento.cliente?.sedeNombre} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{mantenimiento.numero}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {mantenimiento.fechaCreacion
                              ? new Date(mantenimiento.fechaCreacion.toDate()).toLocaleDateString('es-AR')
                              : mantenimiento.fecha
                                ? formatearFecha(mantenimiento.fecha)
                                : 'No disponible'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{mantenimiento.cliente?.nombre || 'N/A'}</div>
                          <div className="text-xs text-gray-400">{mantenimiento.cliente?.empresa || ''}</div>
                        </td>
                        {!esTecnico && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{mantenimiento.usuarioCreador || '-'}</div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{mantenimiento.fotos?.length || 0}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1">
                            <Link
                              href={`/admin/mantenimiento-preventivo/${mantenimiento.id}`}
                              title="Ver detalles"
                              className={accionIconoClase('gray')}
                            >
                              <Eye size={ACCION_ICONO_TAMANO} />
                            </Link>
                            <DescargarMantenimientoPreventivoPDF mantenimiento={mantenimiento} className={accionIconoClase('primary')}>
                              <Download size={ACCION_ICONO_TAMANO} />
                            </DescargarMantenimientoPreventivoPDF>
                            <Link
                              href={`/admin/mantenimiento-preventivo/editar/${mantenimiento.id}`}
                              title="Editar"
                              className={accionIconoClase('secondary')}
                            >
                              <Edit size={ACCION_ICONO_TAMANO} />
                            </Link>
                            <button
                              onClick={() => handleEliminar(mantenimiento.id)}
                              title="Eliminar"
                              className={accionIconoClase('red')}
                            >
                              <Trash size={ACCION_ICONO_TAMANO} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={esTecnico ? 6 : 7} className="px-6 py-4 text-center text-gray-500">
                        No hay mantenimientos preventivos que coincidan con su búsqueda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {mantenimientosFiltrados.length === 0 && filtro && (
            <div className="py-10 text-center">
              <Wrench size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-gray-500">No hay mantenimientos preventivos que coincidan con su búsqueda</p>
              <p className="text-sm text-gray-400">Intente con otros términos o cree un nuevo mantenimiento preventivo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
