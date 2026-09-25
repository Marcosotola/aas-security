'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Building2, X } from 'lucide-react';
import { sedesActivas } from '../lib/empresas';

// Combobox para vincular un documento a una Empresa + Sede (colección
// empresas). Qué clientes ven el documento lo deciden sus accesos a esa
// sede, así que el vínculo actual se muestra siempre y se puede quitar.
// Al elegir, devuelve los datos listos para completar el bloque "cliente"
// del documento; los campos de texto de la página siguen siendo editables.
export default function EmpresaSelector({ empresas, empresaId, sedeId, onSelect, onQuitar, placeholder = 'Buscar empresa registrada...' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [empresaElegida, setEmpresaElegida] = useState(null);
  const [sedeQuery, setSedeQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setEmpresaElegida(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!empresas) return null;

  // Documento ya vinculado: se muestra el vínculo en vez del buscador.
  if (empresaId) {
    const empresa = empresas.find((e) => e.id === empresaId);
    const sede = empresa?.sedes?.find((s) => s.id === sedeId);
    return (
      <div className="flex items-center gap-2 px-3 py-2 mb-3 text-sm border rounded-md border-primary/30 bg-primary/5">
        <Building2 size={16} className="text-primary shrink-0" />
        <span className="flex-1 min-w-0 truncate">
          <span className="font-medium text-gray-800">{empresa?.nombre || 'Empresa no encontrada'}</span>
          <span className="text-gray-500"> · {sede?.nombre || 'Sede no encontrada'}</span>
          {sede && sede.activa === false && <span className="text-gray-400"> (archivada)</span>}
        </span>
        <button
          type="button"
          onClick={onQuitar}
          title="Quitar vínculo con la empresa"
          className="p-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-700"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  const termino = query.trim().toLowerCase();
  const resultados = (termino
    ? empresas.filter((e) =>
      e.nombre?.toLowerCase().includes(termino)
      || e.razonSocial?.toLowerCase().includes(termino)
      || e.cuit?.includes(termino)
      || sedesActivas(e).some((s) => s.nombre?.toLowerCase().includes(termino)))
    : empresas
  ).slice(0, 8);

  const elegirSede = (empresa, sede) => {
    onSelect({
      empresaId: empresa.id,
      sedeId: sede.id,
      empresa: empresa.nombre || '',
      email: empresa.email || '',
      telefono: empresa.telefono || '',
      direccion: sede.direccion || '',
      sedeNombre: sede.nombre
    });
    setEmpresaElegida(null);
    setOpen(false);
    setQuery('');
  };

  const elegirEmpresa = (empresa) => {
    const sedes = sedesActivas(empresa);
    setSedeQuery('');
    // Con una sola sede no hace falta preguntar.
    if (sedes.length === 1) {
      elegirSede(empresa, sedes[0]);
      return;
    }
    setEmpresaElegida(empresa);
    setOpen(false);
  };

  const sq = sedeQuery.trim().toLowerCase();
  const sedesFiltradas = empresaElegida
    ? sedesActivas(empresaElegida).filter((s) => !sq || s.nombre?.toLowerCase().includes(sq) || s.direccion?.toLowerCase().includes(sq))
    : [];

  return (
    <div className="relative mb-3" ref={containerRef}>
      <div className="relative">
        <Search size={14} className="absolute text-gray-400 -translate-y-1/2 left-2 top-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setEmpresaElegida(null); }}
          onFocus={() => { setOpen(true); setEmpresaElegida(null); }}
          placeholder={placeholder}
          className="w-full py-2 pl-7 pr-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-56">
          {resultados.length > 0 ? (
            resultados.map((e) => {
              const cantidad = sedesActivas(e).length;
              return (
                <button
                  type="button"
                  key={e.id}
                  onClick={() => elegirEmpresa(e)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-left border-b border-gray-100 last:border-0 hover:bg-blue-50"
                >
                  <span className="flex-1 mr-2 truncate">{e.nombre}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {cantidad === 0 ? 'Sin sedes' : `${cantidad} ${cantidad === 1 ? 'sede' : 'sedes'}`}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2 text-sm text-gray-400">
              {empresas.length === 0 ? 'Todavía no hay empresas cargadas' : 'Sin resultados'}
            </div>
          )}
        </div>
      )}

      {empresaElegida && (
        <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 bg-gray-50">
            Elegí la sede de {empresaElegida.nombre}
          </div>
          {sedesActivas(empresaElegida).length > 5 && (
            <div className="relative border-b border-gray-100">
              <Search size={13} className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
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
            {sedesActivas(empresaElegida).length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">
                Esta empresa no tiene sedes. Cargalas desde Empresas.
              </div>
            ) : sedesFiltradas.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">Sin sedes que coincidan</div>
            ) : (
              sedesFiltradas.map((sede) => (
                <button
                  type="button"
                  key={sede.id}
                  onClick={() => elegirSede(empresaElegida, sede)}
                  className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left border-b border-gray-100 last:border-0 hover:bg-blue-50"
                >
                  <MapPin size={14} className="text-primary shrink-0" />
                  <span>{sede.nombre}{sede.direccion ? ` — ${sede.direccion}` : ''}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
