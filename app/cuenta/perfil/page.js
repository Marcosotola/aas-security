// app/cuenta/perfil/page.js
'use client';

import { useState } from 'react';
import { Edit } from 'lucide-react';
import { useCliente } from '../../lib/useClienteAuth';
import { actualizarUsuario } from '../../lib/firestore';

export default function PerfilPage() {
  const { user, perfil, setPerfil } = useCliente();
  const [editando, setEditando] = useState(false);
  const [datos, setDatos] = useState(perfil);
  const [guardando, setGuardando] = useState(false);

  const handleEditar = () => {
    setDatos(perfil);
    setEditando(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await actualizarUsuario(user.uid, {
        nombre: datos.nombre,
        apellido: datos.apellido,
        empresa: datos.empresa,
        dniCuit: datos.dniCuit,
        direccion: datos.direccion,
        telefono: datos.telefono
      });
      setPerfil({ ...perfil, ...datos });
      setEditando(false);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('No se pudieron guardar los cambios. Inténtalo de nuevo más tarde.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto space-y-6">
      <h2 className="text-2xl font-bold font-montserrat text-primary">Mi Perfil</h2>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Mis Datos</h3>
          {!editando && (
            <button onClick={handleEditar} className="flex items-center px-2 py-1.5 -m-1.5 text-sm rounded-md text-primary hover:bg-primary/5">
              <Edit size={14} className="mr-1" /> Editar
            </button>
          )}
        </div>

        {editando ? (
          <form onSubmit={handleGuardar} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={datos.nombre || ''}
                  onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Apellido</label>
                <input
                  type="text"
                  value={datos.apellido || ''}
                  onChange={(e) => setDatos({ ...datos, apellido: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Razón Social / Empresa</label>
              <input
                type="text"
                value={datos.empresa || ''}
                onChange={(e) => setDatos({ ...datos, empresa: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">DNI / CUIT</label>
                <input
                  type="text"
                  value={datos.dniCuit || ''}
                  onChange={(e) => setDatos({ ...datos, dniCuit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="text"
                  value={datos.telefono || ''}
                  onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Dirección principal</label>
              <input
                type="text"
                value={datos.direccion || ''}
                onChange={(e) => setDatos({ ...datos, direccion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setEditando(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100">
                Cancelar
              </button>
              <button type="submit" disabled={guardando} className="px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-light disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div><span className="font-medium text-gray-700">Nombre: </span>{perfil.nombre} {perfil.apellido}</div>
            <div><span className="font-medium text-gray-700">Empresa: </span>{perfil.empresa || '-'}</div>
            <div><span className="font-medium text-gray-700">DNI/CUIT: </span>{perfil.dniCuit}</div>
            <div><span className="font-medium text-gray-700">Teléfono: </span>{perfil.telefono}</div>
            <div className="sm:col-span-2"><span className="font-medium text-gray-700">Dirección: </span>{perfil.direccion}</div>
          </div>
        )}
      </div>
    </div>
  );
}
