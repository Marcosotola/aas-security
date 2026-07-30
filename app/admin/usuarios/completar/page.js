// app/admin/usuarios/completar/page.js
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Home, MapPin, PlusCircle, Trash2, Edit, Check, X } from 'lucide-react';
import { obtenerUsuarioPorId, actualizarUsuario } from '../../../lib/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';

const SEDE_VACIA = { nombre: '', direccion: '' };

// Paso 2 del alta de un cliente hecha por un Admin desde /admin/usuarios: a
// diferencia de /registro/datos (que completa el perfil del usuario logueado
// vía onAuthStateChanged), acá el Admin carga los datos de OTRO usuario, por
// eso el uid viene por query param en vez de tomarse de la sesión activa.
// También se reutiliza para editar el perfil de un usuario ya existente.
function CompletarDatosAdmin() {
  const { loading: loadingAuth } = useStaffAuth(['Admin']);
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');

  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  const [datos, setDatos] = useState({
    nombre: '',
    apellido: '',
    empresa: '',
    dniCuit: '',
    direccion: '',
    telefono: ''
  });

  const [sedes, setSedes] = useState([]);
  const [nuevaSede, setNuevaSede] = useState(SEDE_VACIA);
  const [guardandoSede, setGuardandoSede] = useState(false);
  const [editandoSedeId, setEditandoSedeId] = useState(null);
  const [sedeEditada, setSedeEditada] = useState(SEDE_VACIA);

  useEffect(() => {
    if (loadingAuth || !uid) return;

    const cargarPerfil = async () => {
      try {
        const perfil = await obtenerUsuarioPorId(uid);
        if (perfil) {
          setEmail(perfil.email || '');
          setDatos({
            nombre: perfil.nombre || '',
            apellido: perfil.apellido || '',
            empresa: perfil.empresa || '',
            dniCuit: perfil.dniCuit || '',
            direccion: perfil.direccion || '',
            telefono: perfil.telefono || ''
          });
          setSedes(perfil.sedes || []);
        }
      } catch (err) {
        console.error('Error al cargar el perfil:', err);
        setError('No se pudo cargar el perfil del usuario.');
      } finally {
        setLoadingPerfil(false);
      }
    };

    cargarPerfil();
  }, [loadingAuth, uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  const handleAgregarSede = async () => {
    if (!nuevaSede.nombre.trim() || !nuevaSede.direccion.trim()) return;

    setGuardandoSede(true);
    try {
      const nuevasSedes = [...sedes, { id: Date.now().toString(), ...nuevaSede }];
      await actualizarUsuario(uid, { sedes: nuevasSedes });
      setSedes(nuevasSedes);
      setNuevaSede(SEDE_VACIA);
    } catch (err) {
      console.error('Error al agregar la sede:', err);
      alert('No se pudo agregar la sede. Inténtalo de nuevo más tarde.');
    } finally {
      setGuardandoSede(false);
    }
  };

  const handleEliminarSede = async (id) => {
    if (!confirm('¿Eliminar esta sede?')) return;
    try {
      const nuevasSedes = sedes.filter((s) => s.id !== id);
      await actualizarUsuario(uid, { sedes: nuevasSedes });
      setSedes(nuevasSedes);
    } catch (err) {
      console.error('Error al eliminar la sede:', err);
      alert('No se pudo eliminar la sede. Inténtalo de nuevo más tarde.');
    }
  };

  const handleEmpezarEditarSede = (sede) => {
    setEditandoSedeId(sede.id);
    setSedeEditada({ nombre: sede.nombre, direccion: sede.direccion });
  };

  const handleCancelarEdicionSede = () => {
    setEditandoSedeId(null);
    setSedeEditada(SEDE_VACIA);
  };

  const handleGuardarEdicionSede = async (id) => {
    if (!sedeEditada.nombre.trim() || !sedeEditada.direccion.trim()) return;

    setGuardandoSede(true);
    try {
      const nuevasSedes = sedes.map((s) => (s.id === id ? { ...s, ...sedeEditada } : s));
      await actualizarUsuario(uid, { sedes: nuevasSedes });
      setSedes(nuevasSedes);
      setEditandoSedeId(null);
    } catch (err) {
      console.error('Error al editar la sede:', err);
      alert('No se pudo guardar la sede. Inténtalo de nuevo más tarde.');
    } finally {
      setGuardandoSede(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!datos.nombre.trim() || !datos.apellido.trim() || !datos.dniCuit.trim() || !datos.direccion.trim() || !datos.telefono.trim()) {
      setError('Completá todos los campos obligatorios.');
      return;
    }

    setGuardando(true);
    try {
      await actualizarUsuario(uid, { ...datos, perfilCompleto: true });
      router.push('/admin/usuarios');
    } catch (err) {
      console.error('Error al guardar los datos:', err);
      setError('No se pudieron guardar los datos. Inténtalo de nuevo más tarde.');
    } finally {
      setGuardando(false);
    }
  };

  if (!uid) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <p className="text-red-600">Falta el identificador del usuario.</p>
        <Link href="/admin/usuarios" className="text-primary hover:underline">Volver a Usuarios</Link>
      </div>
    );
  }

  if (loadingAuth || loadingPerfil) {
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
      <div className="flex items-center mb-8">
        <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
          <Home size={16} className="mr-1" /> Panel
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <Link href="/admin/usuarios" className="text-primary hover:underline">Usuarios</Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-700">Datos del cliente</span>
      </div>

      <div className="max-w-lg p-8 mx-auto space-y-6 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-2xl font-bold font-montserrat text-primary">
            Datos del cliente
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {email ? `Paso 2 de 2 · ${email}` : 'Paso 2 de 2'}
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 rounded-md bg-red-100">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={datos.nombre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={datos.apellido}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Razón Social / Empresa (opcional)</label>
            <input
              type="text"
              name="empresa"
              value={datos.empresa}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Si aplica"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">DNI / CUIT</label>
              <input
                type="text"
                name="dniCuit"
                value={datos.dniCuit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={datos.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Dirección principal</label>
            <input
              type="text"
              name="direccion"
              value={datos.direccion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Calle, número, ciudad"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="relative flex justify-center flex-1 px-4 py-3 text-sm font-medium text-white border border-transparent rounded-md bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            <Link
              href="/admin/usuarios"
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Hacerlo después
            </Link>
          </div>
        </form>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="mb-1 text-lg font-semibold text-gray-700">Sedes</h3>
          <p className="mb-4 text-sm text-gray-500">
            Ubicaciones adicionales del cliente (por ejemplo varios edificios de un consorcio). Se podrán elegir al hacerle un presupuesto, remito o recibo.
          </p>

          <div className="mb-4 space-y-2">
            {sedes.length === 0 && (
              <p className="text-sm text-gray-400">Todavía no hay sedes cargadas.</p>
            )}
            {sedes.map((sede) => (
              <div key={sede.id} className="p-3 border border-gray-200 rounded-md bg-gray-50">
                {editandoSedeId === sede.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={sedeEditada.nombre}
                      onChange={(e) => setSedeEditada({ ...sedeEditada, nombre: e.target.value })}
                      placeholder="Nombre de la sede"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={sedeEditada.direccion}
                      onChange={(e) => setSedeEditada({ ...sedeEditada, direccion: e.target.value })}
                      placeholder="Dirección de la sede"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCancelarEdicionSede}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        <X size={14} /> Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGuardarEdicionSede(sede.id)}
                        disabled={guardandoSede}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-white rounded-md bg-primary hover:bg-primary-light disabled:opacity-50"
                      >
                        <Check size={14} /> Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <MapPin size={16} className="mt-0.5 mr-2 text-primary shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-800">{sede.nombre}</div>
                        <div className="text-xs text-gray-500">{sede.direccion}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => handleEmpezarEditarSede(sede)} className="text-secondary hover:text-secondary-light">
                        <Edit size={16} />
                      </button>
                      <button type="button" onClick={() => handleEliminarSede(sede.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={nuevaSede.nombre}
              onChange={(e) => setNuevaSede({ ...nuevaSede, nombre: e.target.value })}
              placeholder="Nombre de la sede (ej: Edificio Torre Norte)"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={nuevaSede.direccion}
              onChange={(e) => setNuevaSede({ ...nuevaSede, direccion: e.target.value })}
              placeholder="Dirección de la sede"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={handleAgregarSede}
              disabled={guardandoSede}
              className="flex items-center justify-center w-full gap-1 px-4 py-2 text-sm text-white rounded-md bg-primary hover:bg-primary-light disabled:opacity-50"
            >
              <PlusCircle size={16} /> Agregar sede
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompletarDatosAdminPage() {
  return (
    <Suspense fallback={null}>
      <CompletarDatosAdmin />
    </Suspense>
  );
}
