// app/components/ClienteSelector.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';

// Combobox para elegir un cliente ya registrado (colección usuarios, rol
// Cliente) y, si tiene más de una sede cargada, elegir cuál. Al confirmar,
// devuelve los datos listos para pisar el bloque "cliente" del documento
// (presupuesto/remito/recibo) más el clienteId para vincularlo al portal.
export default function ClienteSelector({ clientes, onSelect, placeholder = 'Buscar cliente registrado...' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [clienteElegido, setClienteElegido] = useState(null);
  const [sedeQuery, setSedeQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!clientes || clientes.length === 0) return null;

  const terminoBusqueda = query.trim().toLowerCase();
  const resultados = (terminoBusqueda
    ? clientes.filter(c => {
      const nombreCompleto = `${c.nombre || ''} ${c.apellido || ''}`.toLowerCase();
      return nombreCompleto.includes(terminoBusqueda)
        || c.empresa?.toLowerCase().includes(terminoBusqueda)
        || c.email?.toLowerCase().includes(terminoBusqueda);
    })
    : clientes
  ).slice(0, 8);

  const elegirCliente = (cliente) => {
    setClienteElegido(cliente);
    setOpen(false);
    setQuery('');
    setSedeQuery('');

    // Sin sedes cargadas: usamos directamente la dirección principal del cliente.
    if (!cliente.sedes || cliente.sedes.length === 0) {
      onSelect({
        clienteId: cliente.id,
        nombre: `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim(),
        empresa: cliente.empresa || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        sedeId: null,
        sedeNombre: 'Principal'
      });
      setClienteElegido(null);
    }
    // Si tiene sedes, esperamos a que se elija una (ver abajo).
  };

  const elegirSede = (sede) => {
    onSelect({
      clienteId: clienteElegido.id,
      nombre: `${clienteElegido.nombre || ''} ${clienteElegido.apellido || ''}`.trim(),
      empresa: clienteElegido.empresa || '',
      email: clienteElegido.email || '',
      telefono: clienteElegido.telefono || '',
      direccion: sede ? sede.direccion : (clienteElegido.direccion || ''),
      sedeId: sede ? sede.id : null,
      sedeNombre: sede ? sede.nombre : 'Principal'
    });
    setClienteElegido(null);
  };

  return (
    <div className="relative mb-3" ref={containerRef}>
      <div className="relative">
        <Search size={14} className="absolute text-gray-400 -translate-y-1/2 left-2 top-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full py-2 pl-7 pr-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-56">
          {resultados.length > 0 ? (
            resultados.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => elegirCliente(c)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm text-left border-b border-gray-100 last:border-0 hover:bg-blue-50"
              >
                <span className="flex-1 mr-2 truncate">
                  {c.nombre ? `${c.nombre} ${c.apellido || ''}` : c.email}
                  {c.empresa ? ` · ${c.empresa}` : ''}
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap">{c.email}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-400">Sin resultados</div>
          )}
        </div>
      )}

      {clienteElegido && (
        <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 bg-gray-50">
            Elegí la sede de {clienteElegido.nombre} {clienteElegido.apellido}
          </div>
          {clienteElegido.sedes.length > 5 && (
            <div className="relative border-b border-gray-100">
              <Search size={13} className="absolute -translate-y-1/2 left-3 top-1/2 text-gray-400" />
              <input
                type="text"
                value={sedeQuery}
                onChange={(e) => setSedeQuery(e.target.value)}
                placeholder="Buscar sede..."
                autoFocus
                className="w-full py-2 pl-8 pr-2 text-sm focus:outline-none"
              />
            </div>
          )}
          <div className="overflow-y-auto max-h-56">
            <button
              type="button"
              onClick={() => elegirSede(null)}
              className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left border-b border-gray-100 hover:bg-blue-50"
            >
              <MapPin size={14} className="text-gray-400 shrink-0" />
              <span>Dirección principal — {clienteElegido.direccion || 'sin dirección'}</span>
            </button>
            {(() => {
              const sq = sedeQuery.trim().toLowerCase();
              const sedesFiltradas = sq
                ? clienteElegido.sedes.filter((sede) =>
                    sede.nombre?.toLowerCase().includes(sq) || sede.direccion?.toLowerCase().includes(sq)
                  )
                : clienteElegido.sedes;

              if (sedesFiltradas.length === 0) {
                return <div className="px-3 py-2 text-sm text-gray-400">Sin sedes que coincidan</div>;
              }

              return sedesFiltradas.map((sede) => (
                <button
                  type="button"
                  key={sede.id}
                  onClick={() => elegirSede(sede)}
                  className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left border-b border-gray-100 last:border-0 hover:bg-blue-50"
                >
                  <MapPin size={14} className="text-primary shrink-0" />
                  <span>{sede.nombre} — {sede.direccion}</span>
                </button>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
