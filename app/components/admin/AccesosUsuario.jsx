// app/components/admin/AccesosUsuario.jsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Building2, KeyRound, Search, Trash, ChevronDown } from 'lucide-react';
import { TIPOS_DOC } from '../../lib/documentosCliente';
import { esSedeActiva } from '../../lib/empresas';

// Encabezados cortos para que la grilla entre en pantalla.
const ETIQUETA_CORTA = {
  presupuesto: 'Presup.',
  remito: 'Remito',
  recibo: 'Recibo',
  factura: 'Factura',
  certificado: 'Certif.',
  estado: 'Estado cta.',
  orden: 'OT',
  mantenimiento: 'Mant. prev.',
  informe: 'Informe'
};

const TIPOS = Object.keys(TIPOS_DOC);
const TODAS = '*';

// Quita sedes sin tipos y empresas sin sedes, para no guardar basura.
function limpiar(accesos) {
  const limpio = {};
  for (const [empresaId, porSede] of Object.entries(accesos)) {
    const sedes = Object.fromEntries(Object.entries(porSede).filter(([, tipos]) => tipos.length > 0));
    if (Object.keys(sedes).length > 0) limpio[empresaId] = sedes;
  }
  return limpio;
}

const mismoContenido = (a, b) => JSON.stringify(limpiar(a)) === JSON.stringify(limpiar(b));

