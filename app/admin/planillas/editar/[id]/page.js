'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Save, Trash, PlusCircle, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { obtenerPlantillaPorId, actualizarPlantilla, eliminarPlantilla } from '../../../../lib/firestore';
import { useStaffAuth } from '../../../../lib/useStaffAuth';

const GRUPOS = ['Relevamiento', 'Detección', 'Extinción'];
const TIPOS = [
  { value: 'lista', label: 'Lista simple', descripcion: 'Ítems sueltos, cada uno con su propio OK / N OK / N/A.' },
  { value: 'tabular', label: 'Tabular por unidades', descripcion: 'El mismo set de columnas se repite por cada elemento numerado (ej. hidrantes, extintores).' }
];

export default function EditarPlantilla({ params }) {
  const { id } = use(params);

  const router = useRouter();
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const loading = loadingAuth || loadingData;

  const [plantilla, setPlantilla] = useState({
    grupo: GRUPOS[0],
    titulo: '',
    tipo: 'lista',
    items: [{ descripcion: '', guia: '', subtitulo: '' }],
    nombreUnidad: '',
    incluyeNA: false,
    camposTexto: [{ nombre: '' }],
    columnas: [{ nombre: '' }]
  });

  useEffect(() => {
    if (!id || !user) return;

    (async () => {
      try {
        const data = await obtenerPlantillaPorId(id);
        setPlantilla({
          grupo: data.grupo || GRUPOS[0],
          titulo: data.titulo || '',
          tipo: data.tipo || 'lista',
          items: data.items?.length ? data.items : [{ descripcion: '', guia: '', subtitulo: '' }],
          nombreUnidad: data.nombreUnidad || '',
          incluyeNA: data.incluyeNA || false,
          camposTexto: data.camposTexto?.length ? data.camposTexto : [{ nombre: '' }],
          columnas: data.columnas?.length ? data.columnas : [{ nombre: '' }]
        });
        setLoadingData(false);
      } catch (error) {
        console.error('Error al cargar la plantilla:', error);
        alert('Error al cargar los datos de la plantilla.');
        router.push('/admin/planillas');
      }
    })();
  }, [id, user, router]);

  const handleItemChange = (index, field, value) => {
    const items = plantilla.items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    setPlantilla({ ...plantilla, items });
  };

  const agregarItem = () => {
    setPlantilla({ ...plantilla, items: [...plantilla.items, { descripcion: '', guia: '', subtitulo: '' }] });
  };

  const quitarItem = (index) => {
    if (plantilla.items.length === 1) return;
    setPlantilla({ ...plantilla, items: plantilla.items.filter((_, i) => i !== index) });
  };

  const moverItem = (index, direccion) => {
    const destino = index + direccion;
    if (destino < 0 || destino >= plantilla.items.length) return;
    const items = [...plantilla.items];
    [items[index], items[destino]] = [items[destino], items[index]];
    setPlantilla({ ...plantilla, items });
  };

  const handleCampoTextoChange = (index, value) => {
    const camposTexto = plantilla.camposTexto.map((c, i) => (i === index ? { nombre: value } : c));
    setPlantilla({ ...plantilla, camposTexto });
  };

  const agregarCampoTexto = () => {
    setPlantilla({ ...plantilla, camposTexto: [...plantilla.camposTexto, { nombre: '' }] });
  };

  const quitarCampoTexto = (index) => {
    setPlantilla({ ...plantilla, camposTexto: plantilla.camposTexto.filter((_, i) => i !== index) });
  };

  const moverCampoTexto = (index, direccion) => {
    const destino = index + direccion;
    if (destino < 0 || destino >= plantilla.camposTexto.length) return;
    const camposTexto = [...plantilla.camposTexto];
    [camposTexto[index], camposTexto[destino]] = [camposTexto[destino], camposTexto[index]];
    setPlantilla({ ...plantilla, camposTexto });
  };

  const handleColumnaChange = (index, value) => {
    const columnas = plantilla.columnas.map((col, i) => (i === index ? { nombre: value } : col));
    setPlantilla({ ...plantilla, columnas });
  };

  const agregarColumna = () => {
    setPlantilla({ ...plantilla, columnas: [...plantilla.columnas, { nombre: '' }] });
  };

  const quitarColumna = (index) => {
    if (plantilla.columnas.length === 1) return;
    setPlantilla({ ...plantilla, columnas: plantilla.columnas.filter((_, i) => i !== index) });
  };

  const moverColumna = (index, direccion) => {
    const destino = index + direccion;
    if (destino < 0 || destino >= plantilla.columnas.length) return;
    const columnas = [...plantilla.columnas];
    [columnas[index], columnas[destino]] = [columnas[destino], columnas[index]];
    setPlantilla({ ...plantilla, columnas });
  };

  const handleGuardar = async () => {
    if (!plantilla.titulo.trim()) {
      alert('Por favor, ingrese un título para la plantilla.');
      return;
    }

    let payload;
    if (plantilla.tipo === 'tabular') {
      if (!plantilla.nombreUnidad.trim()) {
        alert('Por favor, ingrese el nombre de la unidad (ej: Hidrante).');
        return;
      }
      const columnas = plantilla.columnas.filter((col) => col.nombre.trim());
      if (columnas.length === 0) {
        alert('Agregue al menos una columna a chequear.');
        return;
      }
      const camposTexto = plantilla.camposTexto.filter((c) => c.nombre.trim());
      payload = {
        grupo: plantilla.grupo,
        titulo: plantilla.titulo.trim(),
        tipo: 'tabular',
        nombreUnidad: plantilla.nombreUnidad.trim(),
        incluyeNA: plantilla.incluyeNA,
        camposTexto,
        columnas
      };
    } else {
      const items = plantilla.items.filter((item) => item.descripcion.trim());
      if (items.length === 0) {
        alert('Agregue al menos un ítem.');
        return;
      }
      payload = {
        grupo: plantilla.grupo,
        titulo: plantilla.titulo.trim(),
        tipo: 'lista',
        items
      };
    }

    setGuardando(true);
    try {
      await actualizarPlantilla(id, payload);
      router.push('/admin/planillas');
    } catch (error) {
      console.error('Error al actualizar la plantilla:', error);
      alert('Error al actualizar la plantilla. Inténtelo de nuevo más tarde.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (confirm('¿Está seguro de que desea eliminar esta plantilla?')) {
      try {
        await eliminarPlantilla(id);
        router.push('/admin/planillas');
      } catch (error) {
        console.error('Error al eliminar la plantilla:', error);
        alert('Error al eliminar la plantilla.');
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
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center mb-4">
            <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
              <Home size={16} className="mr-1" /> Panel
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link href="/admin/planillas" className="flex items-center mr-4 text-primary hover:underline">
              Planillas
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Editar</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <button
              onClick={handleEliminar}
              className="flex items-center px-4 py-2 text-white transition-colors bg-red-500 rounded-md hover:bg-red-600"
            >
              <Trash size={18} className="mr-2" /> Eliminar
            </button>
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Editar Plantilla
        </h2>

        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información de la Plantilla</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Grupo</label>
                <select
                  value={plantilla.grupo}
                  onChange={(e) => setPlantilla({ ...plantilla, grupo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {GRUPOS.map((grupo) => (
                    <option key={grupo} value={grupo}>{grupo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Título</label>
                <input
                  type="text"
                  value={plantilla.titulo}
                  onChange={(e) => setPlantilla({ ...plantilla, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Ej: General"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">Tipo de plantilla</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {TIPOS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setPlantilla({ ...plantilla, tipo: t.value })}
                    className={`p-3 text-left border rounded-md transition-colors ${
                      plantilla.tipo === t.value
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{t.descripcion}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {plantilla.tipo === 'lista' ? (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">Ítems</h3>
              <div className="space-y-3">
                {plantilla.items.map((item, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-md">
                    <input
                      type="text"
                      value={item.subtitulo || ''}
                      onChange={(e) => handleItemChange(index, 'subtitulo', e.target.value)}
                      className="w-full px-3 py-1.5 mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase border border-dashed border-gray-300 rounded-md"
                      placeholder="Subtítulo de sección antes de este ítem (opcional)"
                    />
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-sm text-gray-400 shrink-0">{index + 1}.</span>
                      <input
                        type="text"
                        value={item.descripcion}
                        onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Descripción del ítem"
                      />
                      <button
                        type="button"
                        onClick={() => moverItem(index, -1)}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Subir"
                      >
                        <ArrowUp size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moverItem(index, 1)}
                        disabled={index === plantilla.items.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Bajar"
                      >
                        <ArrowDown size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => quitarItem(index)}
                        disabled={plantilla.items.length === 1}
                        className="text-red-500 hover:text-red-700 disabled:opacity-30"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <textarea
                      value={item.guia || ''}
                      onChange={(e) => handleItemChange(index, 'guia', e.target.value)}
                      className="w-full px-3 py-2 mt-2 text-sm border border-gray-200 rounded-md ml-8"
                      style={{ width: 'calc(100% - 2rem)' }}
                      placeholder="Guía para el técnico (opcional): qué revisar en este ítem"
                      rows={2}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={agregarItem}
                className="flex items-center mt-4 text-blue-500 hover:text-blue-700"
              >
                <PlusCircle size={18} className="mr-1" /> Agregar ítem
              </button>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">Unidad y Columnas</h3>
              <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Nombre de la unidad</label>
                  <input
                    type="text"
                    value={plantilla.nombreUnidad}
                    onChange={(e) => setPlantilla({ ...plantilla, nombreUnidad: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ej: Hidrante"
                  />
                  <p className="mt-1 text-xs text-gray-400">Se va a mostrar como &quot;{plantilla.nombreUnidad || 'Unidad'} 1&quot;, &quot;{plantilla.nombreUnidad || 'Unidad'} 2&quot;, etc.</p>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={plantilla.incluyeNA}
                      onChange={(e) => setPlantilla({ ...plantilla, incluyeNA: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Incluir opción N/A además de OK / N OK
                  </label>
                </div>
              </div>

              <label className="block mb-1 text-sm font-medium text-gray-700">Campos de texto adicionales (opcional)</label>
              <p className="mb-2 text-xs text-gray-400">
                Además del Número, cada {plantilla.nombreUnidad || 'unidad'} siempre puede tener campos de texto libre (ej: Sector, Ubicación, Tipo de dispositivo).
              </p>
              <div className="mb-4 space-y-2">
                {plantilla.camposTexto.map((campo, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={campo.nombre}
                      onChange={(e) => handleCampoTextoChange(index, e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Ej: Sector, Ubicación, Tipo dispositivo..."
                    />
                    <button
                      type="button"
                      onClick={() => moverCampoTexto(index, -1)}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Subir"
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moverCampoTexto(index, 1)}
                      disabled={index === plantilla.camposTexto.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Bajar"
                    >
                      <ArrowDown size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => quitarCampoTexto(index)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={agregarCampoTexto}
                className="flex items-center mb-6 text-blue-500 hover:text-blue-700"
              >
                <PlusCircle size={18} className="mr-1" /> Agregar campo de texto
              </button>

              <label className="block mb-1 text-sm font-medium text-gray-700">Columnas a chequear por unidad</label>
              <div className="space-y-2">
                {plantilla.columnas.map((col, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 text-sm text-gray-400 shrink-0">{index + 1}.</span>
                    <input
                      type="text"
                      value={col.nombre}
                      onChange={(e) => handleColumnaChange(index, e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Ej: Accesible, Manguera, Presión..."
                    />
                    <button
                      type="button"
                      onClick={() => moverColumna(index, -1)}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Subir"
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moverColumna(index, 1)}
                      disabled={index === plantilla.columnas.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Bajar"
                    >
                      <ArrowDown size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => quitarColumna(index)}
                      disabled={plantilla.columnas.length === 1}
                      className="text-red-500 hover:text-red-700 disabled:opacity-30"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={agregarColumna}
                className="flex items-center mt-4 text-blue-500 hover:text-blue-700"
              >
                <PlusCircle size={18} className="mr-1" /> Agregar columna
              </button>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => router.push('/admin/planillas')}
              className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
