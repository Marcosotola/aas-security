'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Edit, ArrowLeft, Download } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';
import { use } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import DocumentoPDF from '../../../components/pdf/DocumentoPDF';

export default function VerDocumento({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [documento, setDocumento] = useState(null);
  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!id || !user) return;

    (async () => {
      try {
        const docRef = doc(db, 'documentos', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDocumento({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert('Documento no encontrado');
          router.push('/admin/documentos');
        }
        setLoadingData(false);
      } catch (error) {
        console.error('Error al cargar documento:', error);
        alert('Error al cargar los datos del documento.');
        router.push('/admin/documentos');
      }
    })();
  }, [id, user, router]);

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
              <Home size={16} className="mr-1" /> Panel
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link
              href="/admin/documentos"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              Documentos
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Detalles del Documento</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <Link
              href="/admin/documentos"
              className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
            >
              <ArrowLeft size={18} className="mr-2" /> Volver
            </Link>
            <Link
              href={`/admin/documentos/editar/${id}`}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-secondary hover:bg-blue-600"
            >
              <Edit size={18} className="mr-2" /> Editar
            </Link>
            <PDFDownloadLink
              document={<DocumentoPDF documento={documento} />}
              fileName={`${documento.titulo?.replace(/\s+/g, '_') || 'Documento'}.pdf`}
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
          {documento.titulo || 'Documento'}
        </h2>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 gap-6">
          {/* Información del documento */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Documento</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="mb-4">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Título:</span>
                  <span className="text-lg font-semibold text-gray-900">{documento.titulo || 'Sin título'}</span>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Fecha:</span>
                  <span className="text-gray-900">
                    {documento.fecha 
                      ? new Date(documento.fecha).toLocaleDateString('es-AR')
                      : 'No disponible'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <span className="block mb-1 text-sm font-medium text-gray-600">Usuario creador:</span>
              <span className="text-gray-900">{documento.usuarioCreador || 'No disponible'}</span>
            </div>
          </div>

          {/* Contenido del documento */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Contenido</h3>
            <div className="p-4 rounded-md bg-gray-50">
              <p className="leading-relaxed text-gray-900 whitespace-pre-line">
                {documento.contenido || 'Sin contenido'}
              </p>
            </div>
          </div>

          {/* Información de auditoría */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información de Auditoría</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Fecha de creación:</span>
                <span className="text-gray-900">
                  {documento.fechaCreacion && documento.fechaCreacion.toDate 
                    ? new Date(documento.fechaCreacion.toDate()).toLocaleString('es-AR')
                    : 'No disponible'}
                </span>
              </div>
              {documento.fechaActualizacion && (
                <div>
                  <span className="block mb-1 text-sm font-medium text-gray-600">Última actualización:</span>
                  <span className="text-gray-900">
                    {documento.fechaActualizacion.toDate 
                      ? new Date(documento.fechaActualizacion.toDate()).toLocaleString('es-AR')
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