// app/components/planillas/PlanillasAdjuntas.jsx
'use client';

import { Fragment, useRef, useState } from 'react';
import { Plus, X, ChevronDown, Info, PlusCircle } from 'lucide-react';
import PortalDropdown from '../PortalDropdown';

const ESTADOS_BASE = [
  { value: 'OK', label: 'OK', claseActivo: 'bg-success text-white border-transparent' },
  { value: 'NOK', label: 'N OK', claseActivo: 'bg-danger text-white border-transparent' }
];
const ESTADO_NA = { value: 'NA', label: 'N/A', claseActivo: 'bg-gray-500 text-white border-transparent' };
// Los ítems de tipo "lista" siempre incluyen N/A; las plantillas tabulares
// (ver abajo) lo incluyen solo si la plantilla lo pide (`incluyeNA`).
const ESTADOS = [...ESTADOS_BASE, ESTADO_NA];

const SEVERIDADES = [
  { value: 'LEVE', claseActivo: 'bg-warning text-white border-transparent' },
  { value: 'MODERADA', claseActivo: 'bg-orange-600 text-white border-transparent' },
  { value: 'CRITICA', claseActivo: 'bg-danger text-white border-transparent' }
];

// Selector para adjuntar plantillas de inspección (checklists) a una Orden de
// Trabajo y completarlas ahí mismo. `plantillasDisponibles` viene precargada
// por la página (mismo patrón que ClienteSelector recibe `clientes` por
// prop). Al adjuntar una plantilla se toma una foto de sus ítems tal como
// están en ese momento -- si la plantilla se edita después, las OT ya
// creadas no cambian (mismo criterio que el snapshot de "cliente").
export default function PlanillasAdjuntas({ plantillasDisponibles, planillasAdjuntas, onChange }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [guiasAbiertas, setGuiasAbiertas] = useState(new Set());
  const btnRef = useRef(null);

  const toggleGuia = (clave) => {
    setGuiasAbiertas((actual) => {
      const nuevo = new Set(actual);
      if (nuevo.has(clave)) {
        nuevo.delete(clave);
      } else {
        nuevo.add(clave);
      }
      return nuevo;
    });
  };

  const disponibles = plantillasDisponibles.filter(
    (p) => !planillasAdjuntas.some((a) => a.plantillaId === p.id)
  );
  const grupos = [...new Set(disponibles.map((p) => p.grupo))];

  const adjuntar = (plantilla) => {
    if (plantilla.tipo === 'tabular') {
      onChange([
        ...planillasAdjuntas,
        {
          plantillaId: plantilla.id,
          grupo: plantilla.grupo,
          titulo: plantilla.titulo,
          tipo: 'tabular',
          nombreUnidad: plantilla.nombreUnidad || 'Unidad',
          incluyeNA: plantilla.incluyeNA || false,
          camposTexto: (plantilla.camposTexto || []).map((c) => c.nombre),
          columnas: (plantilla.columnas || []).map((col) => col.nombre),
          unidades: []
        }
      ]);
    } else {
      onChange([
        ...planillasAdjuntas,
        {
          plantillaId: plantilla.id,
          grupo: plantilla.grupo,
          titulo: plantilla.titulo,
          items: (plantilla.items || []).map((item) => ({
            descripcion: item.descripcion,
            guia: item.guia || '',
            subtitulo: item.subtitulo || '',
            estado: null,
            observacion: '',
            severidad: null
          }))
        }
      ]);
    }
    setMenuAbierto(false);
  };

  const quitar = (planillaIndex) => {
    onChange(planillasAdjuntas.filter((_, i) => i !== planillaIndex));
  };

  const actualizarItem = (planillaIndex, itemIndex, cambios) => {
    onChange(planillasAdjuntas.map((planilla, i) => {
      if (i !== planillaIndex) return planilla;
      return {
        ...planilla,
        items: planilla.items.map((item, j) => (j === itemIndex ? { ...item, ...cambios } : item))
      };
    }));
  };

  const agregarUnidad = (planillaIndex) => {
    onChange(planillasAdjuntas.map((planilla, i) => {
      if (i !== planillaIndex) return planilla;
      const unidades = [
        ...planilla.unidades,
        { numero: String(planilla.unidades.length + 1), campos: {}, valores: {}, observacion: '', severidad: null }
      ];
      return { ...planilla, unidades };
    }));
  };

  const quitarUnidad = (planillaIndex, unidadIndex) => {
    onChange(planillasAdjuntas.map((planilla, i) => {
      if (i !== planillaIndex) return planilla;
      return { ...planilla, unidades: planilla.unidades.filter((_, j) => j !== unidadIndex) };
    }));
  };

  const actualizarUnidad = (planillaIndex, unidadIndex, cambios) => {
    onChange(planillasAdjuntas.map((planilla, i) => {
      if (i !== planillaIndex) return planilla;
      return {
        ...planilla,
        unidades: planilla.unidades.map((u, j) => (j === unidadIndex ? { ...u, ...cambios } : u))
      };
    }));
  };

  const actualizarCampoTexto = (planillaIndex, unidadIndex, campo, valor) => {
    onChange(planillasAdjuntas.map((planilla, i) => {
      if (i !== planillaIndex) return planilla;
      return {
        ...planilla,
        unidades: planilla.unidades.map((u, j) => (
          j === unidadIndex ? { ...u, campos: { ...u.campos, [campo]: valor } } : u
        ))
      };
    }));
  };

  const actualizarValorColumna = (planillaIndex, unidadIndex, columna, valor) => {
    onChange(planillasAdjuntas.map((planilla, i) => {
      if (i !== planillaIndex) return planilla;
      return {
        ...planilla,
        unidades: planilla.unidades.map((u, j) => (
          j === unidadIndex ? { ...u, valores: { ...u.valores, [columna]: valor } } : u
        ))
      };
    }));
  };

  return (
    <div>
      <div className="relative inline-block">
        <button
          type="button"
          ref={btnRef}
          onClick={() => setMenuAbierto((o) => !o)}
          className="flex items-center px-4 py-2 text-sm text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
        >
          <Plus size={18} className="mr-2" /> Adjuntar planilla <ChevronDown size={14} className="ml-2" />
        </button>

        <PortalDropdown open={menuAbierto} anchorRef={btnRef} onClose={() => setMenuAbierto(false)} width={260}>
          <div className="overflow-y-auto max-h-72">
            {grupos.length === 0 ? (
              <div className="px-3 py-3 text-sm text-gray-400">No hay más planillas para adjuntar</div>
            ) : (
              grupos.map((grupo) => (
                <div key={grupo}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase bg-gray-50">{grupo}</div>
                  {disponibles.filter((p) => p.grupo === grupo).map((plantilla) => (
                    <button
                      key={plantilla.id}
                      type="button"
                      onClick={() => adjuntar(plantilla)}
                      className="block w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-blue-50"
                    >
                      {plantilla.titulo}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </PortalDropdown>
      </div>

      {planillasAdjuntas.length === 0 && (
        <p className="mt-3 text-sm text-gray-400">Todavía no se adjuntó ninguna planilla.</p>
      )}

      <div className="mt-4 space-y-4">
        {planillasAdjuntas.map((planilla, planillaIndex) => (
          <div key={`${planilla.plantillaId}-${planillaIndex}`} className="overflow-hidden border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">{planilla.grupo}</p>
                <p className="font-medium text-gray-800">{planilla.titulo}</p>
              </div>
              <button
                type="button"
                onClick={() => quitar(planillaIndex)}
                title="Quitar planilla"
                className="text-gray-400 hover:text-red-600"
              >
                <X size={18} />
              </button>
            </div>

            {planilla.tipo === 'tabular' ? (
              <div className="p-4">
                {planilla.unidades.length === 0 && (
                  <p className="mb-3 text-sm text-gray-400">Todavía no se cargó ningún {planilla.nombreUnidad.toLowerCase()}.</p>
                )}
                <div className="space-y-4">
                  {planilla.unidades.map((unidad, unidadIndex) => {
                    const estadosDisponibles = planilla.incluyeNA ? [...ESTADOS_BASE, ESTADO_NA] : ESTADOS_BASE;
                    return (
                      <div key={unidadIndex} className="border border-gray-200 rounded-md">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
                          <p className="text-sm font-semibold text-gray-800">{planilla.nombreUnidad} {unidad.numero}</p>
                          <button
                            type="button"
                            onClick={() => quitarUnidad(planillaIndex, unidadIndex)}
                            title="Quitar"
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="p-3">
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div>
                              <label className="block mb-1 text-xs text-gray-500">Número</label>
                              <input
                                type="text"
                                value={unidad.numero}
                                onChange={(e) => actualizarUnidad(planillaIndex, unidadIndex, { numero: e.target.value })}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                              />
                            </div>
                            {(planilla.camposTexto || []).map((campo) => (
                              <div key={campo}>
                                <label className="block mb-1 text-xs text-gray-500">{campo}</label>
                                <input
                                  type="text"
                                  value={unidad.campos?.[campo] || ''}
                                  onChange={(e) => actualizarCampoTexto(planillaIndex, unidadIndex, campo, e.target.value)}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                                />
                              </div>
                            ))}
                          </div>

                          <div className="space-y-2">
                            {planilla.columnas.map((columna) => (
                              <div key={columna} className="flex items-center justify-between gap-2">
                                <span className="flex-1 text-sm text-gray-700">{columna}</span>
                                <div className="flex gap-1 shrink-0">
                                  {estadosDisponibles.map((estado) => (
                                    <button
                                      key={estado.value}
                                      type="button"
                                      onClick={() => actualizarValorColumna(planillaIndex, unidadIndex, columna, estado.value)}
                                      className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                                        unidad.valores[columna] === estado.value
                                          ? estado.claseActivo
                                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                      }`}
                                    >
                                      {estado.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          <textarea
                            value={unidad.observacion}
                            onChange={(e) => actualizarUnidad(planillaIndex, unidadIndex, { observacion: e.target.value })}
                            className="w-full px-3 py-2 mt-3 text-sm border border-gray-300 rounded-md"
                            placeholder="Observación (opcional)"
                            rows={2}
                          />

                          {unidad.observacion?.trim() && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {SEVERIDADES.map((severidad) => (
                                <button
                                  key={severidad.value}
                                  type="button"
                                  onClick={() => actualizarUnidad(planillaIndex, unidadIndex, {
                                    severidad: unidad.severidad === severidad.value ? null : severidad.value
                                  })}
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                                    unidad.severidad === severidad.value
                                      ? severidad.claseActivo
                                      : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {severidad.value}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => agregarUnidad(planillaIndex)}
                  className="flex items-center mt-4 text-blue-500 hover:text-blue-700"
                >
                  <PlusCircle size={18} className="mr-1" /> Agregar {planilla.nombreUnidad}
                </button>
              </div>
            ) : (
            <div className="divide-y divide-gray-100">
              {planilla.items.map((item, itemIndex) => {
                const claveGuia = `${planillaIndex}-${itemIndex}`;
                const guiaAbierta = guiasAbiertas.has(claveGuia);
                return (
                <Fragment key={itemIndex}>
                {item.subtitulo && (
                  <div className="px-4 py-2 text-xs font-bold tracking-wide text-gray-500 uppercase bg-gray-100">
                    {item.subtitulo}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-gray-700">{itemIndex + 1}. {item.descripcion}</p>
                    {item.guia && (
                      <button
                        type="button"
                        onClick={() => toggleGuia(claveGuia)}
                        className="flex items-center gap-1 text-xs text-secondary hover:text-secondary-light shrink-0"
                      >
                        <Info size={13} /> {guiaAbierta ? 'Ocultar guía' : 'Ver guía'}
                      </button>
                    )}
                  </div>

                  {item.guia && guiaAbierta && (
                    <p className="p-2 mb-2 text-xs text-gray-600 rounded bg-blue-50">{item.guia}</p>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    {ESTADOS.map((estado) => (
                      <button
                        key={estado.value}
                        type="button"
                        onClick={() => actualizarItem(planillaIndex, itemIndex, { estado: estado.value })}
                        className={`py-2.5 rounded-md text-sm font-semibold border transition-colors ${
                          item.estado === estado.value
                            ? estado.claseActivo
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {estado.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={item.observacion}
                    onChange={(e) => actualizarItem(planillaIndex, itemIndex, { observacion: e.target.value })}
                    className="w-full px-3 py-2 mt-2 text-sm border border-gray-300 rounded-md"
                    placeholder="Observación (opcional)"
                    rows={2}
                  />

                  {item.observacion?.trim() && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {SEVERIDADES.map((severidad) => (
                        <button
                          key={severidad.value}
                          type="button"
                          onClick={() => actualizarItem(planillaIndex, itemIndex, {
                            severidad: item.severidad === severidad.value ? null : severidad.value
                          })}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                            item.severidad === severidad.value
                              ? severidad.claseActivo
                              : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {severidad.value}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                </Fragment>
                );
              })}
            </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
