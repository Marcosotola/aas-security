'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, FilePlus, Search, Eye, Edit, Trash, Download, ShieldCheck, FileText, UserCheck, Plus, Upload, X, Save } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import {
  obtenerCertificaciones,
  eliminarCertificacion,
  obtenerTextosCertificacion,
  crearTextoCertificacion,
  actualizarTextoCertificacion,
  eliminarTextoCertificacion,
  obtenerCertificadores,
  generarIdCertificador,
  guardarCertificador,
  eliminarCertificador,
  eliminarFotosStorage
} from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';
import { soloPropios } from '../../lib/permisos';
import { comprimirParaSubir } from '../../lib/imagenes';
import { formatearFecha } from '../../lib/fecha';
import SedeLink from '../../components/admin/SedeLink';
import { accionIconoClase, ACCION_ICONO_TAMANO } from '../../components/admin/accionIcono';
import DescargarCertificacionPDF from '../../components/pdf/DescargarCertificacionPDF';

const campo = 'w-full px-3 py-2 border border-gray-300 rounded-md';
const etiqueta = 'block mb-1 text-sm font-medium text-gray-700';

// Textos de ejemplo (los de la certificación de detección que hace ARIFA),
// para no arrancar con la lista vacía. Se editan o borran como cualquier otro.
const TEXTOS_EJEMPLO = [
  {
    titulo: 'Detección y alarma',
    contenido: 'Se certifica que el Sistema de Detección y Alarma de Incendios fue sometido a tareas de inspección, prueba y verificación funcional, efectuándose controles sobre la central de incendios, alimentación principal y secundaria, detectores automáticos, pulsadores manuales, dispositivos de notificación, señalización y funciones asociadas. Asimismo, se verificó la correcta operación de los componentes y su respuesta conforme a la lógica de funcionamiento prevista. Las tareas fueron ejecutadas siguiendo criterios de inspección y prueba establecidos en NFPA 72 y recomendaciones del fabricante. Se adjuntan las correspondientes planillas de inspección, prueba y control como respaldo de las verificaciones realizadas.'
  },
  {
    titulo: 'Resultado: sistema operativo',
    contenido: 'Como resultado de las pruebas y verificaciones efectuadas, se constata el correcto funcionamiento operativo del sistema, verificándose la respuesta de la central ante las señales de alarma y/o supervisión, así como la activación de los dispositivos asociados, conforme a las condiciones de operación previstas para la instalación.\n\nEl sistema queda operativo al momento de la presente certificación.'
  }
];

