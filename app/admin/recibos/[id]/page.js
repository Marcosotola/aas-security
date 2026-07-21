'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Edit, ArrowLeft, Download } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { obtenerReciboPorId } from '../../../lib/firestore';
import { use } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReciboPDF from '../../../components/pdf/ReciboPDF';

export default function VerRecibo({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recibo, setRecibo] = useState(null);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const reciboData = await obtenerReciboPorId(id);
          setRecibo(reciboData);
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar recibo:', error);
          alert('Error al cargar los datos del recibo.');
          router.push('/admin/recibos');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [id, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header del administrador */}
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
            <Link
              href="/admin/recibos"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              Recibos
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Detalles del Recibo</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <Link
              href="/admin/recibos"
              className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
            >
              <ArrowLeft size={18} className="mr-2" /> Volver
            </Link>
            <Link
              href={`/admin/recibos/editar/${id}`}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-secondary hover:bg-blue-600"
            >
              <Edit size={18} className="mr-2" /> Editar
            </Link>
            <PDFDownloadLink
              document={<ReciboPDF recibo={recibo} />}
              fileName={`${recibo.numero}.pdf`}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
            >
              {({ blob, url, loading, error }) =>
                loading ?
                  <span><span className="inline-block w-4 h-4 mr-2 border-t-2 border-white rounded-full animate-spin"></span> Generando PDF...</span> :
                  <span><Download size={18} className="mr-2" /> Descargar PDF</span>
              }
            </PDFDownloadLink>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Recibo {recibo.numero}
        </h2>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 gap-6">
          {/* Información del recibo */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Recibo</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="mb-4">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Número:</span>
                  <span className="text-lg font-semibold text-gray-900">{recibo.numero}</span>
                </div>
                <div className="mb-4">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Fecha:</span>
                  <span className="text-gray-900">{new Date(recibo.fecha).toLocaleDateString('es-AR')}</span>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Monto:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${(recibo.monto || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="mb-4">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Usuario creador:</span>
                  <span className="text-gray-900">{recibo.usuarioCreador || 'No disponible'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Datos del recibo */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Detalles del Pago</h3>
            <div className="space-y-4">
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Recibí de:</span>
                <span className="text-lg text-gray-900">{recibo.recibiDe}</span>
              </div>
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Cantidad en letras:</span>
                <span className="italic text-gray-900">{recibo.cantidadLetras}</span>
              </div>
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">En concepto de:</span>
                <div className="p-3 rounded-md bg-gray-50">
                  <p className="text-gray-900 whitespace-pre-line">{recibo.concepto}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Firma y Aclaración */}
          {(recibo.firma || recibo.aclaracion) && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">Firma y Aclaración</h3>
              <div className="text-center">
                {recibo.firma && (
                  <div className="mb-4">
                    <img
                      src={recibo.firma}
                      alt="Firma"
                      className="mx-auto mb-2 border border-gray-300"
                      style={{ maxWidth: '300px', height: '150px' }}
                    />
                    <p className="text-sm text-gray-600">Firma</p>
                  </div>
                )}
                {recibo.aclaracion && (
                  <div>
                    <p className="text-lg font-medium text-gray-900">{recibo.aclaracion}</p>
                    <p className="text-sm text-gray-600">Aclaración</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información de auditoría */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información de Auditoría</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Fecha de creación:</span>
                <span className="text-gray-900">
                  {recibo.fechaCreacion && recibo.fechaCreacion.toDate 
                    ? new Date(recibo.fechaCreacion.toDate()).toLocaleString('es-AR')
                    : 'No disponible'}
                </span>
              </div>
              {recibo.fechaActualizacion && (
                <div>
                  <span className="block mb-1 text-sm font-medium text-gray-600">Última actualización:</span>
                  <span className="text-gray-900">
                    {recibo.fechaActualizacion.toDate 
                      ? new Date(recibo.fechaActualizacion.toDate()).toLocaleString('es-AR')
                      : 'No disponible'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}