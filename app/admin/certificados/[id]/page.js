'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Edit, ArrowLeft, Download, FileText } from 'lucide-react';
import { obtenerCertificadoPorId } from '../../../lib/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';
import { formatearFecha } from '../../../lib/fecha';

export default function VerCertificado({ params }) {
  const { id } = use(params);

  const router = useRouter();
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [certificado, setCertificado] = useState(null);
  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!id || !user) return;

    (async () => {
      try {
        setCertificado(await obtenerCertificadoPorId(id));
        setLoadingData(false);
      } catch (error) {
        console.error('Error al cargar el certificado:', error);
        alert('Error al cargar los datos del certificado.');
        router.push('/admin/certificados');
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
            <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
              <Home size={16} className="mr-1" /> Panel
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link href="/admin/certificados" className="flex items-center mr-4 text-primary hover:underline">
              Certificados
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Detalles del Certificado</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <Link href="/admin/certificados" className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300">
              <ArrowLeft size={18} className="mr-2" /> Volver
            </Link>
            <Link href={`/admin/certificados/editar/${id}`} className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-secondary hover:bg-blue-600">
              <Edit size={18} className="mr-2" /> Editar
            </Link>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          {certificado.nombre}
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {/* Información del certificado */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Certificado</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="mb-4">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Fecha:</span>
                  <span className="text-gray-900">{formatearFecha(certificado.fecha)}</span>
                </div>
                <div className="mb-4">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Cliente:</span>
                  <span className="text-lg text-gray-900">{certificado.clienteNombre || 'N/A'}</span>
                  {certificado.sedeNombre && <span className="block text-sm text-gray-500">Sede: {certificado.sedeNombre}</span>}
                </div>
              </div>
            </div>

            {certificado.descripcion && (
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Descripción:</span>
                <div className="p-3 rounded-md bg-gray-50">
                  <p className="text-gray-900 whitespace-pre-line">{certificado.descripcion}</p>
                </div>
              </div>
            )}
          </div>

          {/* Archivos adjuntos */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Archivos</h3>
            {(certificado.archivos || []).length === 0 ? (
              <p className="text-sm text-gray-400">No hay archivos adjuntos.</p>
            ) : (
              <ul className="space-y-2">
                {certificado.archivos.map((archivo, index) => (
                  <li key={archivo.path || index} className="flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50">
                    <span className="flex items-center flex-1 min-w-0 gap-2 text-gray-700">
                      <FileText size={16} className="shrink-0 text-primary" />
                      <span className="truncate">{archivo.nombre || `Archivo ${index + 1}`}</span>
                    </span>
                    <a
                      href={archivo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Descargar"
                      className="ml-2 text-primary shrink-0 hover:text-primary-light"
                    >
                      <Download size={18} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Información de auditoría */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información de Auditoría</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Creado por:</span>
                <span className="text-gray-900">{certificado.usuarioCreador || 'No disponible'}</span>
              </div>
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Fecha de creación:</span>
                <span className="text-gray-900">
                  {certificado.fechaCreacion?.toDate ? new Date(certificado.fechaCreacion.toDate()).toLocaleString('es-AR') : 'No disponible'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