function GrillaEmpresa({ empresa, porSede, onChange, onQuitar }) {
  const [busqueda, setBusqueda] = useState('');
  const [abierta, setAbierta] = useState(true);

  const tiposTodas = porSede[TODAS] || [];
  // Sedes activas, más las archivadas que todavía tienen algún acceso.
  const sedes = (empresa.sedes || []).filter((s) => esSedeActiva(s) || (porSede[s.id] || []).length > 0);
  const q = busqueda.trim().toLowerCase();
  const sedesVisibles = q
    ? sedes.filter((s) => s.nombre?.toLowerCase().includes(q) || s.direccion?.toLowerCase().includes(q))
    : sedes;

  const tiene = (sedeId, tipo) => (porSede[sedeId] || []).includes(tipo);
  const setFila = (sedeId, tipos) => onChange({ ...porSede, [sedeId]: tipos });

  const toggleCelda = (sedeId, tipo) => {
    const actuales = porSede[sedeId] || [];
    setFila(sedeId, actuales.includes(tipo) ? actuales.filter((t) => t !== tipo) : [...actuales, tipo]);
  };

  const filaCompleta = (sedeId) => TIPOS.every((t) => tiene(sedeId, t));
  const toggleFila = (sedeId) => setFila(sedeId, filaCompleta(sedeId) ? [] : [...TIPOS]);

  // La columna actúa sobre las sedes visibles (respeta el buscador).
  const columnaCompleta = (tipo) => sedesVisibles.length > 0 && sedesVisibles.every((s) => tiene(s.id, tipo));
  const toggleColumna = (tipo) => {
    const marcar = !columnaCompleta(tipo);
    const nuevo = { ...porSede };
    for (const s of sedesVisibles) {
      const actuales = nuevo[s.id] || [];
      nuevo[s.id] = marcar ? [...new Set([...actuales, tipo])] : actuales.filter((t) => t !== tipo);
    }
    onChange(nuevo);
  };

  const cantidadSedes = Object.entries(porSede).filter(([id, tipos]) => id !== TODAS && tipos.length > 0).length;
  const resumen = tiposTodas.length > 0
    ? `Todas las sedes: ${tiposTodas.length} ${tiposTodas.length === 1 ? 'tipo' : 'tipos'}${cantidadSedes ? ` · ${cantidadSedes} con accesos propios` : ''}`
    : `${cantidadSedes} de ${sedes.length} ${sedes.length === 1 ? 'sede' : 'sedes'} con acceso`;

  const celda = 'px-1 py-2 text-center';
  const checkbox = 'w-4 h-4 accent-[var(--primary)] cursor-pointer disabled:cursor-default';

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-t-lg">
        <button type="button" onClick={() => setAbierta((a) => !a)} className="flex items-center flex-1 min-w-0 gap-2 text-left">
          <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${abierta ? '' : '-rotate-90'}`} />
          <Building2 size={16} className="shrink-0 text-primary" />
          <span className="font-medium text-gray-800 truncate">{empresa.nombre}</span>
          <span className="hidden text-xs text-gray-500 truncate sm:inline">· {resumen}</span>
        </button>
        <Link href={`/admin/empresas/${empresa.id}`} className="text-xs text-primary hover:underline shrink-0">Ver empresa</Link>
        <button
          type="button"
          onClick={onQuitar}
          title="Quitar todos los accesos a esta empresa"
          className="p-1.5 text-red-500 rounded-full hover:bg-red-50 shrink-0"
        >
          <Trash size={16} />
        </button>
      </div>

      {abierta && (
        <div className="p-3">
          {sedes.length > 8 && (
            <div className="relative max-w-xs mb-3">
              <Search size={14} className="absolute text-gray-400 -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Filtrar sedes..."
                className="w-full py-1.5 pr-2 text-sm border border-gray-300 rounded-md pl-7"
              />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="sticky left-0 z-10 px-2 py-2 text-xs font-medium text-left text-gray-500 bg-white min-w-[10rem]">Sede</th>
                  <th className="px-1 py-2 text-xs font-medium text-gray-500">Todo</th>
                  {TIPOS.map((tipo) => {
                    const Icono = TIPOS_DOC[tipo].icono;
                    return (
                      <th key={tipo} className="px-1 py-2 text-xs font-medium text-gray-500">
                        <button
                          type="button"
                          onClick={() => toggleColumna(tipo)}
                          title={`Marcar/desmarcar ${TIPOS_DOC[tipo].label} en ${q ? 'las sedes filtradas' : 'todas las sedes'}`}
                          className="flex flex-col items-center w-full gap-0.5 px-1 rounded hover:bg-gray-100 hover:text-primary"
                        >
                          <Icono size={14} />
                          <span className="whitespace-nowrap">{ETIQUETA_CORTA[tipo]}</span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="bg-blue-50/50">
                  <td className="sticky left-0 z-10 px-2 py-2 bg-blue-50">
                    <div className="font-medium text-gray-800">Todas las sedes</div>
                    <div className="text-xs text-gray-500">Incluye las que se agreguen después</div>
                  </td>
                  <td className={celda}>
                    <input type="checkbox" className={checkbox} checked={filaCompleta(TODAS)} onChange={() => toggleFila(TODAS)} />
                  </td>
                  {TIPOS.map((tipo) => (
                    <td key={tipo} className={celda}>
                      <input type="checkbox" className={checkbox} checked={tiene(TODAS, tipo)} onChange={() => toggleCelda(TODAS, tipo)} />
                    </td>
                  ))}
                </tr>
                {sedesVisibles.map((sede) => (
                  <tr key={sede.id} className="hover:bg-gray-50">
                    <td className="sticky left-0 z-10 px-2 py-2 bg-white">
                      <div className="text-gray-800">
                        {sede.nombre}
                        {!esSedeActiva(sede) && <span className="ml-1 text-xs text-gray-400">(archivada)</span>}
                      </div>
                      {sede.direccion && <div className="text-xs text-gray-400">{sede.direccion}</div>}
                    </td>
                    <td className={celda}>
                      <input type="checkbox" className={checkbox} checked={filaCompleta(sede.id)} onChange={() => toggleFila(sede.id)} />
                    </td>
                    {TIPOS.map((tipo) => {
                      // Si "Todas las sedes" ya habilita este tipo, la celda
                      // se muestra marcada y bloqueada: no cambia nada tocarla.
                      const cubierto = tiposTodas.includes(tipo);
                      return (
                        <td key={tipo} className={celda}>
                          <input
                            type="checkbox"
                            className={`${checkbox} ${cubierto ? 'opacity-40' : ''}`}
                            checked={cubierto || tiene(sede.id, tipo)}
                            disabled={cubierto}
                            title={cubierto ? 'Ya habilitado por "Todas las sedes"' : undefined}
                            onChange={() => toggleCelda(sede.id, tipo)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {sedesVisibles.length === 0 && (
                  <tr>
                    <td colSpan={TIPOS.length + 2} className="px-2 py-3 text-sm text-gray-400">
                      {sedes.length === 0 ? 'Esta empresa no tiene sedes cargadas.' : 'Sin sedes que coincidan.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Grilla de accesos de un usuario Cliente: para cada empresa, qué tipos de
// documento puede ver en cada sede (o en todas). Se edita en memoria y se
// guarda de una vez con `onGuardar(accesos)`.
export default function AccesosUsuario({ accesosIniciales = {}, empresas, onGuardar }) {
  const [guardados, setGuardados] = useState(accesosIniciales);
  const [accesos, setAccesos] = useState(accesosIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);

  const empresasPorId = useMemo(() => new Map(empresas.map((e) => [e.id, e])), [empresas]);
  const hayCambios = !mismoContenido(accesos, guardados);

  const termino = busqueda.trim().toLowerCase();
  const candidatas = termino
    ? empresas.filter((e) => !accesos[e.id] && e.nombre?.toLowerCase().includes(termino)).slice(0, 8)
    : [];

  const agregarEmpresa = (empresa) => {
    setAccesos({ ...accesos, [empresa.id]: {} });
    setBusqueda('');
  };

  const quitarEmpresa = (empresaId) => {
    const nombre = empresasPorId.get(empresaId)?.nombre || 'esta empresa';
    if (!confirm(`¿Quitar todos los accesos a ${nombre}? (Se aplica al guardar.)`)) return;
    const { [empresaId]: _, ...resto } = accesos;
    setAccesos(resto);
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      const limpio = limpiar(accesos);
      await onGuardar(limpio);
      setGuardados(limpio);
      // Las empresas agregadas sin ningún tildado se mantienen en pantalla.
      setAccesos((actual) => ({ ...Object.fromEntries(Object.keys(actual).map((id) => [id, {}])), ...limpio }));
    } catch (error) {
      console.error('Error al guardar los accesos:', error);
      alert('No se pudieron guardar los accesos. Inténtelo de nuevo más tarde.');
    } finally {
      setGuardando(false);
    }
  };

  const empresaIds = Object.keys(accesos);

  return (
    <div className="p-4 mb-6 bg-white rounded-lg shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-1">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
          <KeyRound size={18} className="text-primary" /> Accesos
        </h3>
        {hayCambios && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAccesos(guardados)}
              disabled={guardando}
              className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-light disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        )}
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Qué documentos ve esta persona en su portal: por empresa, sede y tipo de documento.
      </p>

      <div className="space-y-4">
        {empresaIds.map((empresaId) => {
          const empresa = empresasPorId.get(empresaId);
          if (!empresa) {
            return (
              <div key={empresaId} className="flex items-center justify-between px-4 py-3 text-sm border border-gray-200 rounded-lg">
                <span className="text-gray-500">Empresa eliminada ({empresaId})</span>
                <button type="button" onClick={() => quitarEmpresa(empresaId)} className="text-red-500 hover:underline">Quitar</button>
              </div>
            );
          }
          return (
            <GrillaEmpresa
              key={empresaId}
              empresa={empresa}
              porSede={accesos[empresaId]}
              onChange={(porSede) => setAccesos({ ...accesos, [empresaId]: porSede })}
              onQuitar={() => quitarEmpresa(empresaId)}
            />
          );
        })}
      </div>

      {empresaIds.length === 0 && (
        <p className="mb-2 text-sm text-gray-400">Sin accesos: esta persona no ve ningún documento en su portal.</p>
      )}

      <div className="relative max-w-md mt-4">
        <Search size={14} className="absolute text-gray-400 -translate-y-1/2 left-2 top-1/2" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Agregar empresa..."
          className="w-full py-2 pr-2 text-sm border border-gray-300 rounded-md pl-7"
        />
        {termino && (
          <div className="absolute left-0 right-0 z-20 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-56">
            {candidatas.length > 0 ? candidatas.map((e) => (
              <button
                type="button"
                key={e.id}
                onClick={() => agregarEmpresa(e)}
                className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left border-b border-gray-100 last:border-0 hover:bg-blue-50"
              >
                <Building2 size={14} className="text-gray-400" /> {e.nombre}
              </button>
            )) : (
              <div className="px-3 py-2 text-sm text-gray-400">Sin resultados</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
