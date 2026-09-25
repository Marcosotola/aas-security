// app/components/admin/GrillaPermisos.jsx
'use client';

import { MODULOS, NIVELES } from '../../lib/permisos';

const COLUMNAS = Object.keys(NIVELES);

const AYUDA = {
  ninguno: 'No lo ve',
  ver: 'Ve todo, no modifica',
  propios: 'Solo lo que creó',
  todos: 'Crea, edita y borra todo'
};

// Grilla de un perfil: un nivel por módulo. Los módulos que no son
// documentos no tienen "Propios". Con `soloLectura` se usa como resumen.
export default function GrillaPermisos({ permisos, onChange, soloLectura = false }) {
  const setNivel = (modulo, nivel) => onChange({ ...permisos, [modulo]: nivel });
  const todosA = (nivel) => onChange(Object.fromEntries(Object.entries(MODULOS).map(([m, { niveles }]) => [
    m, niveles.includes(nivel) ? nivel : (nivel === 'propios' ? 'todos' : 'ninguno')
  ])));

  const documentos = Object.entries(MODULOS).filter(([, m]) => m.documento);
  const otros = Object.entries(MODULOS).filter(([, m]) => !m.documento);

  const fila = ([modulo, { label, niveles }]) => {
    const actual = permisos[modulo] || 'ninguno';
    return (
      <tr key={modulo} className="hover:bg-gray-50">
        <td className="sticky left-0 z-10 px-2 py-2 text-gray-800 bg-white">{label}</td>
        {COLUMNAS.map((nivel) => (
          <td key={nivel} className="px-2 py-2 text-center">
            {niveles.includes(nivel) ? (
              <input
                type="radio"
                name={`nivel-${modulo}`}
                checked={actual === nivel}
                disabled={soloLectura}
                onChange={() => setNivel(modulo, nivel)}
                className="w-4 h-4 cursor-pointer accent-[var(--primary)] disabled:cursor-default"
              />
            ) : (
              <span className="text-gray-300">—</span>
            )}
          </td>
        ))}
      </tr>
    );
  };

  const encabezadoGrupo = (titulo) => (
    <tr className="bg-gray-50">
      <td colSpan={COLUMNAS.length + 1} className="px-2 py-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">{titulo}</td>
    </tr>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="sticky left-0 z-10 px-2 py-2 text-xs font-medium text-left text-gray-500 bg-white min-w-[11rem]">Módulo</th>
            {COLUMNAS.map((nivel) => (
              <th key={nivel} className="px-2 py-2 text-xs font-medium text-gray-500">
                {soloLectura ? (
                  <span className="block">{NIVELES[nivel]}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => todosA(nivel)}
                    title={`Poner todo en "${NIVELES[nivel]}"`}
                    className="block w-full px-1 rounded hover:bg-gray-100 hover:text-primary"
                  >
                    {NIVELES[nivel]}
                  </button>
                )}
                <span className="block text-[10px] font-normal text-gray-400 whitespace-nowrap">{AYUDA[nivel]}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {encabezadoGrupo('Documentos')}
          {documentos.map(fila)}
          {encabezadoGrupo('Otros módulos')}
          {otros.map(fila)}
        </tbody>
      </table>
    </div>
  );
}
