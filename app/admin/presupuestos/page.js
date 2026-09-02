// app/admin/presupuestos/page.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FilePlus, FileText, Home, Search, Download, Edit, Trash, Eye, ChevronDown } from 'lucide-react';
import SedeLink from '../../components/admin/SedeLink';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { actualizarPresupuesto, eliminarPresupuesto } from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PresupuestoPDF from '../../components/pdf/PresupuestoPDF';
import PortalDropdown from '../../components/PortalDropdown';
import ViewToggle from '../../components/admin/ViewToggle';
import { accionIconoClase, ACCION_ICONO_TAMANO } from '../../components/admin/accionIcono';
import { formatearFecha, fechaHoyLocal } from '../../lib/fecha';

const ESTADOS_PRESUPUESTO = ['Pendiente', 'Aprobado', 'Rechazado'];

export default function HistorialPresupuestos() {
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [presupuestos, setPresupuestos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [estadoMenuAbierto, setEstadoMenuAbierto] = useState(null);
  const [actualizandoEstado, setActualizandoEstado] = useState(null);
  const [vista, setVista] = useState('tabla');
  const estadoBtnRefs = useRef({});

  // Estado del formulario
  const [cliente, setCliente] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    direccion: ''
  });

  const [presupuesto, setPresupuesto] = useState({
    numero: `P-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    fecha: fechaHoyLocal(),
    validez: '30 días',
    items: [
      { id: 1, descripcion: '', cantidad: '', precioUnitario: '', subtotal: 0 }
    ],
    notas: 'Este presupuesto tiene una validez de 30 días a partir de la fecha de emisión.',
    subtotal: 0,
    total: 0
  });

  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!user) return;
    cargarPresupuestos().then(() => setLoadingData(false));
  }, [user]);


  const cargarPresupuestos = async () => {
    try {
      const presupuestosRef = collection(db, 'presupuestos');
      const q = query(presupuestosRef, orderBy('fechaCreacion', 'desc'));
      const querySnapshot = await getDocs(q);

      const presupuestosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("Presupuestos cargados:", presupuestosData.length);
      setPresupuestos(presupuestosData);
    } catch (error) {
      console.error('Error al cargar presupuestos:', error);
      // Si hay un error al cargar, mostrar al menos la página con un array vacío
      setPresupuestos([]);
    }
  };

  const handleDeletePresupuesto = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este presupuesto?')) {
      try {
        // Eliminar el documento de Firestore
        await eliminarPresupuesto(id);

        // Actualizar el estado local
        setPresupuestos(presupuestos.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error al eliminar presupuesto:', error);
        alert('Error al eliminar el presupuesto. Inténtelo de nuevo más tarde.');
      }
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    const actual = presupuestos.find(p => p.id === id);
    if (!actual || (actual.estado || 'Pendiente') === nuevoEstado) {
      setEstadoMenuAbierto(null);
      return;
    }

    setActualizandoEstado(id);
    try {
      await actualizarPresupuesto(id, { estado: nuevoEstado });
      setPresupuestos(presupuestos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
      alert('Error al cambiar el estado del presupuesto.');
    } finally {
      setActualizandoEstado(null);
      setEstadoMenuAbierto(null);
    }
  };

  const presupuestosFiltrados = presupuestos.filter((presupuesto) => {
    if (!filtro) return true;

    const terminoBusqueda = filtro.toLowerCase();
    return (
      presupuesto.numero?.toLowerCase().includes(terminoBusqueda) ||
      presupuesto.titulo?.toLowerCase().includes(terminoBusqueda) ||
      presupuesto.cliente?.nombre?.toLowerCase().includes(terminoBusqueda) ||
      presupuesto.cliente?.empresa?.toLowerCase().includes(terminoBusqueda)
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
            <span className="text-gray-700">Historial de Presupuestos</span>
          </div>

          <Link
            href="/admin/presupuestos/nuevo"
            className="flex items-center px-4 py-2 mb-4 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
          >
            <FilePlus size={18} className="mr-2" /> Nuevo Presupuesto
          </Link>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Historial de Presupuestos
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
            presupuestosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {presupuestosFiltrados.map((presupuesto) => (
                  <div key={presupuesto.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="mb-1">
                      <SedeLink clienteId={presupuesto.clienteId} sede={presupuesto.cliente?.sedeNombre} />
                    </div>
                    {presupuesto.titulo && (
                      <div className="mb-1 text-sm font-medium text-gray-700">{presupuesto.titulo}</div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium text-gray-900">{presupuesto.numero}</div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {presupuesto.fechaCreacion
                          ? new Date(presupuesto.fechaCreacion.toDate()).toLocaleDateString()
                          : presupuesto.fecha
                            ? formatearFecha(presupuesto.fecha)
                            : 'No disponible'
                        }
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-900">{presupuesto.cliente?.nombre || 'N/A'}</div>
                    <div className="mt-1 text-sm text-gray-500">{presupuesto.cliente?.empresa || ''}</div>
                    <div className="mt-2 text-sm font-medium text-gray-900">
                      ${presupuesto.total ? presupuesto.total.toLocaleString() : '0.00'}
                    </div>

                    <div className="mt-3">
                      <button
                        type="button"
                        ref={(el) => { estadoBtnRefs.current[presupuesto.id] = el; }}
                        onClick={() => setEstadoMenuAbierto(estadoMenuAbierto === presupuesto.id ? null : presupuesto.id)}
                        disabled={actualizandoEstado === presupuesto.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs leading-5 font-semibold rounded-full transition-opacity hover:opacity-80 disabled:opacity-50
                          ${presupuesto.estado === 'Aprobado' ? 'bg-green-100 text-green-800' :
                            presupuesto.estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}
                      >
                        {presupuesto.estado || 'Pendiente'}
                        <ChevronDown size={12} />
                      </button>

                      <PortalDropdown
                        open={estadoMenuAbierto === presupuesto.id}
                        anchorRef={{ current: estadoBtnRefs.current[presupuesto.id] }}
                        onClose={() => setEstadoMenuAbierto(null)}
                        width={144}
                      >
                        {ESTADOS_PRESUPUESTO.map((opcion) => (
                          <button
                            key={opcion}
                            type="button"
                            onClick={() => handleCambiarEstado(presupuesto.id, opcion)}
                            className={`flex items-center w-full gap-2 px-3 py-2 text-xs text-left hover:bg-gray-50 ${(presupuesto.estado || 'Pendiente') === opcion ? 'font-semibold text-primary' : 'text-gray-700'}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${opcion === 'Aprobado' ? 'bg-green-500' : opcion === 'Rechazado' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                            {opcion}
                          </button>
                        ))}
                      </PortalDropdown>
                    </div>

                    <div className="flex justify-end pt-3 mt-3 gap-1 border-t border-gray-100">
                      <Link
                        href={`/admin/presupuestos/${presupuesto.id}`}
                        title="Ver detalles"
                        className={accionIconoClase('gray')}
                      >
                        <Eye size={ACCION_ICONO_TAMANO} />
                      </Link>

                      <PDFDownloadLink
                        document={<PresupuestoPDF presupuesto={presupuesto} />}
                        fileName={`${presupuesto.numero}.pdf`}
                        title="Descargar PDF"
                        className={accionIconoClase('primary')}
                      >
                        {({ loading }) =>
                          <Download size={ACCION_ICONO_TAMANO} className={loading ? "animate-pulse" : ""} />
                        }
                      </PDFDownloadLink>

                      <Link
                        href={`/admin/presupuestos/editar/${presupuesto.id}`}
                        title="Editar"
                        className={accionIconoClase('secondary')}
                      >
                        <Edit size={ACCION_ICONO_TAMANO} />
                      </Link>
                      <button
                        onClick={() => handleDeletePresupuesto(presupuesto.id)}
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
                No hay presupuestos que coincidan con su búsqueda
              </div>
            )
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Sede
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Título
                  </th>
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
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {presupuestosFiltrados.length > 0 ? (
                  presupuestosFiltrados.map((presupuesto) => (
                    <tr key={presupuesto.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <SedeLink clienteId={presupuesto.clienteId} sede={presupuesto.cliente?.sedeNombre} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{presupuesto.titulo || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{presupuesto.numero}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {presupuesto.fechaCreacion
                            ? new Date(presupuesto.fechaCreacion.toDate()).toLocaleDateString()
                            : presupuesto.fecha
                              ? formatearFecha(presupuesto.fecha)
                              : 'No disponible'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{presupuesto.cliente?.nombre || 'N/A'}</div>
                        <div className="mt-1 text-sm text-gray-500">{presupuesto.cliente?.empresa || ''}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        ${presupuesto.total ? presupuesto.total.toLocaleString() : '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          ref={(el) => { estadoBtnRefs.current[presupuesto.id] = el; }}
                          onClick={() => setEstadoMenuAbierto(estadoMenuAbierto === presupuesto.id ? null : presupuesto.id)}
                          disabled={actualizandoEstado === presupuesto.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs leading-5 font-semibold rounded-full transition-opacity hover:opacity-80 disabled:opacity-50
                            ${presupuesto.estado === 'Aprobado' ? 'bg-green-100 text-green-800' :
                              presupuesto.estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'}`}
                        >
                          {presupuesto.estado || 'Pendiente'}
                          <ChevronDown size={12} />
                        </button>

                        <PortalDropdown
                          open={estadoMenuAbierto === presupuesto.id}
                          anchorRef={{ current: estadoBtnRefs.current[presupuesto.id] }}
                          onClose={() => setEstadoMenuAbierto(null)}
                          width={144}
                        >
                          {ESTADOS_PRESUPUESTO.map((opcion) => (
                            <button
                              key={opcion}
                              type="button"
                              onClick={() => handleCambiarEstado(presupuesto.id, opcion)}
                              className={`flex items-center w-full gap-2 px-3 py-2 text-xs text-left hover:bg-gray-50 ${(presupuesto.estado || 'Pendiente') === opcion ? 'font-semibold text-primary' : 'text-gray-700'}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${opcion === 'Aprobado' ? 'bg-green-500' : opcion === 'Rechazado' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                              {opcion}
                            </button>
                          ))}
                        </PortalDropdown>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/admin/presupuestos/${presupuesto.id}`}
                            title="Ver detalles"
                            className={accionIconoClase('gray')}
                          >
                            <Eye size={ACCION_ICONO_TAMANO} />
                          </Link>

                          <PDFDownloadLink
                            document={<PresupuestoPDF presupuesto={presupuesto} />}
                            fileName={`${presupuesto.numero}.pdf`}
                            title="Descargar PDF"
                            className={accionIconoClase('primary')}
                          >
                            {({ loading }) =>
                              <Download size={ACCION_ICONO_TAMANO} className={loading ? "animate-pulse" : ""} />
                            }
                          </PDFDownloadLink>

                          <Link
                            href={`/admin/presupuestos/editar/${presupuesto.id}`}
                            title="Editar"
                            className={accionIconoClase('secondary')}
                          >
                            <Edit size={ACCION_ICONO_TAMANO} />
                          </Link>
                          <button
                            onClick={() => handleDeletePresupuesto(presupuesto.id)}
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
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No hay presupuestos que coincidan con su búsqueda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}

          {presupuestosFiltrados.length === 0 && (
            <div className="py-10 text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-gray-500">No hay presupuestos que coincidan con su búsqueda</p>
              <p className="text-sm text-gray-400">Intente con otros términos o cree un nuevo presupuesto</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

