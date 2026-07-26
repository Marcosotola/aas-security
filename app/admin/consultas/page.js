// app/admin/consultas/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Search, Trash, MessageCircle, MailOpen, Mail, Eye, X } from 'lucide-react';
import { obtenerConsultas, marcarConsultaLeida, eliminarConsulta } from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';
import { construirLinkWhatsApp } from '../../lib/whatsapp';
import ViewToggle from '../../components/admin/ViewToggle';

const formatearFecha = (fechaCreacion) => {
  if (!fechaCreacion) return 'No disponible';
  return new Date(fechaCreacion.toDate()).toLocaleString('es-AR');
};

export default function Consultas() {
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [consultas, setConsultas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);
  const [vista, setVista] = useState('tabla');
  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!user) return;
    cargarConsultas().then(() => setLoadingData(false));
  }, [user]);

  const cargarConsultas = async () => {
    try {
      const data = await obtenerConsultas();
      setConsultas(data);
    } catch (error) {
      console.error('Error al cargar consultas:', error);
      setConsultas([]);
    }
  };

  const handleToggleLeida = async (consulta) => {
    try {
      await marcarConsultaLeida(consulta.id, !consulta.leida);
      setConsultas(prev =>
        prev.map(c => c.id === consulta.id ? { ...c, leida: !consulta.leida } : c)
      );
      setConsultaSeleccionada(prev =>
        prev && prev.id === consulta.id ? { ...prev, leida: !consulta.leida } : prev
      );
    } catch (error) {
      console.error('Error al actualizar consulta:', error);
      alert('Error al actualizar la consulta. Inténtelo de nuevo más tarde.');
    }
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar esta consulta?')) {
      try {
        await eliminarConsulta(id);
        setConsultas(prev => prev.filter(c => c.id !== id));
        setConsultaSeleccionada(prev => (prev && prev.id === id ? null : prev));
      } catch (error) {
        console.error('Error al eliminar consulta:', error);
        alert('Error al eliminar la consulta. Inténtelo de nuevo más tarde.');
      }
    }
  };

  const abrirConsulta = (consulta) => {
    setConsultaSeleccionada(consulta);
    if (!consulta.leida) {
      handleToggleLeida(consulta);
    }
  };

  const consultasFiltradas = consultas.filter((consulta) => {
    if (!filtro) return true;
    const termino = filtro.toLowerCase();
    return (
      consulta.nombre?.toLowerCase().includes(termino) ||
      consulta.telefono?.toLowerCase().includes(termino) ||
      consulta.mensaje?.toLowerCase().includes(termino)
    );
  });

  const noLeidas = consultas.filter(c => !c.leida).length;

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
            <span className="text-gray-700">Consultas</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold font-montserrat text-primary">
            Consultas
          </h2>
          {noLeidas > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
              {noLeidas} sin leer
            </span>
          )}
        </div>

        <div className="p-4 mb-8 bg-white rounded-lg shadow-md md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex items-center flex-1">
              <Search size={18} className="absolute text-gray-400 left-3" />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o consulta..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <ViewToggle vista={vista} onChange={setVista} />
          </div>

          {consultasFiltradas.length > 0 ? (
            vista === 'cards' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {consultasFiltradas.map((consulta) => {
                  const linkWhatsApp = construirLinkWhatsApp(consulta.telefono);
                  return (
                    <div
                      key={consulta.id}
                      className={`rounded-lg border p-4 ${!consulta.leida ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
                    >
                      <button
                        onClick={() => abrirConsulta(consulta)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              title={consulta.leida ? 'Leída' : 'No leída'}
                              className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${consulta.leida ? 'bg-gray-300' : 'bg-red-500'}`}
                            ></span>
                            <span className={`text-base ${!consulta.leida ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {consulta.nombre || 'N/A'}
                            </span>
                          </div>
                          <span className="flex-shrink-0 text-xs text-gray-400">
                            {formatearFecha(consulta.fechaCreacion)}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">{consulta.telefono || 'N/A'}</div>
                        <p className="mt-2 text-sm text-gray-700 line-clamp-2">{consulta.mensaje || ''}</p>
                      </button>

                      <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 border-t border-gray-100">
                        {linkWhatsApp && (
                          <a
                            href={linkWhatsApp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-green-700 rounded-lg bg-green-50 active:bg-green-100"
                          >
                            <MessageCircle size={20} />
                            WhatsApp
                          </a>
                        )}
                        <button
                          onClick={() => handleToggleLeida(consulta)}
                          className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg text-secondary bg-secondary/10 active:bg-secondary/20"
                        >
                          {consulta.leida ? <Mail size={20} /> : <MailOpen size={20} />}
                          {consulta.leida ? 'No leída' : 'Leída'}
                        </button>
                        <button
                          onClick={() => handleEliminar(consulta.id)}
                          className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 rounded-lg bg-red-50 active:bg-red-100"
                        >
                          <Trash size={20} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Estado
                      </th>
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Nombre
                      </th>
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Teléfono
                      </th>
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Consulta
                      </th>
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Fecha
                      </th>
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consultasFiltradas.map((consulta) => {
                      const linkWhatsApp = construirLinkWhatsApp(consulta.telefono);
                      return (
                        <tr key={consulta.id} className={!consulta.leida ? 'bg-blue-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              title={consulta.leida ? 'Leída' : 'No leída'}
                              className={`inline-block w-2.5 h-2.5 rounded-full ${consulta.leida ? 'bg-gray-300' : 'bg-red-500'}`}
                            ></span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${!consulta.leida ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {consulta.nombre || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{consulta.telefono || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <div className="text-sm text-gray-700 line-clamp-2">
                              {consulta.mensaje || ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatearFecha(consulta.fechaCreacion)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                            <div className="flex justify-end space-x-4">
                              <button
                                onClick={() => abrirConsulta(consulta)}
                                title="Ver consulta completa"
                                className="text-gray-600 hover:text-primary"
                              >
                                <Eye size={18} />
                              </button>
                              {linkWhatsApp && (
                                <a
                                  href={linkWhatsApp}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Abrir WhatsApp"
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <MessageCircle size={18} />
                                </a>
                              )}
                              <button
                                onClick={() => handleToggleLeida(consulta)}
                                title={consulta.leida ? 'Marcar como no leída' : 'Marcar como leída'}
                                className="text-secondary hover:text-secondary-light"
                              >
                                {consulta.leida ? <Mail size={18} /> : <MailOpen size={18} />}
                              </button>
                              <button
                                onClick={() => handleEliminar(consulta.id)}
                                title="Eliminar"
                                className="text-red-500 cursor-pointer hover:text-red-700"
                              >
                                <Trash size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="py-10 text-center text-gray-500">
              No hay consultas que coincidan con su búsqueda
            </div>
          )}

          {consultas.length === 0 && (
            <div className="py-10 text-center">
              <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-gray-500">Todavía no llegaron consultas</p>
              <p className="text-sm text-gray-400">Las consultas del formulario de contacto van a aparecer acá</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal con el detalle completo de la consulta */}
      {consultaSeleccionada && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/50 sm:items-center sm:p-4"
          onClick={() => setConsultaSeleccionada(null)}
        >
          <div
            className="w-full max-w-lg p-6 bg-white shadow-xl rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold font-montserrat text-primary">
                  {consultaSeleccionada.nombre || 'N/A'}
                </h3>
                <p className="text-sm text-gray-500">{formatearFecha(consultaSeleccionada.fechaCreacion)}</p>
              </div>
              <button
                onClick={() => setConsultaSeleccionada(null)}
                className="p-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">Teléfono</p>
              <p className="text-gray-800">{consultaSeleccionada.telefono || 'N/A'}</p>
            </div>

            <div className="mb-6">
              <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">Consulta</p>
              <p className="text-gray-800 whitespace-pre-wrap">{consultaSeleccionada.mensaje || ''}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {construirLinkWhatsApp(consultaSeleccionada.telefono) && (
                <a
                  href={construirLinkWhatsApp(consultaSeleccionada.telefono)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-green-700 rounded-lg bg-green-50 active:bg-green-100"
                >
                  <MessageCircle size={20} />
                  WhatsApp
                </a>
              )}
              <button
                onClick={() => handleToggleLeida(consultaSeleccionada)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg text-secondary bg-secondary/10 active:bg-secondary/20"
              >
                {consultaSeleccionada.leida ? <Mail size={20} /> : <MailOpen size={20} />}
                {consultaSeleccionada.leida ? 'Marcar como no leída' : 'Marcar como leída'}
              </button>
              <button
                onClick={() => handleEliminar(consultaSeleccionada.id)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 rounded-lg bg-red-50 active:bg-red-100"
              >
                <Trash size={20} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
