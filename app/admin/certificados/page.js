'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { FilePlus, Award, Home, Search, Edit, Trash, Eye, MapPin, Download } from 'lucide-react';
import { obtenerCertificados, eliminarCertificado } from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';
import ViewToggle from '../../components/admin/ViewToggle';
import PortalDropdown from '../../components/PortalDropdown';
import { accionIconoClase, ACCION_ICONO_TAMANO } from '../../components/admin/accionIcono';
import { formatearFecha } from '../../lib/fecha';

export default function HistorialCertificados() {
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [certificados, setCertificados] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [sede, setSede] = useState('todas');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [vista, setVista] = useState('tabla');
  const [eliminandoId, setEliminandoId] = useState(null);
  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!user) return;
    cargarCertificados();
  }, [user]);

  const cargarCertificados = async () => {
    try {
      setCertificados(await obtenerCertificados());
    } catch (error) {
      console.error('Error al cargar certificados:', error);
      setCertificados([]);
    } finally {
      setLoadingData(false);
    }
  };

  const sedes = useMemo(() => {
    const nombres = new Set(certificados.map((c) => c.sedeNombre).filter(Boolean));
    return Array.from(nombres).sort();
  }, [certificados]);

  const handleEliminarCertificado = async (id) => {
    if (!confirm('¿Está seguro de que desea eliminar este certificado? Se borrarán también los archivos adjuntos.')) return;
    setEliminandoId(id);
    try {
      await eliminarCertificado(id);
      setCertificados(certificados.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error al eliminar certificado:', error);
      alert('Error al eliminar el certificado. Inténtelo de nuevo más tarde.');
    } finally {
      setEliminandoId(null);
    }
  };

  const certificadosFiltrados = useMemo(() => {
    const terminoBusqueda = filtro.trim().toLowerCase();
    return certificados.filter((c) => {
      if (terminoBusqueda) {
        const coincide = c.nombre?.toLowerCase().includes(terminoBusqueda)
          || c.clienteNombre?.toLowerCase().includes(terminoBusqueda)
          || c.descripcion?.toLowerCase().includes(terminoBusqueda);
        if (!coincide) return false;
      }
      if (sede !== 'todas' && c.sedeNombre !== sede) return false;
      if (desde && c.fecha && c.fecha < desde) return false;
      if (hasta && c.fecha && c.fecha > hasta) return false;
      return true;
    });
  }, [certificados, filtro, sede, desde, hasta]);

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
            <span className="text-gray-700">Certificados</span>
          </div>

          <Link
            href="/admin/certificados/nuevo"
            className="flex items-center px-4 py-2 mb-4 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
          >
            <FilePlus size={18} className="mr-2" /> Nuevo Certificado
          </Link>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Certificados
        </h2>

        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          {/* Filtros */}
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <div className="relative flex items-center flex-1 min-w-[220px]">
              <Search size={18} className="absolute text-gray-400 left-3" />
              <input
                type="text"
                placeholder="Buscar por nombre, cliente o descripción..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Sede</label>
              <select value={sede} onChange={(e) => setSede(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="todas">Todas</option>
                {sedes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Desde</label>
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Hasta</label>
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <ViewToggle vista={vista} onChange={setVista} />
          </div>

          {vista === 'cards' ? (
            certificadosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {certificadosFiltrados.map((certificado) => (
                  <div key={certificado.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium text-gray-900">{certificado.nombre}</div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">{formatearFecha(certificado.fecha)}</div>
                    </div>
                    <div className="mt-1 text-sm text-gray-900">{certificado.clienteNombre || 'N/A'}</div>
                    {certificado.sedeNombre && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-xs font-semibold text-blue-700 border border-blue-200 rounded-full bg-blue-50">
                        <MapPin size={11} />
                        {certificado.sedeNombre}
                      </div>
                    )}
                    <div className="mt-1 text-sm text-gray-500 line-clamp-2" title={certificado.descripcion}>{certificado.descripcion || '-'}</div>

                    <div className="flex justify-end pt-3 mt-3 gap-1 border-t border-gray-100">
                      <Link href={`/admin/certificados/${certificado.id}`} title="Ver detalles" className={accionIconoClase('gray')}>
                        <Eye size={ACCION_ICONO_TAMANO} />
                      </Link>
                      <DescargarCertificado certificado={certificado} />
                      <Link href={`/admin/certificados/editar/${certificado.id}`} title="Editar" className={accionIconoClase('secondary')}>
                        <Edit size={ACCION_ICONO_TAMANO} />
                      </Link>
                      <button
                        onClick={() => handleEliminarCertificado(certificado.id)}
                        disabled={eliminandoId === certificado.id}
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
              <div className="px-6 py-4 text-center text-gray-500">No hay certificados que coincidan con los filtros</div>
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Descripción</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {certificadosFiltrados.length > 0 ? (
                    certificadosFiltrados.map((certificado) => (
                      <tr key={certificado.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{certificado.nombre}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatearFecha(certificado.fecha)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{certificado.clienteNombre || 'N/A'}</div>
                          {certificado.sedeNombre && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-xs font-semibold text-blue-700 border border-blue-200 rounded-full bg-blue-50">
                              <MapPin size={11} />
                              {certificado.sedeNombre}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs text-sm text-gray-500 truncate" title={certificado.descripcion}>{certificado.descripcion || '-'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1">
                            <Link href={`/admin/certificados/${certificado.id}`} title="Ver detalles" className={accionIconoClase('gray')}>
                              <Eye size={ACCION_ICONO_TAMANO} />
                            </Link>
                            <DescargarCertificado certificado={certificado} />
                            <Link href={`/admin/certificados/editar/${certificado.id}`} title="Editar" className={accionIconoClase('secondary')}>
                              <Edit size={ACCION_ICONO_TAMANO} />
                            </Link>
                            <button
                              onClick={() => handleEliminarCertificado(certificado.id)}
                              disabled={eliminandoId === certificado.id}
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
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No hay certificados que coincidan con los filtros</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {certificadosFiltrados.length === 0 && (filtro || sede !== 'todas' || desde || hasta) && (
            <div className="py-10 text-center">
              <Award size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-gray-500">No hay certificados que coincidan con los filtros</p>
              <p className="text-sm text-gray-400">Probá con otros criterios o creá un nuevo certificado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Descarga directa desde el listado, sin pasar por el detalle: un solo
// archivo descarga directo, más de uno abre un dropdown para elegir cuál.
function DescargarCertificado({ certificado }) {
  const [abierto, setAbierto] = useState(false);
  const btnRef = useRef(null);
  const archivos = certificado.archivos || [];

  if (archivos.length === 0) {
    return (
      <span className={`${accionIconoClase('gray')} text-gray-300 hover:bg-transparent`}>
        <Download size={ACCION_ICONO_TAMANO} />
      </span>
    );
  }

  if (archivos.length === 1) {
    return (
      <a
        href={archivos[0].url}
        target="_blank"
        rel="noopener noreferrer"
        title="Descargar"
        className={accionIconoClase('primary')}
      >
        <Download size={ACCION_ICONO_TAMANO} />
      </a>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        ref={btnRef}
        onClick={() => setAbierto((o) => !o)}
        title="Descargar"
        className={accionIconoClase('primary')}
      >
        <Download size={ACCION_ICONO_TAMANO} />
      </button>
      <PortalDropdown open={abierto} anchorRef={btnRef} onClose={() => setAbierto(false)} width={240} align="right">
        {archivos.map((archivo, index) => (
          <a
            key={archivo.path || index}
            href={archivo.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setAbierto(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Download size={14} className="shrink-0 text-primary" />
            <span className="truncate">{archivo.nombre || `Archivo ${index + 1}`}</span>
          </a>
        ))}
      </PortalDropdown>
    </div>
  );
}
