// app/cuenta/documentos/page.js
'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, FileText } from 'lucide-react';
import { useCliente } from '../../lib/useClienteAuth';
import { normalizarDocumentos, filtrarDocumentos, TIPOS_DOC } from '../../lib/documentosCliente';
import ListaDocumentos from '../../components/cliente/ListaDocumentos';
import ViewToggle from '../../components/admin/ViewToggle';

function DocumentosHub() {
  const { documentos } = useCliente();
  const searchParams = useSearchParams();

  const todos = useMemo(() => normalizarDocumentos(documentos), [documentos]);

  const tiposPresentes = useMemo(() => {
    const set = new Set(todos.map((d) => d.tipo));
    return Object.keys(TIPOS_DOC).filter((t) => set.has(t));
  }, [todos]);

  const sedesDisponibles = useMemo(() => {
    const set = new Set(todos.map((d) => d.sede).filter(Boolean));
    return Array.from(set).sort();
  }, [todos]);

  const [busqueda, setBusqueda] = useState(searchParams.get('buscar') || '');
  const [sedeFiltro, setSedeFiltro] = useState(searchParams.get('sede') || 'todas');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [tiposActivos, setTiposActivos] = useState(() => {
    const tipoParam = searchParams.get('tipo');
    if (tipoParam && TIPOS_DOC[tipoParam]) return new Set([tipoParam]);
    return new Set(tiposPresentes);
  });
  const [vista, setVista] = useState('cards');

  const toggleTipo = (tipo) => {
    setTiposActivos((prev) => {
      const next = new Set(prev);
      if (next.has(tipo)) next.delete(tipo); else next.add(tipo);
      return next;
    });
  };

  const filtrados = useMemo(() => {
    const porTipo = todos.filter((d) => tiposActivos.has(d.tipo));
    return filtrarDocumentos(porTipo, { busqueda, sede: sedeFiltro, desde, hasta });
  }, [todos, tiposActivos, sedeFiltro, busqueda, desde, hasta]);

  return (
    <div className="container px-4 py-8 mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-montserrat text-primary">Mis Documentos</h2>
        <p className="text-sm text-gray-500">
          Buscá por número o filtrá por tipo{sedesDisponibles.length > 1 ? ', sede' : ''} y fecha.
        </p>
      </div>

      <div className="p-4 space-y-4 bg-white rounded-lg shadow-md">
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
          <ViewToggle vista={vista} onChange={setVista} />
        </div>

        {tiposPresentes.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {tiposPresentes.map((tipo) => {
              const { label, icono: Icono } = TIPOS_DOC[tipo];
              const activo = tiposActivos.has(tipo);
              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => toggleTipo(tipo)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    activo ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icono size={13} /> {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {todos.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-lg shadow-md">
          <FileText size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500">Todavía no tenés documentos.</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No hay documentos que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="p-4 bg-white rounded-lg shadow-md sm:p-6">
          <ListaDocumentos documentos={filtrados} vista={vista} />
        </div>
      )}
    </div>
  );
}

export default function DocumentosPage() {
  return (
    <Suspense fallback={null}>
      <DocumentosHub />
    </Suspense>
  );
}
