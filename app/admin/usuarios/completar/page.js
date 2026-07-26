// app/admin/usuarios/completar/page.js
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { obtenerUsuarioPorId, actualizarUsuario } from '../../../lib/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';

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
