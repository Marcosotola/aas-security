// app/components/certificaciones/CertificacionForm.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Save, X, Eye, Search, Link2, Images, Plus, AlertTriangle } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import {
  obtenerEmpresas,
  obtenerCertificadores,
  obtenerTextosCertificacion,
  obtenerOrdenesTrabajo,
  obtenerMantenimientosPreventivos,
  obtenerProximoNumeroCertificacion,
  generarIdCertificacion,
  crearCertificacion,
  actualizarCertificacion,
  eliminarFotosStorage,
  fotosPropiasCertificacion
} from '../../lib/firestore';
import { comprimirParaSubir, archivoABase64 } from '../../lib/imagenes';
import { fechaHoyLocal, formatearFecha } from '../../lib/fecha';
import { textoPlanoAHtml } from '../../lib/richText';
import EmpresaSelector from '../EmpresaSelector';
import FotosUploader from '../ui/FotosUploader';
import FirmaCanvas from '../ui/FirmaCanvas';
import RichTextEditor from '../ui/RichTextEditor';
import { generarBlobCertificacion } from '../pdf/DescargarCertificacionPDF';

export const RUBROS = ['Edificio de oficinas', 'Viviendas residenciales', 'Comercio', 'Industrial', 'Hotel / Apart-hotel', 'Educación', 'Salud', 'Depósito / Logística'];

