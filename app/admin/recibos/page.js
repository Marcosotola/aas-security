'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FilePlus, FileText, Home, Search, Download, Edit, Trash, Eye } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { eliminarRecibo } from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReciboPDF from '../../components/pdf/ReciboPDF';
import ViewToggle from '../../components/admin/ViewToggle';

export default function HistorialRecibos() {
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [recibos, setRecibos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [vista, setVista] = useState('tabla');
  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!user) return;
    cargarRecibos().then(() => setLoadingData(false));
  }, [user]);

  const cargarRecibos = async () => {
    try {
      const recibosRef = collection(db, 'recibos');
      const q = query(recibosRef, orderBy('fechaCreacion', 'desc'));
      const querySnapshot = await getDocs(q);

      const recibosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("recibos cargados:", recibosData.length);
      setRecibos(recibosData);
    } catch (error) {
      console.error('Error al cargar recibos:', error);
      setRecibos([]);
    }
  };

  const handleDeleteRecibo = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este recibo?')) {
      try {
        await eliminarRecibo(id);
        setRecibos(recibos.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error al eliminar recibo:', error);
        alert('Error al eliminar el recibo. Inténtelo de nuevo más tarde.');
      }
    }
  };

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const recibosFiltrados = recibos.filter((recibo) => {
    if (!filtro) return true;

    const terminoBusqueda = filtro.toLowerCase();
    return (
      recibo.numero?.toLowerCase().includes(terminoBusqueda) ||
      recibo.recibiDe?.toLowerCase().includes(terminoBusqueda) ||
      recibo.concepto?.toLowerCase().includes(terminoBusqueda)
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
            <span className="text-gray-700">Historial de Recibos</span>
          </div>

          <Link
            href="/admin/recibos/nuevo"
            className="flex items-center px-4 py-2 mb-4 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
          >
            <FilePlus size={18} className="mr-2" /> Nuevo Recibo
          </Link>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Recibos
        </h2>

        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex items-center flex-1">
              <Search size={18} className="absolute text-gray-400 left-3" />
              <input
                type="text"
                placeholder="Buscar por número, cliente o concepto..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <ViewToggle vista={vista} onChange={setVista} />
          </div>

          {vista === 'cards' ? (
            recibosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recibosFiltrados.map((recibo) => (
                  <div key={recibo.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium text-gray-900">{recibo.numero}</div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {recibo.fechaCreacion
                          ? new Date(recibo.fechaCreacion.toDate()).toLocaleDateString('es-AR')
                          : recibo.fecha
                            ? new Date(recibo.fecha).toLocaleDateString('es-AR')
                            : 'No disponible'
                        }
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-900">{recibo.recibiDe || 'N/A'}</div>
                    <div className="mt-1 text-sm text-gray-500 line-clamp-2" title={recibo.concepto}>
                      {recibo.concepto || 'N/A'}
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-900">
                      {formatCurrency(recibo.monto)}
                    </div>

                    <div className="flex justify-end pt-3 mt-3 space-x-4 border-t border-gray-100">
                      <Link
                        href={`/admin/recibos/${recibo.id}`}
                        title="Ver detalles"
                        className="text-gray-600 hover:text-primary"
                      >
                        <Eye size={18} />
                      </Link>
                      <PDFDownloadLink
                        document={<ReciboPDF recibo={recibo} />}
                        fileName={`Recibo_${recibo.numero}.pdf`}
                        className="text-primary hover:text-primary-light"
                      >
                        {({ blob, url, loading, error }) =>
                          <Download size={18} className={loading ? "animate-pulse" : ""} />
                        }
                      </PDFDownloadLink>
                      <Link
                        href={`/admin/recibos/editar/${recibo.id}`}
                        title="Editar"
                        className="text-secondary hover:text-secondary-light"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeleteRecibo(recibo.id)}
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
                No hay recibos que coincidan con su búsqueda
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
                    Recibí de
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Concepto
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Monto
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recibosFiltrados.length > 0 ? (
                  recibosFiltrados.map((recibo) => (
                    <tr key={recibo.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{recibo.numero}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {recibo.fechaCreacion
                            ? new Date(recibo.fechaCreacion.toDate()).toLocaleDateString('es-AR')
                            : recibo.fecha
                              ? new Date(recibo.fecha).toLocaleDateString('es-AR')
                              : 'No disponible'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{recibo.recibiDe || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="max-w-xs text-sm text-gray-500 truncate" title={recibo.concepto}>
                          {recibo.concepto || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(recibo.monto)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-4">
                          <Link
                            href={`/admin/recibos/${recibo.id}`}
                            title="Ver detalles"
                            className="text-gray-600 hover:text-primary"
                          >
                            <Eye size={18} />
                          </Link>
                          <PDFDownloadLink
                            document={<ReciboPDF recibo={recibo} />}
                            fileName={`Recibo_${recibo.numero}.pdf`}
                            className="text-primary hover:text-primary-light"
                          >
                            {({ blob, url, loading, error }) =>
                              <Download size={18} className={loading ? "animate-pulse" : ""} />
                            }
                          </PDFDownloadLink>
                          <Link
                            href={`/admin/recibos/editar/${recibo.id}`}
                            title="Editar"
                            className="text-secondary hover:text-secondary-light"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDeleteRecibo(recibo.id)}
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
                      No hay recibos que coincidan con su búsqueda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}

          {recibosFiltrados.length === 0 && filtro && (
            <div className="py-10 text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-gray-500">No hay recibos que coincidan con su búsqueda</p>
              <p className="text-sm text-gray-400">Intente con otros términos o cree un nuevo recibo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}