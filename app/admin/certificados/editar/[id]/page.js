'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Save, X, FileText } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../lib/firebase';
import {
  obtenerCertificadoPorId,
  actualizarCertificado,
  eliminarFotosStorage,
  obtenerClientes
} from '../../../../lib/firestore';
import { useStaffAuth } from '../../../../lib/useStaffAuth';
import ClienteSelector from '../../../../components/ClienteSelector';
import ArchivosCertificadoUploader from '../../../../components/ui/ArchivosCertificadoUploader';

export default function EditarCertificado({ params }) {
  const { id } = use(params);

  const router = useRouter();
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [clientes, setClientes] = useState([]);
  const loading = loadingAuth || loadingData;

  const [certificado, setCertificado] = useState({
    nombre: '',
    fecha: '',
    clienteId: null,
    sedeId: null,
    sedeNombre: '',
    clienteNombre: '',
    descripcion: ''
  });

  // Archivos ya subidos a Storage (vienen del documento original)
  const [archivosActuales, setArchivosActuales] = useState([]);
  // Archivos que el usuario sacó de la lista: se borran de Storage recién al guardar
  const [archivosAEliminar, setArchivosAEliminar] = useState([]);
  // Archivos nuevos elegidos ahora, todavía no subidos a Storage
  const [archivosNuevos, setArchivosNuevos] = useState([]);

  useEffect(() => {
    if (!id || !user) return;

    (async () => {
      try {
        const certificadoData = await obtenerCertificadoPorId(id);
        setCertificado({
          nombre: certificadoData.nombre || '',
          fecha: certificadoData.fecha || '',
          clienteId: certificadoData.clienteId || null,
          sedeId: certificadoData.sedeId || null,
          sedeNombre: certificadoData.sedeNombre || '',
          clienteNombre: certificadoData.clienteNombre || '',
          descripcion: certificadoData.descripcion || ''
        });
        setArchivosActuales(certificadoData.archivos || []);

        try {
          setClientes(await obtenerClientes());
        } catch (error) {
          console.error('Error al cargar los clientes:', error);
        }

        setLoadingData(false);
      } catch (error) {
        console.error('Error al cargar certificado:', error);
        alert('Error al cargar los datos del certificado.');
        router.push('/admin/certificados');
      }
    })();
  }, [id, user, router]);

  const quitarArchivoActual = (archivo) => {
    setArchivosActuales(archivosActuales.filter((a) => a.path !== archivo.path));
    setArchivosAEliminar([...archivosAEliminar, archivo]);
  };

  const handleGuardarCambios = async () => {
    if (!certificado.nombre.trim()) {
      alert('Ingresá un nombre para el certificado.');
      return;
    }
    if (!certificado.clienteNombre.trim()) {
      alert('Ingresá o seleccioná un cliente.');
      return;
    }
    if (archivosActuales.length === 0 && archivosNuevos.length === 0) {
      alert('El certificado necesita al menos un archivo adjunto.');
      return;
    }

    setGuardando(true);
    try {
      const archivosSubidos = await Promise.all(
        archivosNuevos.map(async (archivo, index) => {
          const path = `certificados/${id}/${Date.now()}-${index}-${archivo.file.name}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, archivo.file);
          const url = await getDownloadURL(storageRef);
          return { url, path, nombre: archivo.file.name };
        })
      );

      await eliminarFotosStorage(archivosAEliminar);

      const certificadoData = {
        ...certificado,
        archivos: [...archivosActuales, ...archivosSubidos]
      };

      await actualizarCertificado(id, certificadoData);
      router.push(`/admin/certificados/${id}`);
    } catch (error) {
      console.error('Error al actualizar el certificado:', error);
      alert('Error al actualizar el certificado. Inténtelo de nuevo más tarde.');
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
            <span className="text-gray-700">Editar</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <button
              onClick={handleGuardarCambios}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Editar Certificado {certificado.nombre}
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {/* Información del certificado */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Certificado</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={certificado.nombre}
                  onChange={(e) => setCertificado({ ...certificado, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Ej: Certificado de matafuegos"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={certificado.fecha}
                  onChange={(e) => setCertificado({ ...certificado, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Cliente y sede */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Cliente</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Cliente</label>
                <ClienteSelector
                  clientes={clientes}
                  onSelect={({ clienteId, nombre, empresa, sedeId, sedeNombre }) => {
                    setCertificado({ ...certificado, clienteId, sedeId, sedeNombre, clienteNombre: empresa ? `${nombre} - ${empresa}` : nombre });
                  }}
                  placeholder="Buscar cliente registrado (opcional)..."
                />
                <input
                  type="text"
                  value={certificado.clienteNombre}
                  onChange={(e) => setCertificado({ ...certificado, clienteNombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nombre completo o razón social"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Sede</label>
                <input
                  type="text"
                  value={certificado.sedeNombre}
                  onChange={(e) => setCertificado({ ...certificado, sedeNombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Ej: Edificio Torre Norte"
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Detalle</h3>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                value={certificado.descripcion}
                onChange={(e) => setCertificado({ ...certificado, descripcion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[80px] resize-y"
                rows={3}
              />
            </div>
          </div>

          {/* Archivos del certificado */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Archivos (fotos o PDF)</h3>

            {archivosActuales.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm text-gray-500">Archivos actuales</p>
                <ul className="space-y-2">
                  {archivosActuales.map((archivo) => (
                    <li key={archivo.path} className="flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50">
                      <span className="flex items-center flex-1 min-w-0 gap-2 text-gray-700">
                        <FileText size={16} className="shrink-0 text-primary" />
                        <a href={archivo.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                          {archivo.nombre || 'Archivo'}
                        </a>
                      </span>
                      <button
                        type="button"
                        onClick={() => quitarArchivoActual(archivo)}
                        title="Quitar archivo"
                        className="ml-2 text-gray-400 shrink-0 hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mb-2 text-sm text-gray-500">Agregar archivo nuevo</p>
            <ArchivosCertificadoUploader archivos={archivosNuevos} onChange={setArchivosNuevos} />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => router.push(`/admin/certificados/${id}`)}
              className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardarCambios}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
