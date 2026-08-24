'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Save } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../lib/firebase';
import { crearCertificado, generarIdCertificado, obtenerClientes } from '../../../lib/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';
import ClienteSelector from '../../../components/ClienteSelector';
import ArchivosCertificadoUploader from '../../../components/ui/ArchivosCertificadoUploader';
import { fechaHoyLocal } from '../../../lib/fecha';

export default function NuevoCertificado() {
  const router = useRouter();
  const { user, loading } = useStaffAuth(['Admin']);
  const [guardando, setGuardando] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [archivosNuevos, setArchivosNuevos] = useState([]);

  const [certificado, setCertificado] = useState({
    nombre: '',
    fecha: fechaHoyLocal(),
    clienteId: null,
    sedeId: null,
    sedeNombre: '',
    clienteNombre: '',
    descripcion: ''
  });

  useEffect(() => {
    if (!user) return;
    obtenerClientes()
      .then(setClientes)
      .catch((error) => console.error('Error al cargar los clientes:', error));
  }, [user]);

  const handleGuardarCertificado = async () => {
    if (!certificado.nombre.trim()) {
      alert('Ingresá un nombre para el certificado.');
      return;
    }
    if (!certificado.clienteNombre.trim()) {
      alert('Ingresá o seleccioná un cliente.');
      return;
    }
    if (archivosNuevos.length === 0) {
      alert('Adjuntá al menos un archivo (foto o PDF).');
      return;
    }

    setGuardando(true);
    try {
      const id = generarIdCertificado();

      const archivosSubidos = await Promise.all(
        archivosNuevos.map(async (archivo, index) => {
          const path = `certificados/${id}/${Date.now()}-${index}-${archivo.file.name}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, archivo.file);
          const url = await getDownloadURL(storageRef);
          return { url, path, nombre: archivo.file.name };
        })
      );

      const certificadoData = {
        ...certificado,
        archivos: archivosSubidos,
        usuarioCreador: user.email
      };

      await crearCertificado(id, certificadoData);
      router.push('/admin/certificados');
    } catch (error) {
      console.error('Error al guardar el certificado:', error);
      alert('Error al guardar el certificado. Inténtelo de nuevo más tarde.');
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
            <span className="text-gray-700">Nuevo</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <button
              onClick={handleGuardarCertificado}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Nuevo Certificado
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
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={certificado.fecha}
                  onChange={(e) => setCertificado({ ...certificado, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
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
                  required
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
                placeholder="Descripción del certificado (opcional)"
                rows={3}
              />
            </div>
          </div>

          {/* Archivos del certificado */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Archivos (fotos o PDF)</h3>
            <ArchivosCertificadoUploader archivos={archivosNuevos} onChange={setArchivosNuevos} />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => router.push('/admin/certificados')}
              className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardarCertificado}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar Certificado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
