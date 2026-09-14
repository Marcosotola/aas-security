'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Save, Download } from 'lucide-react';
import { crearDocumento, obtenerClientes } from '../../../lib/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';
import { PDFDownloadLink } from '@react-pdf/renderer';
import DocumentoPDF from '../../../components/pdf/DocumentoPDF';
import ClienteSelector from '../../../components/ClienteSelector';
import CompartirDocumentoModal from '../../../components/ui/CompartirDocumentoModal';
import RichTextEditor from '../../../components/ui/RichTextEditor';
import { fechaHoyLocal } from '../../../lib/fecha';

export default function NuevoDocumento() {
  const router = useRouter();
  const { user, loading } = useStaffAuth(['Admin']);
  const [guardando, setGuardando] = useState(false);
  const [documentoGuardado, setDocumentoGuardado] = useState(null);
  const [clientes, setClientes] = useState([]);

  // Estado del cliente
  const [cliente, setCliente] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    direccion: '',
    sedeId: null,
    sedeNombre: ''
  });

  // Estado del formulario
  const [documento, setDocumento] = useState({
    titulo: '',
    fecha: fechaHoyLocal(),
    clienteId: null,
    contenido: ''
  });

  useEffect(() => {
    if (!user) return;
    obtenerClientes()
      .then(setClientes)
      .catch((error) => console.error('Error al cargar los clientes:', error));
  }, [user]);

  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    setCliente({ ...cliente, [name]: value });
  };

  const handleGuardarDocumento = async () => {
    if (!documento.titulo.trim()) {
      alert('Por favor ingrese un título para el informe');
      return;
    }

    if (!documento.contenido.trim()) {
      alert('Por favor ingrese el contenido del informe');
      return;
    }

    setGuardando(true);
    try {
      const documentoData = {
        ...documento,
        cliente,
        usuarioCreador: user.email
      };
      await crearDocumento(documentoData);
      setDocumentoGuardado({
        pdfElement: <DocumentoPDF documento={documentoData} />,
        fileName: `${documentoData.titulo.replace(/\s+/g, '_')}.pdf`,
        numero: documentoData.titulo,
        telefono: cliente.telefono
      });
    } catch (error) {
      console.error('Error al guardar el informe:', error);
      alert('Error al guardar el informe. Inténtelo de nuevo más tarde.');
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
            <span className="text-gray-700">Nuevo Informe</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <button
              onClick={handleGuardarDocumento}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            {documento.titulo && documento.contenido && (
              <PDFDownloadLink
                document={<DocumentoPDF documento={{ ...documento, cliente }} />}
                fileName={`${documento.titulo.replace(/\s+/g, '_')}.pdf`}
                className={`bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center`}
              >
                {({ blob, url, loading, error }) =>
                  loading ?
                    <span><span className="inline-block w-4 h-4 mr-2 border-t-2 border-white rounded-full animate-spin"></span> Generando PDF...</span> :
                    <span><Download size={18} className="mr-2" /> Descargar PDF</span>
                }
              </PDFDownloadLink>
            )}
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Nuevo Informe
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {/* Información básica */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Informe</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Título *</label>
                <input
                  type="text"
                  value={documento.titulo}
                  onChange={(e) => setDocumento({ ...documento, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Ej: CERTIFICACIÓN, CARTA, etc."
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={documento.fecha}
                  onChange={(e) => setDocumento({ ...documento, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Cliente</h3>
            <ClienteSelector
              clientes={clientes}
              onSelect={({ clienteId, nombre, empresa, email, telefono, direccion, sedeId, sedeNombre }) => {
                setDocumento({ ...documento, clienteId });
                setCliente({ nombre, empresa, email, telefono, direccion, sedeId, sedeNombre });
              }}
              placeholder="Buscar cliente registrado (opcional)..."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={cliente.nombre}
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Empresa</label>
                <input
                  type="text"
                  name="empresa"
                  value={cliente.empresa}
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={cliente.email}
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={cliente.telefono}
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Sede</label>
                <input
                  type="text"
                  name="sedeNombre"
                  value={cliente.sedeNombre}
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Ej: Edificio Torre Norte"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={cliente.direccion}
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Contenido del documento */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Contenido del Informe *</h3>
            <RichTextEditor
              value={documento.contenido}
              onChange={(html) => setDocumento({ ...documento, contenido: html })}
              placeholder="Escriba aquí el contenido completo del informe. Este texto aparecerá en el cuerpo de la hoja membretada."
              minHeight="300px"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => router.push('/admin/informes')}
              className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardarDocumento}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar Informe'}
            </button>
          </div>
        </div>
      </div>

      {documentoGuardado && (
        <CompartirDocumentoModal
          abierto
          pdfElement={documentoGuardado.pdfElement}
          fileName={documentoGuardado.fileName}
          tipo="Informe"
          numero={documentoGuardado.numero}
          telefono={documentoGuardado.telefono}
          onIrALista={() => router.push('/admin/informes')}
        />
      )}
    </div>
  );
}