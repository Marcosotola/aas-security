'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FilePlus, FileText, Home, Search, Download, Edit, Trash, Eye } from 'lucide-react';
import { obtenerDocumentos, eliminarDocumento } from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';
import { PDFDownloadLink } from '@react-pdf/renderer';
import DocumentoPDF from '../../components/pdf/DocumentoPDF';
import ViewToggle from '../../components/admin/ViewToggle';
import { accionIconoClase, ACCION_ICONO_TAMANO } from '../../components/admin/accionIcono';
import { formatearFecha } from '../../lib/fecha';

export default function HistorialDocumentos() {
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [documentos, setDocumentos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [vista, setVista] = useState('tabla');
  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!user) return;
    cargarDocumentos().then(() => setLoadingData(false));
  }, [user]);

  const cargarDocumentos = async () => {
    try {
      const documentosData = await obtenerDocumentos();
      console.log("documentos cargados:", documentosData.length);
      setDocumentos(documentosData);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      setDocumentos([]);
    }
  };

  const handleDeleteDocumento = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este informe?')) {
      try {
        await eliminarDocumento(id);
        setDocumentos(documentos.filter(d => d.id !== id));
      } catch (error) {
        console.error('Error al eliminar informe:', error);
        alert('Error al eliminar el informe. Inténtelo de nuevo más tarde.');
      }
    }
  };

  const documentosFiltrados = documentos.filter((documento) => {
    if (!filtro) return true;

    const terminoBusqueda = filtro.toLowerCase();
    return (
      documento.titulo?.toLowerCase().includes(terminoBusqueda) ||
      documento.contenido?.toLowerCase().includes(terminoBusqueda)
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
            <span className="text-gray-700">Historial de Informes</span>
          </div>

          <Link
            href="/admin/informes/nuevo"
            className="flex items-center px-4 py-2 mb-4 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
          >
            <FilePlus size={18} className="mr-2" /> Nuevo Informe
          </Link>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Informes
        </h2>

        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex items-center flex-1">
              <Search size={18} className="absolute text-gray-400 left-3" />
              <input
                type="text"
                placeholder="Buscar por título o contenido..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <ViewToggle vista={vista} onChange={setVista} />
          </div>

          {vista === 'cards' ? (
            documentosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {documentosFiltrados.map((documento) => (
                  <div key={documento.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium text-gray-900">{documento.titulo || 'Sin título'}</div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {documento.fechaCreacion
                          ? new Date(documento.fechaCreacion.toDate()).toLocaleDateString('es-AR')
                          : documento.fecha
                            ? formatearFecha(documento.fecha)
                            : 'No disponible'
                        }
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 line-clamp-2" title={documento.contenido}>
                      {documento.contenido || 'N/A'}
                    </div>

                    <div className="flex justify-end pt-3 mt-3 gap-1 border-t border-gray-100">
                      <Link
                        href={`/admin/informes/${documento.id}`}
                        title="Ver detalles"
                        className={accionIconoClase('gray')}
                      >
                        <Eye size={ACCION_ICONO_TAMANO} />
                      </Link>
                      <PDFDownloadLink
                        document={<DocumentoPDF documento={documento} />}
                        fileName={`Informe_${documento.titulo?.replace(/\s+/g, '_') || 'Sin_titulo'}.pdf`}
                        className={accionIconoClase('primary')}
                      >
                        {({ blob, url, loading, error }) =>
                          <Download size={ACCION_ICONO_TAMANO} className={loading ? "animate-pulse" : ""} />
                        }
                      </PDFDownloadLink>
                      <Link
                        href={`/admin/informes/editar/${documento.id}`}
                        title="Editar"
                        className={accionIconoClase('secondary')}
                      >
                        <Edit size={ACCION_ICONO_TAMANO} />
                      </Link>
                      <button
                        onClick={() => handleDeleteDocumento(documento.id)}
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
                No hay informes que coincidan con su búsqueda
              </div>
            )
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Título
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Contenido
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documentosFiltrados.length > 0 ? (
                  documentosFiltrados.map((documento) => (
                    <tr key={documento.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{documento.titulo || 'Sin título'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {documento.fechaCreacion
                            ? new Date(documento.fechaCreacion.toDate()).toLocaleDateString('es-AR')
                            : documento.fecha
                              ? formatearFecha(documento.fecha)
                              : 'No disponible'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="max-w-xs text-sm text-gray-500 truncate" title={documento.contenido}>
                          {documento.contenido || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/admin/informes/${documento.id}`}
                            title="Ver detalles"
                            className={accionIconoClase('gray')}
                          >
                            <Eye size={ACCION_ICONO_TAMANO} />
                          </Link>
                          <PDFDownloadLink
                            document={<DocumentoPDF documento={documento} />}
                            fileName={`Informe_${documento.titulo?.replace(/\s+/g, '_') || 'Sin_titulo'}.pdf`}
                            className={accionIconoClase('primary')}
                          >
                            {({ blob, url, loading, error }) =>
                              <Download size={ACCION_ICONO_TAMANO} className={loading ? "animate-pulse" : ""} />
                            }
                          </PDFDownloadLink>
                          <Link
                            href={`/admin/informes/editar/${documento.id}`}
                            title="Editar"
                            className={accionIconoClase('secondary')}
                          >
                            <Edit size={ACCION_ICONO_TAMANO} />
                          </Link>
                          <button
                            onClick={() => handleDeleteDocumento(documento.id)}
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
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No hay informes que coincidan con su búsqueda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}

          {documentosFiltrados.length === 0 && filtro && (
            <div className="py-10 text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-gray-500">No hay informes que coincidan con su búsqueda</p>
              <p className="text-sm text-gray-400">Intente con otros términos o cree un nuevo informe</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}