function Listado({ user, usuario, puede }) {
  const [items, setItems] = useState(null);
  const [filtro, setFiltro] = useState('');
  const soloLoPropio = soloPropios(usuario, 'certificacion');

  useEffect(() => {
    obtenerCertificaciones(soloLoPropio ? user.email : null)
      .then(setItems)
      .catch((error) => {
        console.error('Error al cargar las certificaciones:', error);
        setItems([]);
      });
  }, [user, soloLoPropio]);

  const handleEliminar = async (item) => {
    if (!confirm(`¿Eliminar el certificado N° ${item.numero}?`)) return;
    try {
      await eliminarCertificacion(item.id);
      setItems((xs) => xs.filter((x) => x.id !== item.id));
    } catch (error) {
      console.error('Error al eliminar la certificación:', error);
      alert('Error al eliminar la certificación.');
    }
  };

  if (!items) return <p className="py-6 text-sm text-center text-gray-400">Cargando...</p>;

  const q = filtro.trim().toLowerCase();
  const filtrados = items.filter((c) => !q || [c.numero, c.sistemaCertificado, c.cliente?.nombre, c.cliente?.sedeNombre, c.cliente?.razonSocial]
    .some((t) => t?.toLowerCase().includes(q)));

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {soloLoPropio && <p className="mb-3 text-sm text-gray-500">Mostrando solo las certificaciones que vos creaste.</p>}
      <div className="relative mb-6">
        <Search size={18} className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
        <input
          type="text"
          placeholder="Buscar por número, sistema, cliente o sede..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="py-6 text-sm text-center text-gray-400">{items.length === 0 ? 'Todavía no hay certificaciones.' : 'No hay resultados.'}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">N°</th>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Sistema certificado</th>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Cliente / Sede</th>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Inspección</th>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Vence</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtrados.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{c.numero}</td>
                  <td className="max-w-xs px-4 py-2 text-sm text-gray-700 truncate" title={c.sistemaCertificado}>{c.sistemaCertificado}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    <div>{c.cliente?.nombre || '-'}</div>
                    <SedeLink empresaId={c.empresaId} sedeId={c.sedeId} sede={c.cliente?.sedeNombre} />
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">{formatearFecha(c.fechaInspeccion)}</td>
                  <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">{formatearFecha(c.fechaVencimiento) || '-'}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/certificaciones/${c.id}`} title="Ver" className={accionIconoClase('gray')}>
                        <Eye size={ACCION_ICONO_TAMANO} />
                      </Link>
                      <DescargarCertificacionPDF certificacion={c} title="Descargar PDF" className={accionIconoClase('primary')}>
                        <Download size={ACCION_ICONO_TAMANO} />
                      </DescargarCertificacionPDF>
                      {puede('certificacion', 'gestionar', c) && (
                        <>
                          <Link href={`/admin/certificaciones/editar/${c.id}`} title="Editar" className={accionIconoClase('secondary')}>
                            <Edit size={ACCION_ICONO_TAMANO} />
                          </Link>
                          <button onClick={() => handleEliminar(c)} title="Eliminar" className={accionIconoClase('red')}>
                            <Trash size={ACCION_ICONO_TAMANO} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TextosEstandar({ editable }) {
  const [textos, setTextos] = useState(null);
  const [editando, setEditando] = useState(null); // { id?, titulo, contenido }
  const [guardando, setGuardando] = useState(false);

  const cargar = () => obtenerTextosCertificacion().then(setTextos).catch((e) => {
    console.error('Error al cargar los textos:', e);
    setTextos([]);
  });
  useEffect(() => { cargar(); }, []);

  const guardar = async () => {
    if (!editando.titulo.trim() || !editando.contenido.trim()) {
      alert('Completá el título y el texto.');
      return;
    }
    setGuardando(true);
    try {
      const datos = { titulo: editando.titulo.trim(), contenido: editando.contenido.trim() };
      if (editando.id) await actualizarTextoCertificacion(editando.id, datos);
      else await crearTextoCertificacion(datos);
      setEditando(null);
      await cargar();
    } catch (e) {
      console.error('Error al guardar el texto:', e);
      alert('Error al guardar el texto.');
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (t) => {
    if (!confirm(`¿Borrar el texto "${t.titulo}"?`)) return;
    await eliminarTextoCertificacion(t.id);
    await cargar();
  };

  const cargarEjemplos = async () => {
    setGuardando(true);
    try {
      for (const t of TEXTOS_EJEMPLO) await crearTextoCertificacion(t);
      await cargar();
    } finally {
      setGuardando(false);
    }
  };

  if (!textos) return <p className="py-6 text-sm text-center text-gray-400">Cargando...</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <p className="text-sm text-gray-500">Párrafos que se insertan con un toque en la memoria descriptiva de cada certificación.</p>
        {editable && !editando && (
          <button onClick={() => setEditando({ titulo: '', contenido: '' })} className="flex items-center px-3 py-2 text-sm text-white rounded-md bg-primary hover:bg-primary-light">
            <Plus size={16} className="mr-1" /> Nuevo texto
          </button>
        )}
      </div>

      {editando && (
        <div className="p-4 mb-4 border rounded-md border-primary/30 bg-primary/5">
          <label className={etiqueta}>Título (cómo aparece el botón)</label>
          <input type="text" value={editando.titulo} onChange={(e) => setEditando({ ...editando, titulo: e.target.value })} className={`${campo} mb-3`} placeholder="Ej: Presurización de escaleras" />
          <label className={etiqueta}>Texto</label>
          <textarea value={editando.contenido} onChange={(e) => setEditando({ ...editando, contenido: e.target.value })} className={`${campo} min-h-[160px]`} />
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => setEditando(null)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100">Cancelar</button>
            <button onClick={guardar} disabled={guardando} className="flex items-center px-4 py-2 text-sm text-white rounded-md bg-success hover:bg-green-700 disabled:opacity-50">
              <Save size={16} className="mr-1" /> {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {textos.length === 0 ? (
        <div className="py-6 text-center">
          <p className="mb-3 text-sm text-gray-400">No hay textos estándar todavía.</p>
          {editable && (
            <button onClick={cargarEjemplos} disabled={guardando} className="px-4 py-2 text-sm border rounded-md text-primary border-primary/40 hover:bg-primary/5 disabled:opacity-50">
              Cargar 2 textos de ejemplo (detección y alarma)
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {textos.map((t) => (
            <li key={t.id} className="p-4 border border-gray-200 rounded-md">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-gray-800">{t.titulo}</p>
                {editable && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setEditando(t)} title="Editar" className={accionIconoClase('secondary')}><Edit size={ACCION_ICONO_TAMANO} /></button>
                    <button onClick={() => borrar(t)} title="Borrar" className={accionIconoClase('red')}><Trash size={ACCION_ICONO_TAMANO} /></button>
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-line line-clamp-4">{t.contenido}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Subida de la credencial del certificador (se achica antes de subir). La
// firma y sello no se cargan: van a mano sobre el certificado impreso.
function ImagenCertificador({ titulo, ayuda, imagen, onElegir, editable }) {
  const inputRef = useRef(null);
  return (
    <div>
      <p className={etiqueta}>{titulo}</p>
      <p className="mb-2 text-xs text-gray-500">{ayuda}</p>
      <div className="flex flex-wrap items-center gap-3">
        {imagen ? (
          <img src={imagen} alt={titulo} className="object-contain h-32 p-1 bg-white border border-gray-200 rounded max-w-[16rem]" />
        ) : (
          <div className="flex items-center justify-center w-40 h-24 text-xs text-gray-400 border border-gray-300 border-dashed rounded">Sin imagen</div>
        )}
        {editable && (
          <>
            <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center px-3 py-2 text-sm text-white rounded-md bg-secondary hover:bg-secondary-light">
              <Upload size={16} className="mr-1" /> {imagen ? 'Cambiar' : 'Subir imagen'}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onElegir(file);
                e.target.value = '';
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

const CERTIFICADOR_VACIO = { nombre: '', titulo: '', matricula: '' };

function Certificadores({ editable }) {
  const [lista, setLista] = useState(null);
  const [form, setForm] = useState(null); // { id?, nombre, titulo, matricula, credencial? }
  const [archivos, setArchivos] = useState({ credencial: null });
  const [guardando, setGuardando] = useState(false);

  const cargar = () => obtenerCertificadores().then(setLista).catch((e) => {
    console.error('Error al cargar los certificadores:', e);
    setLista([]);
  });
  useEffect(() => { cargar(); }, []);

  const abrir = (c) => {
    setForm(c ? { ...c } : { ...CERTIFICADOR_VACIO });
    setArchivos({ credencial: null });
  };

  const previa = (clave) => (archivos[clave] ? URL.createObjectURL(archivos[clave]) : form?.[clave]?.url || null);

  const guardar = async () => {
    if (!form.nombre.trim()) {
      alert('Completá el nombre.');
      return;
    }
    setGuardando(true);
    try {
      const id = form.id || generarIdCertificador();
      const subir = async (clave, file) => {
        const archivo = await comprimirParaSubir(file, 2400, 0.85);
        const path = `certificadores/${id}/${clave}-${Date.now()}-${archivo.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, archivo);
        return { url: await getDownloadURL(storageRef), path };
      };
      const datos = { nombre: form.nombre.trim(), titulo: form.titulo.trim(), matricula: form.matricula.trim() };
      const reemplazadas = [];
      for (const clave of ['credencial']) {
        if (archivos[clave]) {
          datos[clave] = await subir(clave, archivos[clave]);
          if (form[clave]) reemplazadas.push(form[clave]);
        }
      }
      await guardarCertificador(id, datos);
      await eliminarFotosStorage(reemplazadas);
      setForm(null);
      await cargar();
    } catch (e) {
      console.error('Error al guardar el certificador:', e);
      alert('Error al guardar el certificador.');
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (c) => {
    if (!confirm(`¿Borrar a ${c.nombre}? Las certificaciones ya emitidas mantienen sus datos.`)) return;
    await eliminarCertificador(c);
    await cargar();
  };

  if (!lista) return <p className="py-6 text-sm text-center text-gray-400">Cargando...</p>;

  if (form) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-700">{form.id ? 'Editar certificador' : 'Nuevo certificador'}</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className={etiqueta}>Nombre y apellido</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={campo} placeholder="Ej: Facundo Germán Pedraza" />
          </div>
          <div>
            <label className={etiqueta}>Título</label>
            <input type="text" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className={campo} placeholder="Ej: Lic. HyS Esp. Seguridad contra Incendios" />
          </div>
          <div>
            <label className={etiqueta}>Matrícula</label>
            <input type="text" value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} className={campo} placeholder="Ej: 35108395 / 7458" />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          En el certificado sale como: <span className="font-medium">{[form.titulo, form.nombre].filter(Boolean).join(' ').toUpperCase() || '...'}{form.matricula ? ` - MP ${form.matricula}` : ''}</span>
        </p>

        <p className="mt-4 text-xs text-gray-500">
          La firma y el sello no se cargan: en el PDF queda el espacio en blanco con su nombre y matrícula, y se firma y sella a mano sobre el impreso.
        </p>
        <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
          <ImagenCertificador
            titulo="Credencial del colegio (opcional)"
            ayuda="Captura o foto de la credencial con la matrícula vigente. Se puede adjuntar como última hoja del certificado."
            imagen={previa('credencial')}
            onElegir={(file) => setArchivos((a) => ({ ...a, credencial: file }))}
            editable
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setForm(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100">
            <X size={16} className="mr-1" /> Cancelar
          </button>
          <button onClick={guardar} disabled={guardando} className="flex items-center px-4 py-2 text-sm text-white rounded-md bg-success hover:bg-green-700 disabled:opacity-50">
            <Save size={16} className="mr-1" /> {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <p className="text-sm text-gray-500">Profesional que firma las certificaciones. En el PDF queda el espacio en blanco para que firme y selle a mano el impreso.</p>
        {editable && (
          <button onClick={() => abrir(null)} className="flex items-center px-3 py-2 text-sm text-white rounded-md bg-primary hover:bg-primary-light">
            <Plus size={16} className="mr-1" /> Nuevo certificador
          </button>
        )}
      </div>
      {lista.length === 0 ? (
        <p className="py-6 text-sm text-center text-gray-400">Todavía no hay ningún certificador cargado.</p>
      ) : (
        <ul className="space-y-3">
          {lista.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-4 p-4 border border-gray-200 rounded-md">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800">{[c.titulo, c.nombre].filter(Boolean).join(' ')}</p>
                {c.matricula && <p className="text-sm text-gray-500">MP {c.matricula}</p>}
                <p className="text-xs text-gray-400">{c.credencial?.url ? 'Con credencial cargada' : 'Sin credencial'}</p>
              </div>
              {editable && (
                <div className="flex gap-1">
                  <button onClick={() => abrir(c)} title="Editar" className={accionIconoClase('secondary')}><Edit size={ACCION_ICONO_TAMANO} /></button>
                  <button onClick={() => borrar(c)} title="Borrar" className={accionIconoClase('red')}><Trash size={ACCION_ICONO_TAMANO} /></button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const PESTANAS = [
  { id: 'listado', label: 'Certificaciones', icono: ShieldCheck },
  { id: 'textos', label: 'Textos estándar', icono: FileText },
  { id: 'certificador', label: 'Certificador', icono: UserCheck }
];

function Certificaciones() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = PESTANAS.some((p) => p.id === searchParams.get('tab')) ? searchParams.get('tab') : 'listado';
  const { user, usuario, loading, puede } = useStaffAuth({ modulo: 'certificacion', accion: 'ver' });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  // Textos y certificador los cambia quien tiene nivel "todos" (o Admin).
  const editaConfig = puede('certificacion', 'gestionar');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="flex items-center mb-4">
            <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
              <Home size={16} className="mr-1" /> Panel
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Certificaciones</span>
          </div>
          {puede('certificacion', 'crear') && (
            <Link href="/admin/certificaciones/nueva" className="flex items-center px-4 py-2 mb-4 text-white rounded-md bg-primary hover:bg-primary-light">
              <FilePlus size={18} className="mr-2" /> Nueva Certificación
            </Link>
          )}
        </div>

        <h2 className="mb-1 text-2xl font-bold font-montserrat text-primary">Certificaciones</h2>
        <p className="mb-6 text-sm text-gray-500">
          Certificados de instalaciones contra incendio redactados en la app, listos para imprimir y que el profesional firme y selle a mano.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {PESTANAS.map(({ id, label, icono: Icono }) => (
            <button
              key={id}
              onClick={() => router.replace(id === 'listado' ? '/admin/certificaciones' : `/admin/certificaciones?tab=${id}`)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-colors ${tab === id
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
              <Icono size={16} /> {label}
            </button>
          ))}
        </div>

        {tab === 'listado' && <Listado user={user} usuario={usuario} puede={puede} />}
        {tab === 'textos' && <TextosEstandar editable={editaConfig} />}
        {tab === 'certificador' && <Certificadores editable={editaConfig} />}
      </div>
    </div>
  );
}

export default function CertificacionesPage() {
  return (
    <Suspense fallback={null}>
      <Certificaciones />
    </Suspense>
  );
}