const sumarUnAnio = (fecha) => {
  const [y, m, d] = (fecha || '').split('-').map(Number);
  if (!y || !m || !d) return '';
  return `${y + 1}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

// Copia de la OT / mantenimiento que queda guardada en la certificación
// (sin los timestamps de Firestore, que no hacen falta para el PDF).
const snapshotVinculado = (tipo, d) => {
  const { fechaCreacion, fechaActualizacion, ...datos } = d;
  return { tipo, id: d.id, numero: d.numero || '', fecha: d.fecha || '', datos };
};

const ETIQUETA_TIPO = { orden: 'OT', mantenimiento: 'Mant. prev.' };

const campo = 'w-full px-3 py-2 border border-gray-300 rounded-md';
const etiqueta = 'block mb-1 text-sm font-medium text-gray-700';
const tarjeta = 'p-6 bg-white rounded-lg shadow-md';

export default function CertificacionForm({ id = null, inicial = null, user, onGuardado }) {
  const esNueva = !id;
  const [guardando, setGuardando] = useState(false);
  const [generandoVista, setGenerandoVista] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [certificadores, setCertificadores] = useState(null);
  const [textos, setTextos] = useState([]);
  const [inspecciones, setInspecciones] = useState([]);
  const [busquedaInsp, setBusquedaInsp] = useState('');
  const [proximoNumero, setProximoNumero] = useState(null);

  const rubroInicial = inicial?.rubro || '';
  const [datos, setDatos] = useState(() => ({
    numero: inicial?.numeroSecuencia ? String(inicial.numeroSecuencia) : '',
    fechaInspeccion: inicial?.fechaInspeccion || fechaHoyLocal(),
    fechaVencimiento: inicial?.fechaVencimiento ?? sumarUnAnio(fechaHoyLocal()),
    rubro: !rubroInicial || RUBROS.includes(rubroInicial) ? rubroInicial : 'Otro',
    rubroOtro: rubroInicial && !RUBROS.includes(rubroInicial) ? rubroInicial : '',
    revPlanos: inicial?.revPlanos || '',
    expediente: inicial?.expediente || '',
    sistemaCertificado: inicial?.sistemaCertificado || '',
    empresaId: inicial?.empresaId || null,
    sedeId: inicial?.sedeId || null,
    memoria: inicial?.memoria || '',
    certificadorId: inicial?.certificador?.id || '',
    incluirCredencial: inicial ? Boolean(inicial.certificador?.credencial) : true,
    firmaResponsable: inicial?.firmaResponsable || null,
    aclaracionResponsable: inicial?.aclaracionResponsable || ''
  }));
  const [cliente, setCliente] = useState(() => ({
    nombre: '', razonSocial: '', cuit: '', direccion: '', sedeNombre: '', email: '', telefono: '',
    ...(inicial?.cliente || {})
  }));
  const [vinculados, setVinculados] = useState(inicial?.vinculados || []);
  const [fotosActuales, setFotosActuales] = useState(inicial?.fotos || []);
  const [fotosAEliminar, setFotosAEliminar] = useState([]);
  const [fotosNuevas, setFotosNuevas] = useState([]);

  const set = (cambios) => setDatos((d) => ({ ...d, ...cambios }));
  const setCli = (cambios) => setCliente((c) => ({ ...c, ...cambios }));

  useEffect(() => {
    if (!user) return;
    obtenerEmpresas().then(setEmpresas).catch((e) => console.error('Error al cargar las empresas:', e));
    obtenerTextosCertificacion().then(setTextos).catch((e) => console.error('Error al cargar los textos estándar:', e));
    obtenerCertificadores()
      .then((lista) => {
        setCertificadores(lista);
        // Con un solo certificador cargado (lo habitual) se elige solo.
        if (lista.length === 1) setDatos((d) => (d.certificadorId ? d : { ...d, certificadorId: lista[0].id }));
      })
      .catch((e) => {
        console.error('Error al cargar los certificadores:', e);
        setCertificadores([]);
      });
    // Sin acceso a OT o a mantenimientos, simplemente no se listan.
    Promise.all([
      obtenerOrdenesTrabajo().then((l) => l.map((d) => ({ ...d, tipo: 'orden' }))).catch(() => []),
      obtenerMantenimientosPreventivos().then((l) => l.map((d) => ({ ...d, tipo: 'mantenimiento' }))).catch(() => [])
    ]).then(([ots, mps]) => setInspecciones([...ots, ...mps]));
    if (esNueva) {
      obtenerProximoNumeroCertificacion()
        .then((n) => {
          setProximoNumero(n);
          setDatos((d) => (d.numero ? d : { ...d, numero: String(n) }));
        })
        .catch((e) => console.error('Error al leer la numeración:', e));
    }
  }, [user, esNueva]);

  const certificador = certificadores?.find((c) => c.id === datos.certificadorId) || null;
  const rubroFinal = datos.rubro === 'Otro' ? datos.rubroOtro.trim() : datos.rubro;

  // Inspecciones para vincular: con empresa elegida y sin búsqueda, las de
  // esa empresa; con búsqueda, por número, cliente o empresa.
  const inspeccionesFiltradas = useMemo(() => {
    const yaVinculadas = new Set(vinculados.map((v) => `${v.tipo}-${v.id}`));
    const q = busquedaInsp.trim().toLowerCase();
    return inspecciones
      .filter((d) => !yaVinculadas.has(`${d.tipo}-${d.id}`))
      .filter((d) => {
        if (!q) return datos.empresaId && d.empresaId === datos.empresaId;
        return [d.numero, d.cliente?.nombre, d.cliente?.empresa, d.cliente?.sedeNombre].some((t) => t?.toLowerCase().includes(q));
      })
      .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
      .slice(0, 8);
  }, [inspecciones, vinculados, busquedaInsp, datos.empresaId]);

  const vincular = (d) => {
    const nuevo = snapshotVinculado(d.tipo, d);
    setVinculados((vs) => [...vs, nuevo]);
    setBusquedaInsp('');
    // Igual que ARIFA: con la primera inspección se completa lo que falte.
    if (vinculados.length === 0) {
      const cambios = {};
      if (!datos.memoria) {
        const nombre = d.tipo === 'mantenimiento' ? 'Mantenimiento Preventivo' : 'Orden de Trabajo';
        cambios.memoria = `<p>Inspección realizada en base a ${nombre} N° ${d.numero}.</p>`;
      }
      if (!datos.sistemaCertificado && d.planillasAdjuntas?.length) {
        cambios.sistemaCertificado = d.planillasAdjuntas.map((p) => p.titulo).filter(Boolean).join(', ');
      }
      if (d.fecha && esNueva) {
        cambios.fechaInspeccion = d.fecha;
        cambios.fechaVencimiento = sumarUnAnio(d.fecha);
      }
      if (!datos.empresaId && d.empresaId) {
        cambios.empresaId = d.empresaId;
        cambios.sedeId = d.sedeId || null;
        const empresa = empresas.find((e) => e.id === d.empresaId);
        setCli({
          nombre: d.cliente?.empresa || empresa?.nombre || '',
          razonSocial: empresa?.razonSocial || '',
          cuit: empresa?.cuit || '',
          direccion: d.cliente?.direccion || '',
          sedeNombre: d.cliente?.sedeNombre || ''
        });
      }
      set(cambios);
    }
  };

  const desvincular = (v) => setVinculados((vs) => vs.filter((x) => !(x.tipo === v.tipo && x.id === v.id)));

  const usarFotosDe = (v) => {
    const urls = new Set(fotosActuales.map((f) => f.url));
    const nuevas = (v.datos.fotos || []).filter((f) => !urls.has(f.url));
    if (nuevas.length === 0) {
      alert('Esa inspección no tiene fotos nuevas para agregar.');
      return;
    }
    setFotosActuales((fs) => [...fs, ...nuevas]);
  };

  const quitarFotoActual = (foto) => {
    setFotosActuales((fs) => fs.filter((f) => f.url !== foto.url));
    setFotosAEliminar((fs) => [...fs, foto]);
  };

  const insertarTexto = (t) => {
    set({ memoria: (datos.memoria || '') + textoPlanoAHtml(t.contenido) });
  };

  const armarDatos = (fotos) => ({
    fechaInspeccion: datos.fechaInspeccion,
    fechaVencimiento: datos.fechaVencimiento,
    rubro: rubroFinal,
    revPlanos: datos.revPlanos.trim(),
    expediente: datos.expediente.trim(),
    sistemaCertificado: datos.sistemaCertificado.trim(),
    empresaId: datos.empresaId || null,
    sedeId: datos.empresaId ? datos.sedeId || null : null,
    cliente,
    memoria: datos.memoria,
    fotos,
    vinculados,
    certificador: certificador ? {
      id: certificador.id,
      nombre: certificador.nombre || '',
      titulo: certificador.titulo || '',
      matricula: certificador.matricula || '',
      firmaSello: certificador.firmaSello?.url || null,
      credencial: datos.incluirCredencial ? certificador.credencial?.url || null : null
    } : null,
    firmaResponsable: datos.firmaResponsable,
    aclaracionResponsable: datos.aclaracionResponsable
  });

  const validar = () => {
    if (!datos.sistemaCertificado.trim()) return 'Completá el "Sistema certificado" (es el título del certificado).';
    if (!cliente.nombre.trim()) return 'Elegí una empresa o completá el nombre del cliente.';
    if (!certificador) return 'Elegí el profesional certificador.';
    const n = parseInt(datos.numero, 10);
    if (!n || n < 1) return 'El número de certificado tiene que ser un número mayor a 0.';
    return null;
  };

  const handleVistaPrevia = async () => {
    setGenerandoVista(true);
    try {
      const nuevas = await Promise.all(fotosNuevas.map(async (f, i) => ({ url: await archivoABase64(f.file), path: `nueva-${i}` })));
      const blob = await generarBlobCertificacion({
        ...armarDatos([...fotosActuales, ...nuevas]),
        numero: String(parseInt(datos.numero, 10) || '').padStart(4, '0')
      });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('Error al generar la vista previa:', error);
      alert('No se pudo generar la vista previa.');
    } finally {
      setGenerandoVista(false);
    }
  };

  const handleGuardar = async () => {
    const error = validar();
    if (error) {
      alert(error);
      return;
    }
    if (!certificador.firmaSello?.url && !confirm('El certificador no tiene cargada la imagen de firma y sello, así que el certificado va a salir sin firma. ¿Guardar igual?')) {
      return;
    }

    setGuardando(true);
    try {
      const docId = id || generarIdCertificacion();
      const fotosSubidas = await Promise.all(fotosNuevas.map(async (foto, index) => {
        const archivo = await comprimirParaSubir(foto.file);
        const path = `certificaciones/${docId}/${Date.now()}-${index}-${archivo.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, archivo);
        return { url: await getDownloadURL(storageRef), path };
      }));
      await eliminarFotosStorage(fotosPropiasCertificacion(fotosAEliminar));

      // Las inspecciones vinculadas se vuelven a copiar al guardar, por si
      // la OT se corrigió después de vincularla.
      const actualizadas = vinculados.map((v) => {
        const viva = inspecciones.find((d) => d.tipo === v.tipo && d.id === v.id);
        return viva ? snapshotVinculado(v.tipo, viva) : v;
      });
      const payload = { ...armarDatos([...fotosActuales, ...fotosSubidas]), vinculados: actualizadas };
      const numero = parseInt(datos.numero, 10);

      if (esNueva) {
        await crearCertificacion(docId, { ...payload, usuarioCreador: user.email }, numero === proximoNumero ? null : numero);
      } else {
        await actualizarCertificacion(docId, payload, numero !== inicial.numeroSecuencia ? numero : null);
      }
      onGuardado(docId);
    } catch (e) {
      console.error('Error al guardar la certificación:', e);
      alert('Error al guardar la certificación. Inténtelo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const botonGuardar = (
    <button
      onClick={handleGuardar}
      disabled={guardando}
      className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
    >
      <Save size={18} className="mr-2" />
      {guardando ? 'Guardando...' : esNueva ? 'Emitir certificado' : 'Guardar cambios'}
    </button>
  );

  const botonVista = (
    <button
      type="button"
      onClick={handleVistaPrevia}
      disabled={generandoVista}
      className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
    >
      <Eye size={18} className="mr-2" />
      {generandoVista ? 'Generando...' : 'Vista previa'}
    </button>
  );

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-wrap justify-end gap-2">
        {botonVista}
        {botonGuardar}
      </div>

      {/* Datos del certificado */}
      <div className={tarjeta}>
        <h3 className="mb-4 text-lg font-semibold text-gray-700">Datos del certificado</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={etiqueta}>Sistema certificado (título)</label>
            <input
              type="text"
              value={datos.sistemaCertificado}
              onChange={(e) => set({ sistemaCertificado: e.target.value })}
              className={campo}
              placeholder="Ej: Sistema de detección y alarma — Central, detectores, pulsadores y sirenas"
            />
          </div>
          <div>
            <label className={etiqueta}>N° de certificado</label>
            <input
              type="number"
              min="1"
              value={datos.numero}
              onChange={(e) => set({ numero: e.target.value })}
              className={campo}
            />
            {esNueva && proximoNumero && parseInt(datos.numero, 10) !== proximoNumero && (
              <p className="mt-1 text-xs text-amber-600">El próximo número libre es {proximoNumero}.</p>
            )}
          </div>
          <div>
            <label className={etiqueta}>Rubro</label>
            <select value={datos.rubro} onChange={(e) => set({ rubro: e.target.value })} className={campo}>
              <option value="">Seleccionar...</option>
              {RUBROS.map((r) => <option key={r} value={r}>{r}</option>)}
              <option value="Otro">Otro...</option>
            </select>
            {datos.rubro === 'Otro' && (
              <input
                type="text"
                value={datos.rubroOtro}
                onChange={(e) => set({ rubroOtro: e.target.value })}
                className={`${campo} mt-2`}
                placeholder="Ej: Estacionamiento"
              />
            )}
          </div>
          <div>
            <label className={etiqueta}>Fecha de inspección</label>
            <input
              type="date"
              value={datos.fechaInspeccion}
              onChange={(e) => {
                const nueva = e.target.value;
                // El vencimiento acompaña si seguía en el año por defecto.
                const acompania = !datos.fechaVencimiento || datos.fechaVencimiento === sumarUnAnio(datos.fechaInspeccion);
                set({ fechaInspeccion: nueva, ...(acompania ? { fechaVencimiento: sumarUnAnio(nueva) } : {}) });
              }}
              className={campo}
            />
          </div>
          <div>
            <label className={etiqueta}>Fecha de vencimiento</label>
            <input
              type="date"
              value={datos.fechaVencimiento}
              onChange={(e) => set({ fechaVencimiento: e.target.value })}
              className={campo}
            />
          </div>
          <div>
            <label className={etiqueta}>Rev. planos</label>
            <input
              type="text"
              value={datos.revPlanos}
              onChange={(e) => set({ revPlanos: e.target.value })}
              className={campo}
              placeholder="Opcional"
            />
          </div>
          <div>
            <label className={etiqueta}>N° de expediente</label>
            <input
              type="text"
              value={datos.expediente}
              onChange={(e) => set({ expediente: e.target.value })}
              className={campo}
              placeholder="Opcional (Bomberos)"
            />
          </div>
          <div className="md:col-span-2">
            <label className={etiqueta}>Profesional certificador</label>
            {certificadores && certificadores.length === 0 ? (
              <p className="flex items-start gap-2 p-3 text-sm rounded-md text-amber-800 bg-amber-50">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>
                  Todavía no hay ningún certificador cargado. Cargalo en{' '}
                  <Link href="/admin/certificaciones?tab=certificador" className="font-medium underline">Certificaciones → Certificador</Link>{' '}
                  (nombre, título, matrícula y la imagen de firma y sello).
                </span>
              </p>
            ) : (
              <>
                <select value={datos.certificadorId} onChange={(e) => set({ certificadorId: e.target.value })} className={campo}>
                  <option value="">Seleccionar...</option>
                  {(certificadores || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {[c.titulo, c.nombre].filter(Boolean).join(' ')}{c.matricula ? ` - MP ${c.matricula}` : ''}
                    </option>
                  ))}
                </select>
                {certificador && (
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                    {certificador.firmaSello?.url ? (
                      <img src={certificador.firmaSello.url} alt="Firma y sello" className="object-contain h-12 p-1 bg-white border border-gray-200 rounded" />
                    ) : (
                      <span className="text-amber-600">Sin imagen de firma y sello cargada.</span>
                    )}
                    {certificador.credencial?.url && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={datos.incluirCredencial}
                          onChange={(e) => set({ incluirCredencial: e.target.checked })}
                          className="w-4 h-4 accent-[var(--primary)]"
                        />
                        Adjuntar su credencial al final del PDF
                      </label>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cliente / inmueble */}
      <div className={tarjeta}>
        <h3 className="mb-4 text-lg font-semibold text-gray-700">Cliente / Inmueble</h3>
        <EmpresaSelector
          empresas={empresas}
          empresaId={datos.empresaId}
          sedeId={datos.sedeId}
          onSelect={({ empresaId, sedeId, empresa, email, telefono, direccion, sedeNombre }) => {
            const e = empresas.find((x) => x.id === empresaId);
            set({ empresaId, sedeId });
            setCli({ nombre: empresa, razonSocial: e?.razonSocial || '', cuit: e?.cuit || '', email, telefono, direccion, sedeNombre });
          }}
          onQuitar={() => set({ empresaId: null, sedeId: null })}
          placeholder="Buscar empresa registrada..."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={etiqueta}>Cliente</label>
            <input type="text" value={cliente.nombre} onChange={(e) => setCli({ nombre: e.target.value })} className={campo} />
          </div>
          <div>
            <label className={etiqueta}>Sede</label>
            <input type="text" value={cliente.sedeNombre} onChange={(e) => setCli({ sedeNombre: e.target.value })} className={campo} placeholder="Ej: Edificio Torre Norte" />
          </div>
          <div>
            <label className={etiqueta}>Razón social</label>
            <input type="text" value={cliente.razonSocial} onChange={(e) => setCli({ razonSocial: e.target.value })} className={campo} />
          </div>
          <div>
            <label className={etiqueta}>CUIT</label>
            <input type="text" value={cliente.cuit} onChange={(e) => setCli({ cuit: e.target.value })} className={campo} placeholder="Ej: 30-12345678-9" />
          </div>
          <div className="md:col-span-2">
            <label className={etiqueta}>Domicilio</label>
            <input type="text" value={cliente.direccion} onChange={(e) => setCli({ direccion: e.target.value })} className={campo} />
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          La razón social y el CUIT se toman de la ficha de la empresa; si el certificado va a Bomberos y no están cargados, completalos acá.
        </p>
      </div>

      {/* Inspecciones vinculadas */}
      <div className={tarjeta}>
        <h3 className="mb-1 text-lg font-semibold text-gray-700">Inspecciones vinculadas</h3>
        <p className="mb-4 text-sm text-gray-500">
          Las órdenes de trabajo o mantenimientos que elijas se agregan al final del PDF, con sus planillas, fotos y firmas.
        </p>
        <div className="relative mb-3">
          <Search size={16} className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            value={busquedaInsp}
            onChange={(e) => setBusquedaInsp(e.target.value)}
            className={`${campo} pl-9`}
            placeholder="Buscar OT o mantenimiento por número, cliente o empresa..."
          />
        </div>
        {inspeccionesFiltradas.length > 0 && (
          <ul className="mb-4 overflow-hidden border border-gray-200 divide-y divide-gray-100 rounded-md">
            {!busquedaInsp && <li className="px-3 py-1.5 text-xs text-gray-400 bg-gray-50">De esta empresa</li>}
            {inspeccionesFiltradas.map((d) => (
              <li key={`${d.tipo}-${d.id}`}>
                <button type="button" onClick={() => vincular(d)} className="flex items-center w-full gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50">
                  <Plus size={16} className="text-primary shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="font-medium text-gray-800">{ETIQUETA_TIPO[d.tipo]} {d.numero}</span>
                    <span className="text-gray-500"> · {d.cliente?.empresa || d.cliente?.nombre || '-'}{d.cliente?.sedeNombre ? ` · ${d.cliente.sedeNombre}` : ''}</span>
                    <span className="block text-xs text-gray-400">
                      {formatearFecha(d.fecha)}
                      {d.planillasAdjuntas?.length ? ` · ${d.planillasAdjuntas.map((p) => p.titulo).join(', ')}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {vinculados.length === 0 ? (
          <p className="p-4 text-sm text-center text-gray-400 border border-gray-200 border-dashed rounded-md">Sin inspecciones vinculadas.</p>
        ) : (
          <ul className="space-y-2">
            {vinculados.map((v) => (
              <li key={`${v.tipo}-${v.id}`} className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm border rounded-md border-primary/30 bg-primary/5">
                <Link2 size={16} className="text-primary shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="font-medium text-gray-800">{ETIQUETA_TIPO[v.tipo]} {v.numero}</span>
                  <span className="text-gray-500"> · {formatearFecha(v.fecha)}</span>
                  {v.datos?.planillasAdjuntas?.length ? (
                    <span className="block text-xs text-gray-500">{v.datos.planillasAdjuntas.map((p) => p.titulo).join(', ')}</span>
                  ) : null}
                </span>
                {v.datos?.fotos?.length > 0 && (
                  <button type="button" onClick={() => usarFotosDe(v)} className="flex items-center gap-1 px-2 py-1 text-xs rounded text-primary hover:bg-primary/10">
                    <Images size={14} /> Usar sus fotos ({v.datos.fotos.length})
                  </button>
                )}
                <button type="button" onClick={() => desvincular(v)} title="Quitar" className="p-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-700">
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Memoria descriptiva */}
      <div className={tarjeta}>
        <h3 className="mb-1 text-lg font-semibold text-gray-700">Memoria descriptiva</h3>
        <p className="mb-3 text-sm text-gray-500">
          Describí lo que se inspeccionó y probó. Los textos estándar se agregan al final con un toque y después se pueden editar.
        </p>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {textos.length === 0 ? (
            <span className="text-xs text-gray-400">
              No hay textos estándar cargados (se cargan en <Link href="/admin/certificaciones?tab=textos" className="underline">Certificaciones → Textos estándar</Link>).
            </span>
          ) : (
            <>
              <span className="text-xs font-medium text-gray-500">Insertar texto estándar:</span>
              {textos.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => insertarTexto(t)}
                  className="px-3 py-1 text-xs font-medium border rounded-full border-primary/30 text-primary hover:bg-primary/10"
                >
                  + {t.titulo}
                </button>
              ))}
            </>
          )}
        </div>
        <RichTextEditor
          value={datos.memoria}
          onChange={(html) => set({ memoria: html })}
          placeholder="Se certifica que el Sistema de Detección y Alarma de Incendios fue sometido a tareas de inspección, prueba y verificación funcional..."
          minHeight="280px"
        />
      </div>

      {/* Fotos */}
      <div className={tarjeta}>
        <h3 className="mb-4 text-lg font-semibold text-gray-700">Registro fotográfico</h3>
        {fotosActuales.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-sm text-gray-500">Fotos del certificado</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {fotosActuales.map((foto) => (
                <div key={foto.url} className="relative overflow-hidden border border-gray-200 rounded-md aspect-square">
                  <img src={foto.url} alt="Foto" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => quitarFotoActual(foto)}
                    title="Quitar foto"
                    className="absolute flex items-center justify-center w-6 h-6 text-white transition-colors rounded-full bg-black/60 top-1 right-1 hover:bg-red-600"
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

      {/* Firma del responsable */}
      <div className={tarjeta}>
        <FirmaCanvas
          titulo="Firma del Propietario / Responsable del Inmueble (opcional)"
          firma={datos.firmaResponsable}
          aclaracion={datos.aclaracionResponsable}
          onGuardar={(firma) => set({ firmaResponsable: firma })}
          onAclaracionChange={(aclaracion) => set({ aclaracionResponsable: aclaracion })}
        />
        <p className="mt-2 text-xs text-gray-500">La firma del profesional sale sola en el PDF con la imagen de firma y sello del certificador.</p>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        {botonVista}
        {botonGuardar}
      </div>
    </div>
  );
}
