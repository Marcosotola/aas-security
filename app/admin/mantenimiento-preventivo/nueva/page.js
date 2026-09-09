'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Save } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../lib/firebase';
import { crearMantenimientoPreventivo, generarIdMantenimientoPreventivo, obtenerClientes, obtenerPlantillas } from '../../../lib/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';
import MantenimientoPreventivoPDF from '../../../components/pdf/MantenimientoPreventivoPDF';
import ClienteSelector from '../../../components/ClienteSelector';
import CompartirDocumentoModal from '../../../components/ui/CompartirDocumentoModal';
import FotosUploader from '../../../components/ui/FotosUploader';
import FirmaCanvas from '../../../components/ui/FirmaCanvas';
import PlanillasAdjuntas from '../../../components/planillas/PlanillasAdjuntas';
import { fechaHoyLocal } from '../../../lib/fecha';
import { archivoABase64 } from '../../../lib/imagenes';

export default function NuevoMantenimientoPreventivo() {
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

  const [mantenimiento, setMantenimiento] = useState({
    numero: `MP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
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

  const handleGuardarMantenimiento = async () => {
    if (!mantenimiento.descripcionTrabajo.trim()) {
      alert('Por favor, describa el trabajo realizado.');
      return;
    }

    setGuardando(true);
    try {
      const id = generarIdMantenimientoPreventivo();

      const fotosSubidas = await Promise.all(
        fotos.map(async (foto, index) => {
          const path = `mantenimiento-preventivo/${id}/${Date.now()}-${index}-${foto.file.name}`;
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

      const mpData = {
        numero: mantenimiento.numero,
        fecha: mantenimiento.fecha,
        clienteId: mantenimiento.clienteId || null,
        cliente,
        descripcionTrabajo: mantenimiento.descripcionTrabajo,
        fotos: fotosSubidas,
        planillasAdjuntas,
        firmaTecnico: mantenimiento.firmaTecnico,
        aclaracionFirmaTecnico: mantenimiento.aclaracionFirmaTecnico,
        firmaCliente: mantenimiento.firmaCliente,
        aclaracionFirmaCliente: mantenimiento.aclaracionFirmaCliente,
        observaciones: mantenimiento.observaciones,
        usuarioCreador: user.email
      };

      await crearMantenimientoPreventivo(id, mpData);
      setDocumentoGuardado({
        pdfElement: <MantenimientoPreventivoPDF mantenimiento={{ ...mpData, fotos: fotosBase64 }} />,
        fileName: `${mpData.numero}.pdf`,
        numero: mpData.numero,
        telefono: cliente.telefono
      });
    } catch (error) {
      console.error('Error al guardar el mantenimiento preventivo:', error);
      alert('Error al guardar el mantenimiento preventivo. Inténtelo de nuevo más tarde.');
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
            <Link href="/admin/mantenimiento-preventivo" className="flex items-center mr-4 text-primary hover:underline">
              Mantenimiento Preventivo
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Nuevo</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <button
              onClick={handleGuardarMantenimiento}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Nuevo Mantenimiento Preventivo
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {/* Información del mantenimiento */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Mantenimiento</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Número</label>
                <input
                  type="text"
                  value={mantenimiento.numero}
                  onChange={(e) => setMantenimiento({ ...mantenimiento, numero: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={mantenimiento.fecha}
                  onChange={(e) => setMantenimiento({ ...mantenimiento, fecha: e.target.value })}
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
                setMantenimiento({ ...mantenimiento, clienteId });
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
              value={mantenimiento.descripcionTrabajo}
              onChange={(e) => setMantenimiento({ ...mantenimiento, descripcionTrabajo: e.target.value })}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Detalle el trabajo realizado..."
            />
          </div>

          {/* Firma del técnico */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <FirmaCanvas
              titulo="Firma del Técnico"
              firma={mantenimiento.firmaTecnico}
              aclaracion={mantenimiento.aclaracionFirmaTecnico}
              onGuardar={(firma) => setMantenimiento({ ...mantenimiento, firmaTecnico: firma })}
              onAclaracionChange={(aclaracion) => setMantenimiento({ ...mantenimiento, aclaracionFirmaTecnico: aclaracion })}
            />
          </div>

          {/* Firma de conformidad del cliente */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <FirmaCanvas
              titulo="Conformidad del Cliente"
              firma={mantenimiento.firmaCliente}
              aclaracion={mantenimiento.aclaracionFirmaCliente}
              onGuardar={(firma) => setMantenimiento({ ...mantenimiento, firmaCliente: firma })}
              onAclaracionChange={(aclaracion) => setMantenimiento({ ...mantenimiento, aclaracionFirmaCliente: aclaracion })}
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
              value={mantenimiento.observaciones}
              onChange={(e) => setMantenimiento({ ...mantenimiento, observaciones: e.target.value })}
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Observaciones adicionales..."
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => router.push('/admin/mantenimiento-preventivo')}
              className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardarMantenimiento}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar Mantenimiento Preventivo'}
            </button>
          </div>
        </div>
      </div>

      {documentoGuardado && (
        <CompartirDocumentoModal
          abierto
          pdfElement={documentoGuardado.pdfElement}
          fileName={documentoGuardado.fileName}
          tipo="Mantenimiento Preventivo"
          numero={documentoGuardado.numero}
          telefono={documentoGuardado.telefono}
          onIrALista={() => router.push('/admin/mantenimiento-preventivo')}
        />
      )}
    </div>
  );
}
