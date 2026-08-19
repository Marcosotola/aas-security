'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Edit, ArrowLeft, Download, FileText } from 'lucide-react';
import { obtenerFacturaPorId, actualizarFactura } from '../../../lib/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';
import EstadoFacturaToggle from '../../../components/ui/EstadoFactura';
import { formatearFecha } from '../../../lib/fecha';

const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2
}).format(amount || 0);

export default function VerFactura({ params }) {
  const { id } = use(params);

  const router = useRouter();
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [factura, setFactura] = useState(null);
  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!id || !user) return;

    (async () => {
      try {
        setFactura(await obtenerFacturaPorId(id));
        setLoadingData(false);
      } catch (error) {
        console.error('Error al cargar la factura:', error);
        alert('Error al cargar los datos de la factura.');
        router.push('/admin/facturas');
      }
    })();
  }, [id, user, router]);

  const handleCambiarEstado = async (nuevoEstado) => {
    const anterior = factura.estado;
    setFactura({ ...factura, estado: nuevoEstado });
    try {
      await actualizarFactura(id, { estado: nuevoEstado });
    } catch (error) {
      console.error('Error al actualizar el estado de la factura:', error);
      alert('No se pudo actualizar el estado. Inténtelo de nuevo más tarde.');
      setFactura({ ...factura, estado: anterior });
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
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center mb-4">
            <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
              <Home size={16} className="mr-1" /> Panel
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link href="/admin/facturas" className="flex items-center mr-4 text-primary hover:underline">
              Facturación
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Detalles de la Factura</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <Link href="/admin/facturas" className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300">
              <ArrowLeft size={18} className="mr-2" /> Volver
            </Link>
            <Link href={`/admin/facturas/editar/${id}`} className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-secondary hover:bg-blue-600">
              <Edit size={18} className="mr-2" /> Editar
            </Link>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Factura {factura.numero}
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {/* Información de la factura */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información de la Factura</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="mb-4">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Fecha:</span>
                  <span className="text-gray-900">{formatearFecha(factura.fecha)}</span>
                </div>
                <div className="mb-4">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Cliente:</span>
                  <span className="text-lg text-gray-900">{factura.clienteNombre || 'N/A'}</span>
                  {factura.sedeNombre && <span className="block text-sm text-gray-500">Sede: {factura.sedeNombre}</span>}
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Monto:</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(factura.monto)}</span>
                </div>
                <div className="mb-4">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Estado:</span>
                  <EstadoFacturaToggle estado={factura.estado} onChange={handleCambiarEstado} />
                </div>
              </div>
            </div>

            {factura.descripcion && (
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Descripción:</span>
                <div className="p-3 rounded-md bg-gray-50">
                  <p className="text-gray-900 whitespace-pre-line">{factura.descripcion}</p>
                </div>
              </div>
            )}
          </div>

          {/* PDFs adjuntos */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Archivos</h3>
            {(factura.archivos || []).length === 0 ? (
              <p className="text-sm text-gray-400">No hay PDF adjuntos.</p>
            ) : (
              <ul className="space-y-2">
                {factura.archivos.map((archivo, index) => (
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
                <span className="block mb-1 text-sm font-medium text-gray-600">Creada por:</span>
                <span className="text-gray-900">{factura.usuarioCreador || 'No disponible'}</span>
              </div>
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Fecha de creación:</span>
                <span className="text-gray-900">
                  {factura.fechaCreacion?.toDate ? new Date(factura.fechaCreacion.toDate()).toLocaleString('es-AR') : 'No disponible'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
