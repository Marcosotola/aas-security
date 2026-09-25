'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Save, X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../lib/firebase';
import {
  obtenerMantenimientoPreventivoPorId,
  actualizarMantenimientoPreventivo,
  eliminarFotosStorage,
  obtenerEmpresas,
  obtenerPlantillas
} from '../../../../lib/firestore';
import { useStaffAuth } from '../../../../lib/useStaffAuth';
import EmpresaSelector from '../../../../components/EmpresaSelector';
import FotosUploader from '../../../../components/ui/FotosUploader';
import FirmaCanvas from '../../../../components/ui/FirmaCanvas';
import RichTextEditor from '../../../../components/ui/RichTextEditor';
import PlanillasAdjuntas from '../../../../components/planillas/PlanillasAdjuntas';

export default function EditarMantenimientoPreventivo({ params }) {
  const { id } = use(params);

  const router = useRouter();
  const { user, loading: loadingAuth } = useStaffAuth({ modulo: 'mantenimiento', accion: 'crear' });
  const [loadingData, setLoadingData] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [empresas, setEmpresas] = useState([]);
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

  const [mantenimiento, setMantenimiento] = useState({
    numero: '',
    fecha: '',
    clienteId: null,
    empresaId: null,
    sedeId: null,
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
        const mpData = await obtenerMantenimientoPreventivoPorId(id);

        setMantenimiento({
          numero: mpData.numero || '',
          fecha: mpData.fecha || '',
          clienteId: mpData.clienteId || null,
          empresaId: mpData.empresaId || null,
          sedeId: mpData.sedeId || null,
          descripcionTrabajo: mpData.descripcionTrabajo || '',
          observaciones: mpData.observaciones || '',
          firmaTecnico: mpData.firmaTecnico || null,
          aclaracionFirmaTecnico: mpData.aclaracionFirmaTecnico || '',
          firmaCliente: mpData.firmaCliente || null,
          aclaracionFirmaCliente: mpData.aclaracionFirmaCliente || ''
        });
        setCliente({ sedeId: null, sedeNombre: '', ...mpData.cliente });
        setFotosActuales(mpData.fotos || []);
        setPlanillasAdjuntas(mpData.planillasAdjuntas || []);

        try {
          setEmpresas(await obtenerEmpresas());
        } catch (error) {
          console.error('Error al cargar las empresas:', error);
        }
        try {
          setPlantillasDisponibles(await obtenerPlantillas());
        } catch (error) {
          console.error('Error al cargar las plantillas:', error);
        }

        setLoadingData(false);
      } catch (error) {
        console.error('Error al cargar el mantenimiento preventivo:', error);
        alert(
          error.code === 'permission-denied'
            ? 'No tenés permiso para editar este mantenimiento preventivo (no fue creado por vos).'
            : 'Error al cargar los datos del mantenimiento preventivo.'
        );
        router.push('/admin/mantenimiento-preventivo');
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
    if (!mantenimiento.descripcionTrabajo.trim()) {
      alert('Por favor, describa el trabajo realizado.');
      return;
    }

    setGuardando(true);
    try {
      const fotosSubidas = await Promise.all(
        fotosNuevas.map(async (foto, index) => {
          const path = `mantenimiento-preventivo/${id}/${Date.now()}-${index}-${foto.file.name}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, foto.file);
          const url = await getDownloadURL(storageRef);
          return { url, path };
        })
      );

      await eliminarFotosStorage(fotosAEliminar);

      const mpData = {
        numero: mantenimiento.numero,
        fecha: mantenimiento.fecha,
        clienteId: mantenimiento.clienteId || null,
        empresaId: mantenimiento.empresaId || null,
        sedeId: mantenimiento.empresaId ? mantenimiento.sedeId || null : null,
        cliente,
        descripcionTrabajo: mantenimiento.descripcionTrabajo,
        fotos: [...fotosActuales, ...fotosSubidas],
        planillasAdjuntas,
        firmaTecnico: mantenimiento.firmaTecnico,
        aclaracionFirmaTecnico: mantenimiento.aclaracionFirmaTecnico,
        firmaCliente: mantenimiento.firmaCliente,
        aclaracionFirmaCliente: mantenimiento.aclaracionFirmaCliente,
        observaciones: mantenimiento.observaciones
      };

      await actualizarMantenimientoPreventivo(id, mpData);
      alert('Mantenimiento preventivo actualizado exitosamente.');
      router.push(`/admin/mantenimiento-preventivo/${id}`);
    } catch (error) {
      console.error('Error al actualizar el mantenimiento preventivo:', error);
      alert('Error al actualizar el mantenimiento preventivo. Inténtelo de nuevo más tarde.');
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
          Editar Mantenimiento Preventivo {mantenimiento.numero}
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
                />
              </div>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Cliente</h3>
            <EmpresaSelector
              empresas={empresas}
              empresaId={mantenimiento.empresaId}
              sedeId={mantenimiento.sedeId}
              onSelect={({ empresaId, sedeId, empresa, email, telefono, direccion, sedeNombre }) => {
                setMantenimiento({ ...mantenimiento, clienteId: null, empresaId, sedeId });
                setCliente({ ...cliente, empresa, email, telefono, direccion, sedeId, sedeNombre });
              }}
              onQuitar={() => setMantenimiento({ ...mantenimiento, clienteId: null, empresaId: null, sedeId: null })}
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

          {/* Descripción del trabajo */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Descripción del Trabajo Realizado</h3>
            <RichTextEditor
              value={mantenimiento.descripcionTrabajo}
              onChange={(html) => setMantenimiento({ ...mantenimiento, descripcionTrabajo: html })}
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
              onClick={() => router.push(`/admin/mantenimiento-preventivo/${id}`)}
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
