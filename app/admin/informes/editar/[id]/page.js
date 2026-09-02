'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Save } from 'lucide-react';
import { obtenerDocumentoPorId, actualizarDocumento, obtenerClientes } from '../../../../lib/firestore';
import { useStaffAuth } from '../../../../lib/useStaffAuth';
import { use } from 'react';
import ClienteSelector from '../../../../components/ClienteSelector';

export default function EditarDocumento({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [clientes, setClientes] = useState([]);
  const loading = loadingAuth || loadingData;

  // Estado para el modal de contenido
  const [modalContenido, setModalContenido] = useState({
    isOpen: false,
    value: ''
  });

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
    fecha: '',
    clienteId: null,
    contenido: ''
  });

  useEffect(() => {
    if (!id || !user) return;

    (async () => {
      try {
        const data = await obtenerDocumentoPorId(id);
        setDocumento({
          titulo: data.titulo || '',
          fecha: data.fecha || '',
          clienteId: data.clienteId || null,
          contenido: data.contenido || ''
        });
        setCliente({ sedeId: null, sedeNombre: '', nombre: '', empresa: '', email: '', telefono: '', direccion: '', ...data.cliente });

        try {
          const clientesData = await obtenerClientes();
          setClientes(clientesData);
        } catch (error) {
          console.error('Error al cargar clientes:', error);
        }

        setLoadingData(false);
      } catch (error) {
        console.error('Error al cargar informe:', error);
        alert('Error al cargar los datos del informe.');
        router.push('/admin/informes');
      }
    })();
  }, [id, user, router]);

  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    setCliente({ ...cliente, [name]: value });
  };

  // Función para abrir el modal de contenido
  const abrirModalContenido = () => {
    setModalContenido({
      isOpen: true,
      value: documento.contenido || ''
    });
  };

  // Función para guardar y cerrar el modal
  const guardarContenido = () => {
    setDocumento({ ...documento, contenido: modalContenido.value });
    setModalContenido({
      isOpen: false,
      value: ''
    });
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
      await actualizarDocumento(id, { ...documento, cliente });
      alert('Informe actualizado exitosamente');
      router.push('/admin/informes');
    } catch (error) {
      console.error('Error al actualizar el informe:', error);
      alert('Error al actualizar el informe. Inténtelo de nuevo más tarde.');
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
            <span className="text-gray-700">Editar Informe</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <button
              onClick={handleGuardarDocumento}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Editar Informe
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

            {/* Vista móvil - Botón que abre modal */}
            <div className="md:hidden">
              <div
                onClick={abrirModalContenido}
                className="min-h-[150px] p-3 border border-gray-300 rounded-md bg-gray-50 cursor-pointer flex items-start justify-between transition-colors hover:bg-gray-100"
              >
                <span className={`text-sm flex-1 ${documento.contenido ? 'text-gray-800' : 'text-gray-400'}`}>
                  {documento.contenido || 'Toca para editar el contenido del informe'}
                </span>
                <svg className="flex-shrink-0 w-5 h-5 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              {/* Preview del texto si existe */}
              {documento.contenido && (
                <div className="mt-2 text-xs text-gray-500">
                  {documento.contenido.length} caracteres
                </div>
              )}
            </div>

            {/* Vista desktop - Textarea normal */}
            <div className="hidden md:block">
              <textarea
                value={documento.contenido}
                onChange={(e) => setDocumento({ ...documento, contenido: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[300px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Edite el contenido del informe..."
                rows={12}
                required
              />
              <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                <span>{documento.contenido.length} caracteres</span>
                <span className="text-xs text-gray-400">El texto se ajustará automáticamente en el PDF</span>
              </div>
            </div>
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
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal para editar contenido (móvil) */}
      {modalContenido.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col w-full h-full bg-white md:w-11/12 md:h-5/6 md:rounded-lg md:max-w-4xl">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 md:rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Editar contenido del informe</h3>
              <button
                onClick={() => setModalContenido({ isOpen: false, value: '' })}
                className="p-2 text-gray-500 transition-colors hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="flex flex-col flex-1 p-4 bg-white md:rounded-b-lg">
              <textarea
                value={modalContenido.value}
                onChange={(e) => setModalContenido({ ...modalContenido, value: e.target.value })}
                className="flex-1 w-full p-4 text-base border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Edite el contenido del informe..."
                autoFocus
                style={{ minHeight: '200px' }}
              />

              {/* Contador de caracteres */}
              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <span>{modalContenido.value.length} caracteres</span>
                <span className="text-xs text-gray-400">El texto se ajustará automáticamente en el PDF</span>
              </div>

              {/* Botones del modal */}
              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={() => setModalContenido({ isOpen: false, value: '' })}
                  className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarContenido}
                  className="px-6 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}