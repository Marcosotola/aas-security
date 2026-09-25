// app/admin/usuarios/perfiles/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, PlusCircle, ShieldCheck, Trash, Users } from 'lucide-react';
import { obtenerPerfiles, crearPerfil, actualizarPerfil, eliminarPerfil, obtenerUsuarios } from '../../../lib/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';
import { MODULOS, NIVELES, permisosVacios } from '../../../lib/permisos';
import GrillaPermisos from '../../../components/admin/GrillaPermisos';

// Resumen corto de un perfil para la lista (ej. "OT: Propios · Facturas: Todos").
const resumen = (permisos) => {
  const partes = Object.entries(MODULOS)
    .filter(([m]) => (permisos[m] || 'ninguno') !== 'ninguno')
    .map(([m, { label }]) => `${label}: ${NIVELES[permisos[m]]}`);
  return partes.length ? partes.join(' · ') : 'Sin accesos';
};

// Perfiles de permisos del personal: cada persona con rol Personal tiene
// uno, y lo que puede hacer en el panel sale de acá (ver app/lib/permisos.js).
export default function PerfilesPage() {
  const { loading: loadingAuth } = useStaffAuth('admin');
  const [perfiles, setPerfiles] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null); // { id?, nombre, permisos }
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    const [p, usuarios] = await Promise.all([obtenerPerfiles(), obtenerUsuarios()]);
    setPerfiles(p);
    setPersonas(usuarios.filter((u) => u.role === 'Personal'));
  };

  useEffect(() => {
    if (loadingAuth) return;
    cargar().catch(() => {}).finally(() => setCargando(false));
  }, [loadingAuth]);

  const personasDe = (perfilId) => personas.filter((u) => u.perfilId === perfilId);

  const handleGuardar = async () => {
    const nombre = editando.nombre.trim();
    if (!nombre) {
      alert('Poné un nombre al perfil.');
      return;
    }
    if (perfiles.some((p) => p.id !== editando.id && p.nombre.trim().toLowerCase() === nombre.toLowerCase())) {
      alert(`Ya hay un perfil llamado "${nombre}".`);
      return;
    }
    const afectadas = editando.id ? personasDe(editando.id).length : 0;
    if (afectadas > 0 && !confirm(`Este perfil lo tienen ${afectadas} ${afectadas === 1 ? 'persona' : 'personas'}: sus permisos se actualizan al guardar. ¿Continuar?`)) return;

    setGuardando(true);
    try {
      const datos = { nombre, permisos: editando.permisos };
      if (editando.id) await actualizarPerfil(editando.id, datos);
      else await crearPerfil(datos);
      await cargar();
      setEditando(null);
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      alert('No se pudo guardar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (perfil) => {
    const cantidad = personasDe(perfil.id).length;
    if (cantidad > 0) {
      alert(`"${perfil.nombre}" lo tienen ${cantidad} ${cantidad === 1 ? 'persona' : 'personas'}. Asignales otro perfil antes de eliminarlo.`);
      return;
    }
    if (!confirm(`¿Eliminar el perfil "${perfil.nombre}"?`)) return;
    try {
      await eliminarPerfil(perfil.id);
      setPerfiles((actuales) => actuales.filter((p) => p.id !== perfil.id));
      if (editando?.id === perfil.id) setEditando(null);
    } catch (error) {
      alert('No se pudo eliminar el perfil.');
    }
  };

  if (loadingAuth || cargando) {
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
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-wrap items-center mb-8">
        <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
          <Home size={16} className="mr-1" /> Panel
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <Link href="/admin/usuarios" className="mr-2 text-primary hover:underline">Usuarios</Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-700">Perfiles</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h2 className="text-2xl font-bold font-montserrat text-primary">Perfiles del personal</h2>
        {!editando && (
          <button
            type="button"
            onClick={() => setEditando({ nombre: '', permisos: permisosVacios() })}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-light"
          >
            <PlusCircle size={18} /> Nuevo perfil
          </button>
        )}
      </div>
      <p className="mb-6 text-sm text-gray-500">
        Qué puede hacer cada persona del personal en el panel. Se asigna un perfil a cada una desde su ficha; si cambiás un perfil, cambia para todas las que lo tienen.
      </p>

      {editando && (
        <div className="p-4 mb-6 bg-white rounded-lg shadow-md sm:p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">{editando.id ? 'Editar perfil' : 'Nuevo perfil'}</h3>
          <label className="block mb-1 text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            value={editando.nombre}
            onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
            placeholder="Ej: Técnico, Técnico + administración"
            autoFocus
            className="w-full max-w-md px-3 py-2 mb-4 border border-gray-300 rounded-md"
          />
          <GrillaPermisos permisos={editando.permisos} onChange={(permisos) => setEditando({ ...editando, permisos })} />
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => setEditando(null)}
              disabled={guardando}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando}
              className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-light disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar perfil'}
            </button>
          </div>
        </div>
      )}

      {perfiles.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-lg shadow-md">
          <ShieldCheck size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">Todavía no hay perfiles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {perfiles.map((perfil) => {
            const asignadas = personasDe(perfil.id);
            return (
              <div key={perfil.id} className="flex flex-col p-4 bg-white rounded-lg shadow-md">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="flex items-center gap-2 font-semibold text-gray-800">
                    <ShieldCheck size={18} className="text-primary" /> {perfil.nombre}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleEliminar(perfil)}
                    title="Eliminar perfil"
                    className="p-1.5 text-red-500 rounded-full hover:bg-red-50"
                  >
                    <Trash size={16} />
                  </button>
                </div>
                <p className="flex-1 mb-3 text-sm text-gray-500">{resumen(perfil.permisos || {})}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Users size={14} />
                    {asignadas.length === 0 ? 'Sin personas' : asignadas.map((u) => (u.nombre ? `${u.nombre} ${u.apellido || ''}`.trim() : u.email)).join(', ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditando({ id: perfil.id, nombre: perfil.nombre, permisos: { ...permisosVacios(), ...perfil.permisos } })}
                    className="text-sm text-primary hover:underline"
                  >
                    Editar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
