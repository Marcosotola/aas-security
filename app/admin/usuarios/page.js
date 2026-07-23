// app/admin/usuarios/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Home, LogOut, Search, ChevronDown, Users as UsersIcon, MapPin } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { obtenerUsuarios, actualizarUsuario } from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';
import PortalDropdown from '../../components/PortalDropdown';

const ROLES = ['Cliente', 'Tecnico', 'Admin'];

export default function GestionUsuarios() {
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [rolMenuAbierto, setRolMenuAbierto] = useState(null);
  const [actualizandoRol, setActualizandoRol] = useState(null);
  const [sedesAbiertas, setSedesAbiertas] = useState(null);
  const rolBtnRefs = useRef({});
  const sedesBtnRefs = useRef({});

  useEffect(() => {
    if (loadingAuth) return;
    cargarUsuarios();
  }, [loadingAuth]);

  const cargarUsuarios = async () => {
    try {
      const data = await obtenerUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setUsuarios([]);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/admin';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleCambiarRol = async (uid, nuevoRol) => {
    const actual = usuarios.find(u => u.id === uid);
    if (!actual || actual.role === nuevoRol) {
      setRolMenuAbierto(null);
      return;
    }

    setActualizandoRol(uid);
    try {
      await actualizarUsuario(uid, { role: nuevoRol });
      setUsuarios(usuarios.map(u => u.id === uid ? { ...u, role: nuevoRol } : u));
    } catch (error) {
      console.error('Error al cambiar el rol:', error);
      alert('Error al cambiar el rol del usuario.');
    } finally {
      setActualizandoRol(null);
      setRolMenuAbierto(null);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    if (!filtro) return true;
    const termino = filtro.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(termino) ||
      u.apellido?.toLowerCase().includes(termino) ||
      u.email?.toLowerCase().includes(termino) ||
      u.empresa?.toLowerCase().includes(termino)
    );
  });

  if (loadingAuth || loadingUsuarios) {
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
      <header className="text-white shadow bg-primary">
        <div className="container flex items-center justify-between px-4 py-20 mx-auto">
          <div className="flex items-center">
            <div className="relative mr-2">
              <div className="absolute inset-0 transform rotate-45 rounded-full bg-white/30"></div>
              <div className="absolute inset-0 transform scale-75 -rotate-45 rounded-full bg-white/20"></div>
            </div>
            <h1 className="text-xl font-bold font-montserrat">Panel de Administración</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user?.email}</span>
            <button onClick={handleLogout} className="flex items-center p-2 text-white rounded-md hover:bg-primary-light">
              <LogOut size={18} className="mr-2" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
            <Home size={16} className="mr-1" /> Panel
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">Usuarios</span>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Usuarios
        </h2>

        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <div className="relative flex items-center mb-6">
            <Search size={18} className="absolute text-gray-400 left-3" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o empresa..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Empresa</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Sedes</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Rol</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {u.nombre ? `${u.nombre} ${u.apellido || ''}` : <span className="text-gray-400">Sin completar</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{u.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{u.empresa || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {(u.sedes || []).length > 0 ? (
                          <button
                            type="button"
                            ref={(el) => { sedesBtnRefs.current[u.id] = el; }}
                            onClick={() => setSedesAbiertas(sedesAbiertas === u.id ? null : u.id)}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <MapPin size={14} /> {u.sedes.length}
                          </button>
                        ) : '-'}
                        <PortalDropdown
                          open={sedesAbiertas === u.id}
                          anchorRef={{ current: sedesBtnRefs.current[u.id] }}
                          onClose={() => setSedesAbiertas(null)}
                          width={224}
                        >
                          {(u.sedes || []).map((s) => (
                            <div key={s.id} className="px-3 py-2 text-xs text-left border-b border-gray-100 last:border-0">
                              <div className="font-medium text-gray-800">{s.nombre}</div>
                              <div className="text-gray-500">{s.direccion}</div>
                            </div>
                          ))}
                        </PortalDropdown>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <button
                          type="button"
                          ref={(el) => { rolBtnRefs.current[u.id] = el; }}
                          onClick={() => setRolMenuAbierto(rolMenuAbierto === u.id ? null : u.id)}
                          disabled={actualizandoRol === u.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full transition-opacity hover:opacity-80 disabled:opacity-50
                            ${u.role === 'Admin' ? 'bg-blue-100 text-blue-800' :
                              u.role === 'Tecnico' ? 'bg-purple-100 text-purple-800' :
                                'bg-green-100 text-green-800'}`}
                        >
                          {u.role || 'Cliente'}
                          <ChevronDown size={12} />
                        </button>

                        <PortalDropdown
                          open={rolMenuAbierto === u.id}
                          anchorRef={{ current: rolBtnRefs.current[u.id] }}
                          onClose={() => setRolMenuAbierto(null)}
                          width={144}
                        >
                          {ROLES.map((rol) => (
                            <button
                              key={rol}
                              type="button"
                              onClick={() => handleCambiarRol(u.id, rol)}
                              className={`block w-full px-3 py-2 text-xs text-left hover:bg-gray-50 ${(u.role || 'Cliente') === rol ? 'font-semibold text-primary' : 'text-gray-700'}`}
                            >
                              {rol}
                            </button>
                          ))}
                        </PortalDropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                      No hay usuarios que coincidan con tu búsqueda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {usuarios.length === 0 && (
            <div className="py-10 text-center">
              <UsersIcon size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Todavía no hay usuarios registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
