// app/cuenta/sedes/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, PlusCircle, Trash2, MoreVertical, Edit } from 'lucide-react';
import { useCliente } from '../../lib/useClienteAuth';
import { actualizarUsuario } from '../../lib/firestore';
import ViewToggle from '../../components/admin/ViewToggle';
import PortalDropdown from '../../components/PortalDropdown';

const SEDE_VACIA = { nombre: '', direccion: '' };

function FormEdicionSede({ datos, onChange, onGuardar, onCancelar, guardando }) {
  return (
    <form onSubmit={onGuardar} className="space-y-2">
      <input
        type="text"
        value={datos.nombre}
        onChange={(e) => onChange({ ...datos, nombre: e.target.value })}
        placeholder="Nombre de la sede"
        autoFocus
        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
      />
      <input
        type="text"
        value={datos.direccion}
        onChange={(e) => onChange({ ...datos, direccion: e.target.value })}
        placeholder="Dirección"
        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancelar} className="px-3 py-1.5 text-xs text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100">
          Cancelar
        </button>
        <button type="submit" disabled={guardando} className="px-3 py-1.5 text-xs text-white rounded-md bg-primary hover:bg-primary-light disabled:opacity-50">
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

export default function SedesPage() {
  const { user, perfil, setPerfil } = useCliente();
  const [vista, setVista] = useState('cards');

  const [nuevaSede, setNuevaSede] = useState(SEDE_VACIA);
  const [guardando, setGuardando] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
  const [datosEdicion, setDatosEdicion] = useState(SEDE_VACIA);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  // Un solo menú "..." compartido por toda la lista (en vez de uno por fila):
  // se reposiciona con el ancla del botón que se tocó. PortalDropdown ya
  // resuelve el click-afuera-para-cerrar y el recorte por overflow-x-auto de
  // la tabla (ver app/components/PortalDropdown.jsx).
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const sedes = perfil.sedes || [];
  const sedeMenuAbierta = sedes.find((s) => s.id === menuAbiertoId) || null;

  const abrirMenu = (sedeId, e) => {
    setMenuAnchorEl(e.currentTarget);
    setMenuAbiertoId((actual) => (actual === sedeId ? null : sedeId));
  };

  const iniciarEdicion = (sede) => {
    setDatosEdicion({ nombre: sede.nombre, direccion: sede.direccion });
    setEditandoId(sede.id);
  };

  const cancelarEdicion = () => setEditandoId(null);

  const handleGuardarEdicion = async (e, id) => {
    e.preventDefault();
    if (!datosEdicion.nombre.trim() || !datosEdicion.direccion.trim()) return;

    setGuardandoEdicion(true);
    try {
      const nuevasSedes = sedes.map((s) => (s.id === id ? { ...s, ...datosEdicion } : s));
      await actualizarUsuario(user.uid, { sedes: nuevasSedes });
      setPerfil({ ...perfil, sedes: nuevasSedes });
      setEditandoId(null);
    } catch (error) {
      console.error('Error al editar la sede:', error);
      alert('No se pudo guardar la sede. Inténtalo de nuevo más tarde.');
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!nuevaSede.nombre.trim() || !nuevaSede.direccion.trim()) return;

    setGuardando(true);
    try {
      const nuevasSedes = [...sedes, { id: Date.now().toString(), ...nuevaSede }];
      await actualizarUsuario(user.uid, { sedes: nuevasSedes });
      setPerfil({ ...perfil, sedes: nuevasSedes });
      setNuevaSede(SEDE_VACIA);
    } catch (error) {
      console.error('Error al agregar la sede:', error);
      alert('No se pudo agregar la sede. Inténtalo de nuevo más tarde.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta sede?')) return;
    try {
      const nuevasSedes = sedes.filter((s) => s.id !== id);
      await actualizarUsuario(user.uid, { sedes: nuevasSedes });
      setPerfil({ ...perfil, sedes: nuevasSedes });
    } catch (error) {
      console.error('Error al eliminar la sede:', error);
      alert('No se pudo eliminar la sede. Inténtalo de nuevo más tarde.');
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-montserrat text-primary">Mis Sedes</h2>
        <p className="text-sm text-gray-500">
          Si tenés más de una ubicación (por ejemplo varios edificios de un consorcio), agregalas acá. Vamos a poder
          seleccionarlas al hacerte un presupuesto, remito o recibo. Tocá una sede para ver sus documentos.
        </p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        {sedes.length === 0 ? (
          <p className="mb-4 text-sm text-gray-400">Todavía no cargaste ninguna sede.</p>
        ) : (
          <>
            <div className="flex justify-end mb-3">
              <ViewToggle vista={vista} onChange={setVista} />
            </div>

            {vista === 'cards' ? (
              <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 lg:grid-cols-3">
                {sedes.map((sede) => (
                  <div key={sede.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    {editandoId === sede.id ? (
                      <FormEdicionSede
                        datos={datosEdicion}
                        onChange={setDatosEdicion}
                        onGuardar={(e) => handleGuardarEdicion(e, sede.id)}
                        onCancelar={cancelarEdicion}
                        guardando={guardandoEdicion}
                      />
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/cuenta/documentos?sede=${encodeURIComponent(sede.nombre)}`}
                          title={`Ver documentos de ${sede.nombre}`}
                          className="flex items-start flex-1 min-w-0 group"
                        >
                          <MapPin size={16} className="mt-0.5 mr-2 text-primary shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate group-hover:text-primary group-hover:underline">{sede.nombre}</div>
                            <div className="text-xs text-gray-500 truncate">{sede.direccion}</div>
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => abrirMenu(sede.id, e)}
                          title="Más opciones"
                          className="p-2.5 -m-1 text-gray-500 transition-colors rounded-full hover:text-gray-700 hover:bg-gray-100 shrink-0"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-4 overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Dirección</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sedes.map((sede) => (
                      <tr key={sede.id}>
                        {editandoId === sede.id ? (
                          <td colSpan={3} className="px-4 py-3">
                            <FormEdicionSede
                              datos={datosEdicion}
                              onChange={setDatosEdicion}
                              onGuardar={(e) => handleGuardarEdicion(e, sede.id)}
                              onCancelar={cancelarEdicion}
                              guardando={guardandoEdicion}
                            />
                          </td>
                        ) : (
                          <>
                            <td className="px-4 py-2 text-sm whitespace-nowrap">
                              <Link
                                href={`/cuenta/documentos?sede=${encodeURIComponent(sede.nombre)}`}
                                className="flex items-center gap-1.5 font-medium text-gray-800 hover:text-primary hover:underline"
                              >
                                <MapPin size={14} className="text-primary shrink-0" /> {sede.nombre}
                              </Link>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">{sede.direccion}</td>
                            <td className="px-4 py-2 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={(e) => abrirMenu(sede.id, e)}
                                title="Más opciones"
                                className="p-2.5 -m-1 text-gray-500 transition-colors rounded-full hover:text-gray-700 hover:bg-gray-100"
                              >
                                <MoreVertical size={18} />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <form onSubmit={handleAgregar} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr_auto]">
          <input
            type="text"
            value={nuevaSede.nombre}
            onChange={(e) => setNuevaSede({ ...nuevaSede, nombre: e.target.value })}
            placeholder="Nombre de la sede (ej: Edificio Torre Norte)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            value={nuevaSede.direccion}
            onChange={(e) => setNuevaSede({ ...nuevaSede, direccion: e.target.value })}
            placeholder="Dirección de la sede"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            disabled={guardando}
            className="flex items-center justify-center px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-light disabled:opacity-50"
          >
            <PlusCircle size={16} className="mr-1" /> Agregar
          </button>
        </form>
      </div>

      <PortalDropdown
        open={!!sedeMenuAbierta}
        anchorRef={{ current: menuAnchorEl }}
        onClose={() => setMenuAbiertoId(null)}
        align="right"
        width={140}
      >
        {sedeMenuAbierta && (
          <>
            <button
              type="button"
              onClick={() => { setMenuAbiertoId(null); iniciarEdicion(sedeMenuAbierta); }}
              className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
            >
              <Edit size={14} /> Editar
            </button>
            <button
              type="button"
              onClick={() => { setMenuAbiertoId(null); handleEliminar(sedeMenuAbierta.id); }}
              className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} /> Eliminar
            </button>
          </>
        )}
      </PortalDropdown>
    </div>
  );
}
