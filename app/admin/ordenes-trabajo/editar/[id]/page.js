'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Save, X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../lib/firebase';
import {
  obtenerOrdenTrabajoPorId,
  actualizarOrdenTrabajo,
  eliminarFotosStorage,
  obtenerClientes,
  obtenerPlantillas
} from '../../../../lib/firestore';
import { useStaffAuth } from '../../../../lib/useStaffAuth';
import ClienteSelector from '../../../../components/ClienteSelector';
import FotosUploader from '../../../../components/ui/FotosUploader';
import FirmaCanvas from '../../../../components/ui/FirmaCanvas';
import PlanillasAdjuntas from '../../../../components/planillas/PlanillasAdjuntas';

export default function EditarOrdenTrabajo({ params }) {
  const { id } = use(params);

  const router = useRouter();
  const { user, loading: loadingAuth } = useStaffAuth(['Admin', 'Tecnico']);
  const [loadingData, setLoadingData] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [plantillasDisponibles, setPlantillasDisponibles] = useState([]);
  const [planillasAdjuntas, setPlanillasAdjuntas] = useState([]);
  const loading = loadingAuth || loadingData;

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
    numero: '',
    fecha: '',
    clienteId: null,
    descripcionTrabajo: '',
    observaciones: '',
    firmaTecnico: null,
    aclaracionFirmaTecnico: '',
    firmaCliente: null,
    aclaracionFirmaCliente: ''
  });

  // Fotos ya subidas a Storage (vienen del documento original)
  const [fotosActuales, setFotosActuales] = useState([]);
  // Fotos que el usuario sacó del preview: se borran de Storage recién al guardar
  const [fotosAEliminar, setFotosAEliminar] = useState([]);
  // Fotos nuevas elegidas ahora, todavía no subidas a Storage
  const [fotosNuevas, setFotosNuevas] = useState([]);

  useEffect(() => {
    if (!id || !user) return;

    (async () => {
      try {
        const otData = await obtenerOrdenTrabajoPorId(id);

        setOrden({
          numero: otData.numero || '',
          fecha: otData.fecha || '',
          clienteId: otData.clienteId || null,
          descripcionTrabajo: otData.descripcionTrabajo || '',
          observaciones: otData.observaciones || '',
          firmaTecnico: otData.firmaTecnico || null,
          aclaracionFirmaTecnico: otData.aclaracionFirmaTecnico || '',
          firmaCliente: otData.firmaCliente || null,
          aclaracionFirmaCliente: otData.aclaracionFirmaCliente || ''
        });
        setCliente({ sedeId: null, sedeNombre: '', ...otData.cliente });
        setFotosActuales(otData.fotos || []);
        setPlanillasAdjuntas(otData.planillasAdjuntas || []);

        try {
          setClientes(await obtenerClientes());
        } catch (error) {
          console.error('Error al cargar los clientes:', error);
        }
        try {
          setPlantillasDisponibles(await obtenerPlantillas());
        } catch (error) {
          console.error('Error al cargar las plantillas:', error);
        }

        setLoadingData(false);
      } catch (error) {
        console.error('Error al cargar la orden de trabajo:', error);
        alert(
          error.code === 'permission-denied'
            ? 'No tenés permiso para editar esta orden de trabajo (no fue creada por vos).'
            : 'Error al cargar los datos de la orden de trabajo.'
        );
        router.push('/admin/ordenes-trabajo');
      }
    })();
  }, [id, user, router]);

  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    setCliente({ ...cliente, [name]: value });
  };

  const quitarFotoActual = (foto) => {
    setFotosActuales(fotosActuales.filter((f) => f.path !== foto.path));
    setFotosAEliminar([...fotosAEliminar, foto]);
  };

  const handleGuardarCambios = async () => {
    if (!orden.descripcionTrabajo.trim()) {
      alert('Por favor, describa el trabajo realizado.');
      return;
    }

    setGuardando(true);
    try {
      const fotosSubidas = await Promise.all(
        fotosNuevas.map(async (foto, index) => {
          const path = `ordenes-trabajo/${id}/${Date.now()}-${index}-${foto.file.name}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, foto.file);
          const url = await getDownloadURL(storageRef);
          return { url, path };
        })
      );

      await eliminarFotosStorage(fotosAEliminar);

      const otData = {
        numero: orden.numero,
        fecha: orden.fecha,
        clienteId: orden.clienteId || null,
        cliente,
        descripcionTrabajo: orden.descripcionTrabajo,
        fotos: [...fotosActuales, ...fotosSubidas],
        planillasAdjuntas,
        firmaTecnico: orden.firmaTecnico,
        aclaracionFirmaTecnico: orden.aclaracionFirmaTecnico,
        firmaCliente: orden.firmaCliente,
        aclaracionFirmaCliente: orden.aclaracionFirmaCliente,
        observaciones: orden.observaciones
      };

      await actualizarOrdenTrabajo(id, otData);
      alert('Orden de trabajo actualizada exitosamente.');
      router.push(`/admin/ordenes-trabajo/${id}`);
    } catch (error) {
      console.error('Error al actualizar la orden de trabajo:', error);
      alert('Error al actualizar la orden de trabajo. Inténtelo de nuevo más tarde.');
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
          Editar Orden de Trabajo {orden.numero}
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

            {fotosActuales.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm text-gray-500">Fotos actuales</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {fotosActuales.map((foto) => (
                    <div key={foto.path} className="relative overflow-hidden border border-gray-200 rounded-md aspect-square group">
                      <img src={foto.url} alt="Foto actual" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => quitarFotoActual(foto)}
                        title="Quitar foto"
                        className="absolute flex items-center justify-center w-6 h-6 text-white transition-colors bg-black/60 rounded-full top-1 right-1 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="mb-2 text-sm text-gray-500">Agregar fotos nuevas</p>
            <FotosUploader fotos={fotosNuevas} onChange={setFotosNuevas} />
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
              onClick={() => router.push(`/admin/ordenes-trabajo/${id}`)}
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
