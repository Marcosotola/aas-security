'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FilePlus, FileText, Home, Search, Download, Edit, Trash, Eye } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { eliminarRemito } from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RemitoPDF from '../../components/pdf/RemitoPDF';
import ViewToggle from '../../components/admin/ViewToggle';
import { formatearFecha } from '../../lib/fecha';

export default function HistorialRemitos() {
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [remitos, setRemitos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [vista, setVista] = useState('tabla');
  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!user) return;
    cargarRemitos().then(() => setLoadingData(false));
  }, [user]);

  const cargarRemitos = async () => {
    try {
      const remitosRef = collection(db, 'remitos');
      const q = query(remitosRef, orderBy('fechaCreacion', 'desc'));
      const querySnapshot = await getDocs(q);

      const remitosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("remitos cargados:", remitosData.length);
      setRemitos(remitosData);
    } catch (error) {
      console.error('Error al cargar remitos:', error);
      setRemitos([]);
    }
  };

  const handleDeleteRemito = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este remito?')) {
      try {
        await eliminarRemito(id);
        setRemitos(remitos.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error al eliminar remito:', error);
        alert('Error al eliminar el remito. Inténtelo de nuevo más tarde.');
      }
    }
  };

  const remitosFiltrados = remitos.filter((remito) => {
    if (!filtro) return true;

    const terminoBusqueda = filtro.toLowerCase();
    return (
      remito.numero?.toLowerCase().includes(terminoBusqueda) ||
      remito.cliente?.nombre?.toLowerCase().includes(terminoBusqueda) ||
      remito.cliente?.empresa?.toLowerCase().includes(terminoBusqueda)
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
            <Link
              href="/admin/dashboard"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              <Home size={16} className="mr-1" /> Panel
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Historial de Remitos</span>
          </div>

          <Link
            href="/admin/remitos/nuevo"
            className="flex items-center px-4 py-2 mb-4 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
          >
            <FilePlus size={18} className="mr-2" /> Nuevo Remito
          </Link>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Remitos
        </h2>

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
            remitosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {remitosFiltrados.map((remito) => (
                  <div key={remito.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium text-gray-900">{remito.numero}</div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {remito.fechaCreacion
                          ? new Date(remito.fechaCreacion.toDate()).toLocaleDateString('es-AR')
                          : remito.fecha
                            ? formatearFecha(remito.fecha)
                            : 'No disponible'
                        }
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-900">{remito.cliente?.nombre || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{remito.cliente?.empresa || 'N/A'}</div>
                    {remito.cliente?.sedeNombre && (
                      <div className="text-xs text-gray-400">Sede: {remito.cliente.sedeNombre}</div>
                    )}
                    <div className="mt-2 text-sm text-gray-500">{remito.items?.length || 0} items</div>

                    <div className="flex justify-end pt-3 mt-3 space-x-4 border-t border-gray-100">
                      <Link
                        href={`/admin/remitos/${remito.id}`}
                        title="Ver detalles"
                        className="text-gray-600 hover:text-primary"
                      >
                        <Eye size={18} />
                      </Link>
                      <PDFDownloadLink
                        document={<RemitoPDF remito={remito} />}
                        fileName={`${remito.numero}.pdf`}
                        className="text-primary hover:text-primary-light"
                      >
                        {({ blob, url, loading, error }) =>
                          <Download size={18} className={loading ? "animate-pulse" : ""} />
                        }
                      </PDFDownloadLink>
                      <Link
                        href={`/admin/remitos/editar/${remito.id}`}
                        title="Editar"
                        className="text-secondary hover:text-secondary-light"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeleteRemito(remito.id)}
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
                No hay remitos que coincidan con su búsqueda
              </div>
            )
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Número
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Empresa
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {remitosFiltrados.length > 0 ? (
                  remitosFiltrados.map((remito) => (
                    <tr key={remito.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{remito.numero}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {remito.fechaCreacion
                            ? new Date(remito.fechaCreacion.toDate()).toLocaleDateString('es-AR')
                            : remito.fecha
                              ? formatearFecha(remito.fecha)
                              : 'No disponible'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{remito.cliente?.nombre || 'N/A'}</div>
                        {remito.cliente?.sedeNombre && (
                          <div className="text-xs text-gray-400">Sede: {remito.cliente.sedeNombre}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{remito.cliente?.empresa || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{remito.items?.length || 0} items</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-4">
                          <Link
                            href={`/admin/remitos/${remito.id}`}
                            title="Ver detalles"
                            className="text-gray-600 hover:text-primary"
                          >
                            <Eye size={18} />
                          </Link>
                          <PDFDownloadLink
                            document={<RemitoPDF remito={remito} />}
                            fileName={`${remito.numero}.pdf`}
                            className="text-primary hover:text-primary-light"
                          >
                            {({ blob, url, loading, error }) =>
                              <Download size={18} className={loading ? "animate-pulse" : ""} />
                            }
                          </PDFDownloadLink>
                          <Link
                            href={`/admin/remitos/editar/${remito.id}`}
                            title="Editar"
                            className="text-secondary hover:text-secondary-light"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDeleteRemito(remito.id)}
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
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No hay remitos que coincidan con su búsqueda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}

          {remitosFiltrados.length === 0 && filtro && (
            <div className="py-10 text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-gray-500">No hay remitos que coincidan con su búsqueda</p>
              <p className="text-sm text-gray-400">Intente con otros términos o cree un nuevo remito</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}