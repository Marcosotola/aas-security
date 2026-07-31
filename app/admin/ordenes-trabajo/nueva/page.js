'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Save } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../lib/firebase';
import { crearOrdenTrabajo, generarIdOrdenTrabajo, obtenerClientes, obtenerPlantillas } from '../../../lib/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';
import OrdenTrabajoPDF from '../../../components/pdf/OrdenTrabajoPDF';
import ClienteSelector from '../../../components/ClienteSelector';
import CompartirDocumentoModal from '../../../components/ui/CompartirDocumentoModal';
import FotosUploader from '../../../components/ui/FotosUploader';
import FirmaCanvas from '../../../components/ui/FirmaCanvas';
import PlanillasAdjuntas from '../../../components/planillas/PlanillasAdjuntas';
import { fechaHoyLocal } from '../../../lib/fecha';
import { archivoABase64 } from '../../../lib/imagenes';

export default function NuevaOrdenTrabajo() {
  const router = useRouter();
  const { user, loading } = useStaffAuth(['Admin', 'Tecnico']);
  const [guardando, setGuardando] = useState(false);
  const [documentoGuardado, setDocumentoGuardado] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [plantillasDisponibles, setPlantillasDisponibles] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [planillasAdjuntas, setPlanillasAdjuntas] = useState([]);

  const [cliente, setCliente] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    direccion: '',
    sedeId: null,
    sedeNombre: ''
  });

  const [orden, setOrden] = useState({
    numero: `OT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    fecha: fechaHoyLocal(),
    clienteId: null,
    descripcionTrabajo: '',
    observaciones: '',
    firmaTecnico: null,
    aclaracionFirmaTecnico: '',
    firmaCliente: null,
    aclaracionFirmaCliente: ''
  });

  useEffect(() => {
    if (!user) return;
    obtenerClientes()
      .then(setClientes)
      .catch((error) => console.error('Error al cargar los clientes:', error));
    obtenerPlantillas()
      .then(setPlantillasDisponibles)
      .catch((error) => console.error('Error al cargar las plantillas:', error));
  }, [user]);

  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    setCliente({ ...cliente, [name]: value });
  };

  const handleGuardarOrden = async () => {
    if (!orden.descripcionTrabajo.trim()) {
      alert('Por favor, describa el trabajo realizado.');
      return;
    }

    setGuardando(true);
    try {
      const id = generarIdOrdenTrabajo();

      const fotosSubidas = await Promise.all(
        fotos.map(async (foto, index) => {
          const path = `ordenes-trabajo/${id}/${Date.now()}-${index}-${foto.file.name}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, foto.file);
          const url = await getDownloadURL(storageRef);
          return { url, path };
        })
      );

      // Fotos en base64 para el PDF que se genera al toque (compartir/descargar):
      // se arman directo desde los File locales, sin depender de que
      // @react-pdf/renderer logre resolver la URL recién subida.
      const fotosBase64 = await Promise.all(
        fotos.map(async (foto, index) => ({
          url: await archivoABase64(foto.file),
          path: fotosSubidas[index]?.path
        }))
      );

      const otData = {
        numero: orden.numero,
        fecha: orden.fecha,
        clienteId: orden.clienteId || null,
        cliente,
        descripcionTrabajo: orden.descripcionTrabajo,
        fotos: fotosSubidas,
        planillasAdjuntas,
        firmaTecnico: orden.firmaTecnico,
        aclaracionFirmaTecnico: orden.aclaracionFirmaTecnico,
        firmaCliente: orden.firmaCliente,
        aclaracionFirmaCliente: orden.aclaracionFirmaCliente,
        observaciones: orden.observaciones,
        usuarioCreador: user.email
      };

      await crearOrdenTrabajo(id, otData);
      setDocumentoGuardado({
        pdfElement: <OrdenTrabajoPDF orden={{ ...otData, fotos: fotosBase64 }} />,
        fileName: `${otData.numero}.pdf`,
        numero: otData.numero,
        telefono: cliente.telefono
      });
    } catch (error) {
      console.error('Error al guardar la orden de trabajo:', error);
      alert('Error al guardar la orden de trabajo. Inténtelo de nuevo más tarde.');
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
            <Link href="/admin/ordenes-trabajo" className="flex items-center mr-4 text-primary hover:underline">
              Órdenes de Trabajo
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Nueva</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <button
              onClick={handleGuardarOrden}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Nueva Orden de Trabajo
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {/* Información de la OT */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información de la Orden</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Número</label>
                <input
                  type="text"
                  value={orden.numero}
                  onChange={(e) => setOrden({ ...orden, numero: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={orden.fecha}
                  onChange={(e) => setOrden({ ...orden, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                setOrden({ ...orden, clienteId });
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

          {/* Descripción del trabajo */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Descripción del Trabajo Realizado</h3>
            <textarea
              value={orden.descripcionTrabajo}
              onChange={(e) => setOrden({ ...orden, descripcionTrabajo: e.target.value })}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Detalle el trabajo realizado..."
            />
          </div>

          {/* Firma del técnico */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <FirmaCanvas
              titulo="Firma del Técnico"
              firma={orden.firmaTecnico}
              aclaracion={orden.aclaracionFirmaTecnico}
              onGuardar={(firma) => setOrden({ ...orden, firmaTecnico: firma })}
              onAclaracionChange={(aclaracion) => setOrden({ ...orden, aclaracionFirmaTecnico: aclaracion })}
            />
          </div>

          {/* Firma de conformidad del cliente */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <FirmaCanvas
              titulo="Conformidad del Cliente"
              firma={orden.firmaCliente}
              aclaracion={orden.aclaracionFirmaCliente}
              onGuardar={(firma) => setOrden({ ...orden, firmaCliente: firma })}
              onAclaracionChange={(aclaracion) => setOrden({ ...orden, aclaracionFirmaCliente: aclaracion })}
            />
          </div>

          {/* Planillas de inspección */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Planillas de Inspección</h3>
            <PlanillasAdjuntas
              plantillasDisponibles={plantillasDisponibles}
              planillasAdjuntas={planillasAdjuntas}
              onChange={setPlanillasAdjuntas}
            />
          </div>

          {/* Fotos */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Fotos</h3>
            <FotosUploader fotos={fotos} onChange={setFotos} />
          </div>

          {/* Observaciones */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Observaciones</h3>
            <textarea
              value={orden.observaciones}
              onChange={(e) => setOrden({ ...orden, observaciones: e.target.value })}
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Observaciones adicionales..."
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => router.push('/admin/ordenes-trabajo')}
              className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardarOrden}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar Orden de Trabajo'}
            </button>
          </div>
        </div>
      </div>

      {documentoGuardado && (
        <CompartirDocumentoModal
          abierto
          pdfElement={documentoGuardado.pdfElement}
          fileName={documentoGuardado.fileName}
          tipo="Orden de Trabajo"
          numero={documentoGuardado.numero}
          telefono={documentoGuardado.telefono}
          onIrALista={() => router.push('/admin/ordenes-trabajo')}
        />
      )}
    </div>
  );
}
