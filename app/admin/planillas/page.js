// app/admin/planillas/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ListChecks, FilePlus, Edit, Trash, ClipboardList } from 'lucide-react';
import { obtenerPlantillas, eliminarPlantilla } from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';

const GRUPOS = ['Relevamiento', 'Detección', 'Extinción'];

// Hub de "Planillas": gestor de las plantillas de inspección (checklists)
// que después se adjuntan y completan dentro de una Orden de Trabajo. Se
// organizan en 3 grupos fijos, cada uno con sus propias plantillas.
export default function Planillas() {
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [plantillas, setPlantillas] = useState([]);
  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!user) return;
    cargarPlantillas().then(() => setLoadingData(false));
  }, [user]);

  const cargarPlantillas = async () => {
    try {
      setPlantillas(await obtenerPlantillas());
    } catch (error) {
      console.error('Error al cargar las plantillas:', error);
      setPlantillas([]);
    }
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar esta plantilla?')) {
      try {
        await eliminarPlantilla(id);
        setPlantillas(plantillas.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error al eliminar la plantilla:', error);
        alert('Error al eliminar la plantilla. Inténtelo de nuevo más tarde.');
      }
    }
  };

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
            <span className="text-gray-700">Planillas</span>
          </div>

          <Link
            href="/admin/planillas/nueva"
            className="flex items-center px-4 py-2 mb-4 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
          >
            <FilePlus size={18} className="mr-2" /> Nueva Plantilla
          </Link>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Planillas
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Plantillas de inspección que se pueden adjuntar y completar dentro de una Orden de Trabajo.
        </p>

        <div className="space-y-8">
          {GRUPOS.map((grupo) => {
            const plantillasDelGrupo = plantillas.filter((p) => p.grupo === grupo);
            return (
              <div key={grupo}>
                <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-700">
                  <ListChecks size={20} className="mr-2 text-primary" />
                  {grupo}
                </h3>

                {plantillasDelGrupo.length === 0 ? (
                  <div className="p-6 text-sm text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-lg">
                    Todavía no hay plantillas en este grupo.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {plantillasDelGrupo.map((plantilla) => (
                      <div key={plantilla.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex items-start gap-2">
                          <ClipboardList size={18} className="mt-0.5 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{plantilla.titulo}</p>
                            <p className="text-xs text-gray-400">
                              {plantilla.tipo === 'tabular'
                                ? `${plantilla.columnas?.length || 0} columna(s) por ${plantilla.nombreUnidad || 'unidad'}`
                                : `${plantilla.items?.length || 0} ítem(s)`}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-4 pt-3 mt-3 border-t border-gray-100">
                          <Link
                            href={`/admin/planillas/editar/${plantilla.id}`}
                            title="Editar"
                            className="text-secondary hover:text-secondary-light"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleEliminar(plantilla.id)}
                            title="Eliminar"
                            className="text-red-500 cursor-pointer hover:text-red-700"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
