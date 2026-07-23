// app/registro/datos/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { obtenerUsuarioPorId, actualizarUsuario } from '../../lib/firestore';

export default function CompletarDatos() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const [datos, setDatos] = useState({
    nombre: '',
    apellido: '',
    empresa: '',
    dniCuit: '',
    direccion: '',
    telefono: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);

      try {
        const perfil = await obtenerUsuarioPorId(currentUser.uid);
        if (perfil) {
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
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

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
      await actualizarUsuario(user.uid, { ...datos, perfilCompleto: true });
      router.push('/cuenta');
    } catch (err) {
      console.error('Error al guardar los datos:', err);
      setError('No se pudieron guardar los datos. Inténtalo de nuevo más tarde.');
    } finally {
      setGuardando(false);
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
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-100 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div>
          <Link href="/" className="flex items-center justify-center mb-6 group">
            <span className="text-3xl font-bold font-montserrat">
              <span className="text-primary">AAS</span>
              <span className="text-secondary"> Security</span>
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-center font-montserrat text-primary">
            Completá tus datos
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Paso 2 de 2 · Estos datos se van a usar para tus presupuestos, remitos y recibos
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white border border-transparent rounded-md bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Finalizar registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
