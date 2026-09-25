// app/components/admin/PerfilPersonal.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { permisosVacios } from '../../lib/permisos';
import GrillaPermisos from './GrillaPermisos';

// Perfil de permisos de una persona del personal. Asignar un perfil la pasa
// a rol Personal (si no lo era) y le copia sus permisos.
export default function PerfilPersonal({ usuario, perfiles, onAsignar }) {
  const [perfilId, setPerfilId] = useState(usuario.perfilId || '');
  const [guardando, setGuardando] = useState(false);

  const elegido = perfiles.find((p) => p.id === perfilId);
  const esPersonal = usuario.role === 'Personal';
  const sinCambios = esPersonal && perfilId === usuario.perfilId;

  const asignar = async () => {
    if (!elegido) return;
    if (!esPersonal && !confirm(`${usuario.email} pasa a ser Personal con el perfil "${elegido.nombre}". ¿Continuar?`)) return;
    setGuardando(true);
    try {
      await onAsignar(elegido);
    } catch (error) {
      console.error('Error al asignar el perfil:', error);
      alert('No se pudo asignar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-4 mb-6 bg-white rounded-lg shadow-md sm:p-6">
      <h3 className="flex items-center gap-2 mb-1 text-lg font-semibold text-gray-700">
        <ShieldCheck size={18} className="text-primary" /> Perfil de permisos
      </h3>
      <p className="mb-4 text-sm text-gray-500">
        {esPersonal
          ? 'Qué puede hacer esta persona en el panel.'
          : 'Elegí un perfil para que esta persona pase a ser Personal.'}{' '}
        Los perfiles se crean y editan en <Link href="/admin/usuarios/perfiles" className="text-primary hover:underline">Perfiles del personal</Link>.
      </p>

      {perfiles.length === 0 ? (
        <p className="text-sm text-gray-500">
          Todavía no hay perfiles. <Link href="/admin/usuarios/perfiles" className="text-primary hover:underline">Crear uno</Link>.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <select
              value={perfilId}
              onChange={(e) => setPerfilId(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md min-w-[14rem]"
            >
              <option value="">Elegí un perfil...</option>
              {perfiles.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <button
              type="button"
              onClick={asignar}
              disabled={!elegido || sinCambios || guardando}
              className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-light disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : esPersonal ? 'Cambiar perfil' : 'Asignar perfil'}
            </button>
          </div>
          {elegido && (
            <GrillaPermisos permisos={{ ...permisosVacios(), ...elegido.permisos }} soloLectura onChange={() => {}} />
          )}
        </>
      )}
    </div>
  );
}
