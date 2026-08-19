'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FilePlus, ClipboardList, Home, Search, Download, Eye, Edit, Trash, MapPin } from 'lucide-react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { eliminarOrdenTrabajo } from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';
import DescargarOrdenTrabajoPDF from '../../components/pdf/DescargarOrdenTrabajoPDF';
import ViewToggle from '../../components/admin/ViewToggle';
import { formatearFecha } from '../../lib/fecha';

export default function HistorialOrdenesTrabajo() {
  const { user, usuario, loading: loadingAuth } = useStaffAuth(['Admin', 'Tecnico']);
  const [loadingData, setLoadingData] = useState(true);
  const [ordenes, setOrdenes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [vista, setVista] = useState('tabla');
  const loading = loadingAuth || loadingData;
  const esTecnico = usuario?.role === 'Tecnico';

  useEffect(() => {
    if (!user || !usuario) return;
    cargarOrdenes().then(() => setLoadingData(false));
  }, [user, usuario]);

  // El Técnico solo ve las OT que él mismo creó (mismo criterio que
  // firestore.rules); el Admin ve todas. La query del Técnico no lleva
  // orderBy junto al where (evita depender de un índice compuesto) y se
  // ordena en el cliente.
  const cargarOrdenes = async () => {
    try {
      const ordenesRef = collection(db, 'ordenesTrabajo');
      if (esTecnico) {
        const q = query(ordenesRef, where('usuarioCreador', '==', user.email));
        const querySnapshot = await getDocs(q);
        const datos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        datos.sort((a, b) => (b.fechaCreacion?.toMillis?.() || 0) - (a.fechaCreacion?.toMillis?.() || 0));
        setOrdenes(datos);
      } else {
        const q = query(ordenesRef, orderBy('fechaCreacion', 'desc'));
        const querySnapshot = await getDocs(q);
        setOrdenes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (error) {
      console.error('Error al cargar órdenes de trabajo:', error);
      setOrdenes([]);
    }
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar esta orden de trabajo? También se borrarán sus fotos.')) {
      try {
        await eliminarOrdenTrabajo(id);
        setOrdenes(ordenes.filter(o => o.id !== id));
      } catch (error) {
        console.error('Error al eliminar la orden de trabajo:', error);
        alert('Error al eliminar la orden de trabajo. Inténtelo de nuevo más tarde.');
      }
    }
  };

  const ordenesFiltradas = ordenes.filter((orden) => {
    if (!filtro) return true;
    const terminoBusqueda = filtro.toLowerCase();
    return (
      orden.numero?.toLowerCase().includes(terminoBusqueda) ||
      orden.cliente?.nombre?.toLowerCase().includes(terminoBusqueda) ||
      orden.cliente?.empresa?.toLowerCase().includes(terminoBusqueda)
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
            <span className="text-gray-700">Órdenes de Trabajo</span>
          </div>

          <Link
            href="/admin/ordenes-trabajo/nueva"
            className="flex items-center px-4 py-2 mb-4 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
          >
            <FilePlus size={18} className="mr-2" /> Nueva Orden de Trabajo
          </Link>
        </div>

        <h2 className="mb-1 text-2xl font-bold font-montserrat text-primary">
          Órdenes de Trabajo
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          {esTecnico ? 'Mostrando solo las órdenes de trabajo que vos creaste.' : ' '}
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
            ordenesFiltradas.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ordenesFiltradas.map((orden) => (
                  <div key={orden.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium text-gray-900">{orden.numero}</div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {orden.fechaCreacion
                          ? new Date(orden.fechaCreacion.toDate()).toLocaleDateString('es-AR')
                          : orden.fecha
                            ? formatearFecha(orden.fecha)
                            : 'No disponible'}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-900">{orden.cliente?.nombre || 'N/A'}</div>
                    {orden.cliente?.sedeNombre && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-xs font-semibold text-blue-700 border border-blue-200 rounded-full bg-blue-50">
                        <MapPin size={11} />
                        {orden.cliente.sedeNombre}
                      </div>
                    )}
                    <div className="mt-1 text-sm text-gray-500">{orden.cliente?.empresa || 'N/A'}</div>
                    {!esTecnico && orden.usuarioCreador && (
                      <div className="text-xs text-gray-400">Técnico: {orden.usuarioCreador}</div>
                    )}
                    <div className="mt-2 text-sm text-gray-500">{orden.fotos?.length || 0} foto(s)</div>

                    <div className="flex justify-end pt-3 mt-3 space-x-4 border-t border-gray-100">
                      <Link
                        href={`/admin/ordenes-trabajo/${orden.id}`}
                        title="Ver detalles"
                        className="text-gray-600 hover:text-primary"
                      >
                        <Eye size={18} />
                      </Link>
                      <DescargarOrdenTrabajoPDF orden={orden} className="text-primary hover:text-primary-light">
                        <Download size={18} />
                      </DescargarOrdenTrabajoPDF>
                      <Link
                        href={`/admin/ordenes-trabajo/editar/${orden.id}`}
                        title="Editar"
                        className="text-secondary hover:text-secondary-light"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleEliminar(orden.id)}
                        title="Eliminar"
                        className="text-red-500 cursor-pointer hover:text-red-700"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                No hay órdenes de trabajo que coincidan con su búsqueda
              </div>
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Número</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Cliente</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Sede</th>
                    {!esTecnico && (
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Técnico</th>
                    )}
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fotos</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordenesFiltradas.length > 0 ? (
                    ordenesFiltradas.map((orden) => (
                      <tr key={orden.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{orden.numero}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {orden.fechaCreacion
                              ? new Date(orden.fechaCreacion.toDate()).toLocaleDateString('es-AR')
                              : orden.fecha
                                ? formatearFecha(orden.fecha)
                                : 'No disponible'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{orden.cliente?.nombre || 'N/A'}</div>
                          <div className="text-xs text-gray-400">{orden.cliente?.empresa || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {orden.cliente?.sedeNombre ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 rounded-full bg-blue-50">
                              <MapPin size={11} />
                              {orden.cliente.sedeNombre}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        {!esTecnico && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{orden.usuarioCreador || '-'}</div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{orden.fotos?.length || 0}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                          <div className="flex justify-end space-x-4">
                            <Link
                              href={`/admin/ordenes-trabajo/${orden.id}`}
                              title="Ver detalles"
                              className="text-gray-600 hover:text-primary"
                            >
                              <Eye size={18} />
                            </Link>
                            <DescargarOrdenTrabajoPDF orden={orden} className="text-primary hover:text-primary-light">
                              <Download size={18} />
                            </DescargarOrdenTrabajoPDF>
                            <Link
                              href={`/admin/ordenes-trabajo/editar/${orden.id}`}
                              title="Editar"
                              className="text-secondary hover:text-secondary-light"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleEliminar(orden.id)}
                              title="Eliminar"
                              className="text-red-500 cursor-pointer hover:text-red-700"
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={esTecnico ? 5 : 6} className="px-6 py-4 text-center text-gray-500">
                        No hay órdenes de trabajo que coincidan con su búsqueda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {ordenesFiltradas.length === 0 && filtro && (
            <div className="py-10 text-center">
              <ClipboardList size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-gray-500">No hay órdenes de trabajo que coincidan con su búsqueda</p>
              <p className="text-sm text-gray-400">Intente con otros términos o cree una nueva orden de trabajo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
