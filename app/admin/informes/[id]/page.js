'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Edit, ArrowLeft, Download } from 'lucide-react';
import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';
import { use } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import DocumentoPDF from '../../../components/pdf/DocumentoPDF';
import { formatearFecha } from '../../../lib/fecha';

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
          alert('Informe no encontrado');
          router.push('/admin/informes');
        }
        setLoadingData(false);
      } catch (error) {
        console.error('Error al cargar informe:', error);
        alert('Error al cargar los datos del informe.');
        router.push('/admin/informes');
      }
    })();
  }, [id, user, router]);

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
              href="/admin/informes"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              Informes
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Detalles del Informe</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <Link
              href="/admin/informes"
              className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
            >
              <ArrowLeft size={18} className="mr-2" /> Volver
            </Link>
            <Link
              href={`/admin/informes/editar/${id}`}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-secondary hover:bg-blue-600"
            >
              <Edit size={18} className="mr-2" /> Editar
            </Link>
            <PDFDownloadLink
              document={<DocumentoPDF documento={documento} />}
              fileName={`${documento.titulo?.replace(/\s+/g, '_') || 'Informe'}.pdf`}
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
          {documento.titulo || 'Informe'}
        </h2>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 gap-6">
          {/* Información del documento */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Informe</h3>
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
                      ? formatearFecha(documento.fecha)
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

          {/* Información del cliente */}
          {(documento.cliente?.nombre || documento.cliente?.empresa || documento.cliente?.sedeNombre) && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Cliente</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <span className="block mb-1 text-sm font-medium text-gray-600">Nombre:</span>
                  <span className="text-gray-900">{documento.cliente?.nombre || 'N/A'}</span>
                </div>
                <div>
                  <span className="block mb-1 text-sm font-medium text-gray-600">Empresa:</span>
                  <span className="text-gray-900">{documento.cliente?.empresa || 'N/A'}</span>
                </div>
                <div>
                  <span className="block mb-1 text-sm font-medium text-gray-600">Email:</span>
                  <span className="text-gray-900">{documento.cliente?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="block mb-1 text-sm font-medium text-gray-600">Teléfono:</span>
                  <span className="text-gray-900">{documento.cliente?.telefono || 'N/A'}</span>
                </div>
                {documento.cliente?.sedeNombre && (
                  <div>
                    <span className="block mb-1 text-sm font-medium text-gray-600">Sede:</span>
                    <span className="text-gray-900">{documento.cliente.sedeNombre}</span>
                  </div>
                )}
                <div>
                  <span className="block mb-1 text-sm font-medium text-gray-600">Dirección:</span>
                  <span className="text-gray-900">{documento.cliente?.direccion || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

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