'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { FilePlus, FileText, Home, Search, Edit, Trash, Eye, MapPin, Download } from 'lucide-react';
import { obtenerFacturas, actualizarFactura, eliminarFactura } from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';
import ViewToggle from '../../components/admin/ViewToggle';
import EstadoFacturaToggle from '../../components/ui/EstadoFactura';
import PortalDropdown from '../../components/PortalDropdown';
import { formatearFecha } from '../../lib/fecha';

const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2
}).format(amount || 0);

export default function HistorialFacturas() {
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [facturas, setFacturas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [sede, setSede] = useState('todas');
  const [estado, setEstado] = useState('todos');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [vista, setVista] = useState('tabla');
  const [eliminandoId, setEliminandoId] = useState(null);
  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!user) return;
    cargarFacturas();
  }, [user]);

  const cargarFacturas = async () => {
    try {
      setFacturas(await obtenerFacturas());
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      setFacturas([]);
    } finally {
      setLoadingData(false);
    }
  };

  const sedes = useMemo(() => {
    const nombres = new Set(facturas.map((f) => f.sedeNombre).filter(Boolean));
    return Array.from(nombres).sort();
  }, [facturas]);

  const handleCambiarEstado = async (id, nuevoEstado) => {
    const anteriores = facturas;
    setFacturas(facturas.map((f) => (f.id === id ? { ...f, estado: nuevoEstado } : f)));
    try {
      await actualizarFactura(id, { estado: nuevoEstado });
    } catch (error) {
      console.error('Error al actualizar el estado de la factura:', error);
      alert('No se pudo actualizar el estado. Inténtelo de nuevo más tarde.');
      setFacturas(anteriores);
    }
  };

  const handleEliminarFactura = async (id) => {
    if (!confirm('¿Está seguro de que desea eliminar esta factura? Se borrarán también los PDF adjuntos.')) return;
    setEliminandoId(id);
    try {
      await eliminarFactura(id);
      setFacturas(facturas.filter((f) => f.id !== id));
    } catch (error) {
      console.error('Error al eliminar factura:', error);
      alert('Error al eliminar la factura. Inténtelo de nuevo más tarde.');
    } finally {
      setEliminandoId(null);
    }
  };

  const facturasFiltradas = useMemo(() => {
    const terminoBusqueda = filtro.trim().toLowerCase();
    return facturas.filter((f) => {
      if (terminoBusqueda) {
        const coincide = f.numero?.toLowerCase().includes(terminoBusqueda)
          || f.clienteNombre?.toLowerCase().includes(terminoBusqueda)
          || f.descripcion?.toLowerCase().includes(terminoBusqueda);
        if (!coincide) return false;
      }
      if (sede !== 'todas' && f.sedeNombre !== sede) return false;
      if (estado !== 'todos' && f.estado !== estado) return false;
      if (desde && f.fecha && f.fecha < desde) return false;
      if (hasta && f.fecha && f.fecha > hasta) return false;
      return true;
    });
  }, [facturas, filtro, sede, estado, desde, hasta]);

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
            <span className="text-gray-700">Facturación</span>
          </div>

          <Link
            href="/admin/facturas/nueva"
            className="flex items-center px-4 py-2 mb-4 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
          >
            <FilePlus size={18} className="mr-2" /> Nueva Factura
          </Link>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Facturación
        </h2>

        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          {/* Filtros */}
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <div className="relative flex items-center flex-1 min-w-[220px]">
              <Search size={18} className="absolute text-gray-400 left-3" />
              <input
                type="text"
                placeholder="Buscar por número, cliente o descripción..."
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
              <label className="block mb-1 text-xs font-medium text-gray-500">Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
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
            facturasFiltradas.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {facturasFiltradas.map((factura) => (
                  <div key={factura.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium text-gray-900">{factura.numero}</div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">{formatearFecha(factura.fecha)}</div>
                    </div>
                    <div className="mt-1 text-sm text-gray-900">{factura.clienteNombre || 'N/A'}</div>
                    {factura.sedeNombre && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-xs font-semibold text-blue-700 border border-blue-200 rounded-full bg-blue-50">
                        <MapPin size={11} />
                        {factura.sedeNombre}
                      </div>
                    )}
                    <div className="mt-1 text-sm text-gray-500 line-clamp-2" title={factura.descripcion}>{factura.descripcion || '-'}</div>
                    <div className="mt-2 text-sm font-medium text-gray-900">{formatCurrency(factura.monto)}</div>
                    <div className="mt-2">
                      <EstadoFacturaToggle estado={factura.estado} onChange={(nuevo) => handleCambiarEstado(factura.id, nuevo)} />
                    </div>

                    <div className="flex justify-end pt-3 mt-3 space-x-4 border-t border-gray-100">
                      <Link href={`/admin/facturas/${factura.id}`} title="Ver detalles" className="text-gray-600 hover:text-primary">
                        <Eye size={18} />
                      </Link>
                      <DescargarFactura factura={factura} />
                      <Link href={`/admin/facturas/editar/${factura.id}`} title="Editar" className="text-secondary hover:text-secondary-light">
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleEliminarFactura(factura.id)}
                        disabled={eliminandoId === factura.id}
                        title="Eliminar"
                        className="text-red-500 cursor-pointer hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">No hay facturas que coincidan con los filtros</div>
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Número</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Monto</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {facturasFiltradas.length > 0 ? (
                    facturasFiltradas.map((factura) => (
                      <tr key={factura.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{factura.numero}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatearFecha(factura.fecha)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{factura.clienteNombre || 'N/A'}</div>
                          {factura.sedeNombre && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-xs font-semibold text-blue-700 border border-blue-200 rounded-full bg-blue-50">
                        <MapPin size={11} />
                        {factura.sedeNombre}
                      </div>
                    )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(factura.monto)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <EstadoFacturaToggle estado={factura.estado} onChange={(nuevo) => handleCambiarEstado(factura.id, nuevo)} />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                          <div className="flex justify-end space-x-4">
                            <Link href={`/admin/facturas/${factura.id}`} title="Ver detalles" className="text-gray-600 hover:text-primary">
                              <Eye size={18} />
                            </Link>
                            <DescargarFactura factura={factura} />
                            <Link href={`/admin/facturas/editar/${factura.id}`} title="Editar" className="text-secondary hover:text-secondary-light">
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleEliminarFactura(factura.id)}
                              disabled={eliminandoId === factura.id}
                              title="Eliminar"
                              className="text-red-500 cursor-pointer hover:text-red-700 disabled:opacity-50"
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No hay facturas que coincidan con los filtros</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {facturasFiltradas.length === 0 && (filtro || sede !== 'todas' || estado !== 'todos' || desde || hasta) && (
            <div className="py-10 text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-gray-500">No hay facturas que coincidan con los filtros</p>
              <p className="text-sm text-gray-400">Probá con otros criterios o creá una nueva factura</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Descarga directa desde el listado, sin pasar por el detalle: un solo PDF
// descarga directo, más de uno abre un dropdown para elegir cuál.
function DescargarFactura({ factura }) {
  const [abierto, setAbierto] = useState(false);
  const btnRef = useRef(null);
  const archivos = factura.archivos || [];

  if (archivos.length === 0) {
    return <Download size={18} className="text-gray-300" />;
  }

  if (archivos.length === 1) {
    return (
      <a
        href={archivos[0].url}
        target="_blank"
        rel="noopener noreferrer"
        title="Descargar PDF"
        className="text-primary hover:text-primary-light"
      >
        <Download size={18} />
      </a>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        ref={btnRef}
        onClick={() => setAbierto((o) => !o)}
        title="Descargar PDF"
        className="text-primary hover:text-primary-light"
      >
        <Download size={18} />
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
            <FileText size={14} className="shrink-0 text-primary" />
            <span className="truncate">{archivo.nombre || `Archivo ${index + 1}`}</span>
          </a>
        ))}
      </PortalDropdown>
    </div>
  );
}
