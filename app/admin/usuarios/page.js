// app/admin/usuarios/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Search, ChevronDown, Users as UsersIcon, MapPin, UserPlus, Edit, Trash, Eye, X, Phone, Building2, IdCard, KeyRound, ShieldCheck } from 'lucide-react';
import { obtenerUsuarios, actualizarUsuario, obtenerEmpresas, obtenerPerfiles } from '../../lib/firestore';
import { auth } from '../../lib/firebase';
import { useStaffAuth } from '../../lib/useStaffAuth';
import PortalDropdown from '../../components/PortalDropdown';
import ViewToggle from '../../components/admin/ViewToggle';
import { accionIconoClase, ACCION_ICONO_TAMANO } from '../../components/admin/accionIcono';

// "Personal" necesita un perfil de permisos: al elegirlo se va a la ficha para
// asignarlo (ver handleCambiarRol).
const ROLES = ['Cliente', 'Personal', 'Admin'];

export default function GestionUsuarios() {
  const router = useRouter();
  const { user, loading: loadingAuth } = useStaffAuth('admin');
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [rolMenuAbierto, setRolMenuAbierto] = useState(null);
  const [actualizandoRol, setActualizandoRol] = useState(null);
  const [empresasPorId, setEmpresasPorId] = useState(new Map());
  const [perfilesPorId, setPerfilesPorId] = useState(new Map());
  const [vista, setVista] = useState('tabla');
  const [eliminandoUsuario, setEliminandoUsuario] = useState(null);
  const [usuarioViendo, setUsuarioViendo] = useState(null);
  const rolBtnRefs = useRef({});

  useEffect(() => {
    if (loadingAuth) return;
    cargarUsuarios();
  }, [loadingAuth]);

  const cargarUsuarios = async () => {
    try {
      const [data, empresas, perfiles] = await Promise.all([
        obtenerUsuarios(),
        obtenerEmpresas().catch(() => []),
        obtenerPerfiles().catch(() => [])
      ]);
      setUsuarios(data);
      setEmpresasPorId(new Map(empresas.map((e) => [e.id, e])));
      setPerfilesPorId(new Map(perfiles.map((p) => [p.id, p])));
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setUsuarios([]);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleCambiarRol = async (uid, nuevoRol) => {
    const actual = usuarios.find(u => u.id === uid);
    if (!actual || actual.role === nuevoRol) {
      setRolMenuAbierto(null);
      return;
    }
    // Personal sin perfil no puede hacer nada: se elige el perfil en la ficha.
    if (nuevoRol === 'Personal') {
      setRolMenuAbierto(null);
      router.push(`/admin/usuarios/${uid}?perfil=1`);
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

  const handleEliminarUsuario = async (u) => {
    const nombre = u.nombre ? `${u.nombre} ${u.apellido || ''}`.trim() : u.email;
    if (!confirm(`¿Eliminar a "${nombre}"? Esto borra su perfil y su cuenta de acceso por completo. La acción no se puede deshacer.`)) {
      return;
    }

    setEliminandoUsuario(u.id);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/admin/usuarios/${u.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error desconocido');
      }
      setUsuarios(usuarios.filter(usuario => usuario.id !== u.id));
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      alert(error.message || 'Error al eliminar el usuario.');
    } finally {
      setEliminandoUsuario(null);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    if (!filtro) return true;
    const termino = filtro.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(termino) ||
      u.apellido?.toLowerCase().includes(termino) ||
      u.email?.toLowerCase().includes(termino) ||
      u.empresa?.toLowerCase().includes(termino) ||
      empresasDeAccesos(u).some((e) => e.nombre.toLowerCase().includes(termino))
    );
  });

  // Empresas a las que accede un Cliente, con cuántas sedes (o "todas").
  function empresasDeAccesos(u) {
    return Object.entries(u.accesos || {}).map(([empresaId, porSede]) => {
      const sedes = Object.keys(porSede);
      return {
        id: empresaId,
        nombre: empresasPorId.get(empresaId)?.nombre || 'Empresa eliminada',
        detalle: sedes.includes('*') ? 'todas las sedes' : `${sedes.length} ${sedes.length === 1 ? 'sede' : 'sedes'}`
      };
    });
  }

  const textoAccesos = (u) => {
    if (u.role === 'Admin') return 'Acceso total';
    if (u.role === 'Personal') return `Perfil: ${perfilesPorId.get(u.perfilId)?.nombre || 'sin asignar'}`;
    if (u.role === 'Tecnico') return 'Técnico (sin perfil)';
    const empresas = empresasDeAccesos(u);
    return empresas.length > 0 ? empresas.map((e) => e.nombre).join(', ') : 'Sin accesos';
  };

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
    <div>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
            <Home size={16} className="mr-1" /> Panel
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">Usuarios</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold font-montserrat text-primary">
            Usuarios
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/usuarios/perfiles"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
            >
              <ShieldCheck size={18} />
              Perfiles del personal
            </Link>
            <Link
              href="/registro?origen=admin"
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
            >
              <UserPlus size={18} />
              Agregar usuario
            </Link>
          </div>
        </div>

        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex items-center flex-1">
              <Search size={18} className="absolute text-gray-400 left-3" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o empresa..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <ViewToggle vista={vista} onChange={setVista} />
          </div>

          {vista === 'cards' ? (
            usuariosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {usuariosFiltrados.map((u) => (
                  <div key={u.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="text-sm font-medium text-gray-900">
                      {u.nombre ? `${u.nombre} ${u.apellido || ''}` : <span className="text-gray-400">Sin completar</span>}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">{u.email}</div>
                    <div className="mt-1 text-sm text-gray-500">{u.empresa || '-'}</div>

                    <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-gray-100">
                      <span className="flex items-center min-w-0 gap-1 text-sm text-gray-500">
                        <KeyRound size={14} className="shrink-0" />
                        <span className="truncate">{textoAccesos(u)}</span>
                      </span>

                      <div>
                        <button
                          type="button"
                          ref={(el) => { rolBtnRefs.current[u.id] = el; }}
                          onClick={() => setRolMenuAbierto(rolMenuAbierto === u.id ? null : u.id)}
                          disabled={actualizandoRol === u.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full transition-opacity hover:opacity-80 disabled:opacity-50
                            ${u.role === 'Admin' ? 'bg-blue-100 text-blue-800' :
                              ['Personal', 'Tecnico'].includes(u.role) ? 'bg-purple-100 text-purple-800' :
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
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-gray-100">
                      <Link
                        href={`/admin/usuarios/${u.id}`}
                        title="Accesos"
                        className={accionIconoClase('primary')}
                      >
                        <KeyRound size={ACCION_ICONO_TAMANO} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setUsuarioViendo(u)}
                        title="Ver datos"
                        className={accionIconoClase('gray')}
                      >
                        <Eye size={ACCION_ICONO_TAMANO} />
                      </button>
                      <Link
                        href={`/admin/usuarios/completar?uid=${u.id}`}
                        title="Editar datos"
                        className={accionIconoClase('secondary')}
                      >
                        <Edit size={ACCION_ICONO_TAMANO} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleEliminarUsuario(u)}
                        disabled={eliminandoUsuario === u.id}
                        title="Eliminar"
                        className={accionIconoClase('red')}
                      >
                        <Trash size={ACCION_ICONO_TAMANO} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">
                No hay usuarios que coincidan con tu búsqueda
              </div>
            )
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Empresa</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Accesos</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Rol</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Acciones</th>
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
                      <td className="max-w-xs px-4 py-3 text-sm text-gray-500 truncate" title={textoAccesos(u)}>
                        {textoAccesos(u)}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <button
                          type="button"
                          ref={(el) => { rolBtnRefs.current[u.id] = el; }}
                          onClick={() => setRolMenuAbierto(rolMenuAbierto === u.id ? null : u.id)}
                          disabled={actualizandoRol === u.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full transition-opacity hover:opacity-80 disabled:opacity-50
                            ${u.role === 'Admin' ? 'bg-blue-100 text-blue-800' :
                              ['Personal', 'Tecnico'].includes(u.role) ? 'bg-purple-100 text-purple-800' :
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
                      <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/usuarios/${u.id}`}
                            title="Accesos"
                            className={accionIconoClase('primary')}
                          >
                            <KeyRound size={ACCION_ICONO_TAMANO} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setUsuarioViendo(u)}
                            title="Ver datos"
                            className={accionIconoClase('gray')}
                          >
                            <Eye size={ACCION_ICONO_TAMANO} />
                          </button>
                          <Link
                            href={`/admin/usuarios/completar?uid=${u.id}`}
                            title="Editar datos"
                            className={accionIconoClase('secondary')}
                          >
                            <Edit size={ACCION_ICONO_TAMANO} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleEliminarUsuario(u)}
                            disabled={eliminandoUsuario === u.id}
                            title="Eliminar"
                            className={accionIconoClase('red')}
                          >
                            <Trash size={ACCION_ICONO_TAMANO} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                      No hay usuarios que coincidan con tu búsqueda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}

          {usuarios.length === 0 && (
            <div className="py-10 text-center">
              <UsersIcon size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Todavía no hay usuarios registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal con el detalle completo del usuario, incluidos sus accesos */}
      {usuarioViendo && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/50 sm:items-center sm:p-4"
          onClick={() => setUsuarioViendo(null)}
        >
          <div
            className="w-full max-w-lg p-6 bg-white shadow-xl rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold font-montserrat text-primary">
                  {usuarioViendo.nombre
                    ? `${usuarioViendo.nombre} ${usuarioViendo.apellido || ''}`
                    : 'Sin completar'}
                </h3>
                <p className="text-sm text-gray-500">{usuarioViendo.email}</p>
              </div>
              <button
                onClick={() => setUsuarioViendo(null)}
                className="p-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">Rol</p>
                <p className="text-gray-800">{usuarioViendo.role || 'Cliente'}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">Empresa</p>
                <p className="flex items-center gap-1 text-gray-800">
                  <Building2 size={14} className="text-gray-400 shrink-0" />
                  {usuarioViendo.empresa || '-'}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">DNI / CUIT</p>
                <p className="flex items-center gap-1 text-gray-800">
                  <IdCard size={14} className="text-gray-400 shrink-0" />
                  {usuarioViendo.dniCuit || '-'}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">Teléfono</p>
                <p className="flex items-center gap-1 text-gray-800">
                  <Phone size={14} className="text-gray-400 shrink-0" />
                  {usuarioViendo.telefono || '-'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">Dirección principal</p>
                <p className="flex items-center gap-1 text-gray-800">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  {usuarioViendo.direccion || '-'}
                </p>
              </div>
            </div>

            {(usuarioViendo.role || 'Cliente') === 'Cliente' && (
              <div className="mb-2">
                <p className="mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">Accesos</p>
                {empresasDeAccesos(usuarioViendo).length > 0 ? (
                  <div className="space-y-2">
                    {empresasDeAccesos(usuarioViendo).map((e) => (
                      <div key={e.id} className="flex items-center gap-2 p-3 border border-gray-200 rounded-md bg-gray-50">
                        <Building2 size={16} className="text-primary shrink-0" />
                        <span className="text-sm font-medium text-gray-800">{e.nombre}</span>
                        <span className="text-sm text-gray-500">· {e.detalle}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Sin accesos: no ve ningún documento en su portal.</p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
              <Link
                href={`/admin/usuarios/completar?uid=${usuarioViendo.id}`}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
              >
                <Edit size={16} />
                Editar datos
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
