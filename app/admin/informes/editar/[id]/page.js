'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Save } from 'lucide-react';
import { obtenerDocumentoPorId, actualizarDocumento, obtenerEmpresas } from '../../../../lib/firestore';
import { useStaffAuth } from '../../../../lib/useStaffAuth';
import { use } from 'react';
import EmpresaSelector from '../../../../components/EmpresaSelector';
import RichTextEditor from '../../../../components/ui/RichTextEditor';

export default function EditarDocumento({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const loading = loadingAuth || loadingData;

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
    empresaId: null,
    sedeId: null,
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
          empresaId: data.empresaId || null,
          sedeId: data.sedeId || null,
          contenido: data.contenido || ''
        });
        setCliente({ sedeId: null, sedeNombre: '', nombre: '', empresa: '', email: '', telefono: '', direccion: '', ...data.cliente });

        try {
          const empresasData = await obtenerEmpresas();
          setEmpresas(empresasData);
        } catch (error) {
          console.error('Error al cargar empresas:', error);
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
            <EmpresaSelector
              empresas={empresas}
              empresaId={documento.empresaId}
              sedeId={documento.sedeId}
              onSelect={({ empresaId, sedeId, empresa, email, telefono, direccion, sedeNombre }) => {
                setDocumento({ ...documento, clienteId: null, empresaId, sedeId });
                setCliente({ ...cliente, empresa, email, telefono, direccion, sedeId, sedeNombre });
              }}
              onQuitar={() => setDocumento({ ...documento, clienteId: null, empresaId: null, sedeId: null })}
              placeholder="Buscar empresa registrada (opcional)..."
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
              placeholder="Edite el contenido del informe..."
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
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}