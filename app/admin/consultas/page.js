// app/admin/consultas/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Search, Trash, MessageCircle, MailOpen, Mail } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { obtenerConsultas, marcarConsultaLeida, eliminarConsulta } from '../../lib/firestore';

// Arma un link de WhatsApp a partir de un teléfono en cualquier formato común en Argentina
const construirLinkWhatsApp = (telefono) => {
  if (!telefono) return null;
  const digitos = telefono.replace(/\D/g, '');
  if (!digitos) return null;

  let numero = digitos;
  if (numero.startsWith('549')) {
    // ya viene con código de país + 9
  } else if (numero.startsWith('54')) {
    numero = `549${numero.slice(2)}`;
  } else if (numero.startsWith('9') && numero.length > 10) {
    numero = `54${numero}`;
  } else {
    numero = `549${numero}`;
  }

  return `https://wa.me/${numero}`;
};

export default function Consultas() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [consultas, setConsultas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarConsultas();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarConsultas = async () => {
    try {
      const data = await obtenerConsultas();
      setConsultas(data);
    } catch (error) {
      console.error('Error al cargar consultas:', error);
      setConsultas([]);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleToggleLeida = async (consulta) => {
    try {
      await marcarConsultaLeida(consulta.id, !consulta.leida);
      setConsultas(prev =>
        prev.map(c => c.id === consulta.id ? { ...c, leida: !consulta.leida } : c)
      );
    } catch (error) {
      console.error('Error al actualizar consulta:', error);
      alert('Error al actualizar la consulta. Inténtelo de nuevo más tarde.');
    }
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar esta consulta?')) {
      try {
        await eliminarConsulta(id);
        setConsultas(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error al eliminar consulta:', error);
        alert('Error al eliminar la consulta. Inténtelo de nuevo más tarde.');
      }
    }
  };

  const consultasFiltradas = consultas.filter((consulta) => {
    if (!filtro) return true;
    const termino = filtro.toLowerCase();
    return (
      consulta.nombre?.toLowerCase().includes(termino) ||
      consulta.telefono?.toLowerCase().includes(termino) ||
      consulta.mensaje?.toLowerCase().includes(termino)
    );
  });

  const noLeidas = consultas.filter(c => !c.leida).length;

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
            <button
              onClick={handleLogout}
              className="flex items-center p-2 text-white rounded-md hover:bg-primary-light"
            >
              <LogOut size={18} className="mr-2" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              <Home size={16} className="mr-1" /> Dashboard
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Consultas</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold font-montserrat text-primary">
            Consultas
          </h2>
          {noLeidas > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
              {noLeidas} sin leer
            </span>
          )}
        </div>

        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <div className="relative flex items-center mb-6">
            <Search size={18} className="absolute text-gray-400 left-3" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o consulta..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Teléfono
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Consulta
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {consultasFiltradas.length > 0 ? (
                  consultasFiltradas.map((consulta) => {
                    const linkWhatsApp = construirLinkWhatsApp(consulta.telefono);
                    return (
                      <tr key={consulta.id} className={!consulta.leida ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            title={consulta.leida ? 'Leída' : 'No leída'}
                            className={`inline-block w-2.5 h-2.5 rounded-full ${consulta.leida ? 'bg-gray-300' : 'bg-red-500'}`}
                          ></span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${!consulta.leida ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {consulta.nombre || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{consulta.telefono || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="text-sm text-gray-700 line-clamp-2" title={consulta.mensaje}>
                            {consulta.mensaje || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {consulta.fechaCreacion
                              ? new Date(consulta.fechaCreacion.toDate()).toLocaleString('es-AR')
                              : 'No disponible'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                          <div className="flex justify-end space-x-4">
                            {linkWhatsApp && (
                              <a
                                href={linkWhatsApp}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Abrir WhatsApp"
                                className="text-green-600 hover:text-green-700"
                              >
                                <MessageCircle size={18} />
                              </a>
                            )}
                            <button
                              onClick={() => handleToggleLeida(consulta)}
                              title={consulta.leida ? 'Marcar como no leída' : 'Marcar como leída'}
                              className="text-secondary hover:text-secondary-light"
                            >
                              {consulta.leida ? <Mail size={18} /> : <MailOpen size={18} />}
                            </button>
                            <button
                              onClick={() => handleEliminar(consulta.id)}
                              title="Eliminar"
                              className="text-red-500 cursor-pointer hover:text-red-700"
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No hay consultas que coincidan con su búsqueda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {consultas.length === 0 && (
            <div className="py-10 text-center">
              <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-gray-500">Todavía no llegaron consultas</p>
              <p className="text-sm text-gray-400">Las consultas del formulario de contacto van a aparecer acá</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
