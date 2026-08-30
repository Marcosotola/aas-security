// app/cuenta/page.js
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FileText, MapPin, User, ChevronRight, Search, X } from 'lucide-react';
import { useCliente } from '../lib/useClienteAuth';
import { normalizarDocumentos, filtrarDocumentos } from '../lib/documentosCliente';
import ListaDocumentos from '../components/cliente/ListaDocumentos';
import ViewToggle from '../components/admin/ViewToggle';

export default function Cuenta() {
  const { perfil, documentos } = useCliente();
  const [vista, setVista] = useState('tabla');
  const [busqueda, setBusqueda] = useState('');
  const [sedeFiltro, setSedeFiltro] = useState('todas');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const todos = useMemo(() => normalizarDocumentos(documentos), [documentos]);
  const cantidadSedes = (perfil.sedes || []).length;

  const sedesDisponibles = useMemo(() => {
    const set = new Set(todos.map((d) => d.sede).filter(Boolean));
    return Array.from(set).sort();
  }, [todos]);

  const hayFiltros = busqueda.trim() !== '' || sedeFiltro !== 'todas' || desde !== '' || hasta !== '';

  const resultados = useMemo(() => {
    if (!hayFiltros) return todos.slice(0, 5);
    return filtrarDocumentos(todos, { busqueda, sede: sedeFiltro, desde, hasta });
  }, [todos, hayFiltros, busqueda, sedeFiltro, desde, hasta]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setSedeFiltro('todas');
    setDesde('');
    setHasta('');
  };

  return (
    <div className="container px-4 py-8 mx-auto space-y-6">
      <h2 className="text-2xl font-bold font-montserrat text-primary">
        Hola, {perfil.nombre}
      </h2>

      {/* Accesos rápidos: Documentos es lo que se usa a diario, Sedes y
          Perfil se abren poco (alta/baja de sede, corrección de datos), así
          que quedan acá como acceso ocasional en vez de ocupar la nav. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/cuenta/documentos" className="flex items-center gap-4 p-5 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary shrink-0">
            <FileText size={22} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-800">Documentos</div>
            <div className="text-sm text-gray-500">{todos.length} en total</div>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </Link>

        <Link href="/cuenta/sedes" className="flex items-center gap-4 p-5 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary shrink-0">
            <MapPin size={22} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-800">Mis Sedes</div>
            <div className="text-sm text-gray-500">{cantidadSedes} cargada{cantidadSedes === 1 ? '' : 's'}</div>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </Link>

        <Link href="/cuenta/perfil" className="flex items-center gap-4 p-5 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary shrink-0">
            <User size={22} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-800">Mi Perfil</div>
            <div className="text-sm text-gray-500">Datos de contacto</div>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </Link>
      </div>

      {/* Buscador general: cualquier tipo de documento, por número, sede,
          concepto o fecha. Sin filtros activos muestra los últimos 5; en
          cuanto hay algo escrito o seleccionado, pasa a mostrar resultados
          reales (no limitados a 5) con las mismas acciones Ver/Descargar
          que el hub completo (/cuenta/documentos, ver ListaDocumentos.jsx). */}
      <div className="p-4 space-y-4 bg-white rounded-lg shadow-md">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Buscar documentos</h3>
          <p className="text-sm text-gray-500">Por número, sede, concepto o fecha — de cualquier tipo de documento.</p>
        </div>

        <div className="relative">
          <Search size={16} className="absolute -translate-y-1/2 left-3 top-1/2 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por número, sede, concepto..."
            className="w-full py-2 pl-9 pr-9 text-sm border border-gray-300 rounded-md"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              title="Limpiar búsqueda"
              className="absolute p-1 -translate-y-1/2 rounded-full right-1.5 top-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {sedesDisponibles.length > 1 && (
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Sede</label>
              <select
                value={sedeFiltro}
                onChange={(e) => setSedeFiltro(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md"
              >
                <option value="todas">Todas las sedes</option>
                {sedesDisponibles.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-500">Desde</label>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-500">Hasta</label>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-md" />
          </div>
          {hayFiltros && (
            <button type="button" onClick={limpiarFiltros} className="px-2 py-2 text-xs text-gray-500 hover:text-gray-700 hover:underline">
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            {hayFiltros ? `Resultados (${resultados.length})` : 'Últimos documentos'}
          </h3>
          <div className="flex items-center gap-3">
            {resultados.length > 0 && <ViewToggle vista={vista} onChange={setVista} />}
            {!hayFiltros && todos.length > 0 && (
              <Link href="/cuenta/documentos" className="text-sm whitespace-nowrap text-primary hover:underline">Ver todos</Link>
            )}
          </div>
        </div>

        {resultados.length === 0 ? (
          <p className="text-sm text-gray-400">
            {hayFiltros ? 'No hay documentos que coincidan con la búsqueda.' : 'Todavía no tenés documentos.'}
          </p>
        ) : (
          <ListaDocumentos documentos={resultados} vista={vista} />
        )}
      </div>
    </div>
  );
}
