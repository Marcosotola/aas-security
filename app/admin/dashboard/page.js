// app/admin/dashboard/page.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  DollarSign,
  FileCheck,
  Receipt,
  File,
  Files,
  MessageCircle,
  Tag,
  UserCog,
  Wallet,
  CreditCard,
  ClipboardList,
  ListChecks,
  Wrench,
  Search,
  X,
  Building2
} from 'lucide-react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStaffAuth } from '../../lib/useStaffAuth';
import {
  obtenerConfigSuscripcion,
  obtenerPresupuestos,
  obtenerEstados,
  obtenerRemitos,
  obtenerRecibos,
  obtenerOrdenesTrabajo,
  obtenerMantenimientosPreventivos,
  obtenerFacturas,
  obtenerCertificados,
  obtenerDocumentos,
  obtenerEmpresas
} from '../../lib/firestore';
import { estaBloqueada } from '../../lib/suscripcion';
import { normalizarDocumentosAdmin } from '../../lib/documentosAdmin';
import { filtrarDocumentos, TIPOS_DOC } from '../../lib/documentosCliente';
import ModuloCard from '../../components/admin/ModuloCard';
import ViewToggle from '../../components/admin/ViewToggle';
import ListaDocumentosAdmin from '../../components/admin/ListaDocumentosAdmin';

// Único módulo visible para el Técnico por ahora: el resto de las
// colecciones (movimientos, config, etc.) están bloqueadas para su rol por
// firestore.rules, así que ni siquiera se consultan cuando el usuario es
// Técnico (antes esto no importaba porque el dashboard era Admin-only).
const IDS_VISIBLES_PARA_TECNICO = ['ordenes-trabajo', 'mantenimiento-preventivo'];

export default function Dashboard() {
  const { user, usuario, loading: loadingAuth } = useStaffAuth(['Admin', 'Tecnico']);
  const [loadingData, setLoadingData] = useState(true);
  const [totales, setTotales] = useState({
    consultas: 0,
    consultasNoLeidas: 0
  });
  const [suscripcionVencida, setSuscripcionVencida] = useState(false);
  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!usuario) return;
    cargarTotales().then(() => setLoadingData(false));
  }, [usuario]);

  // Los módulos del dashboard ya no muestran cantidades (solo la tarjeta de
  // Consultas, que además usa el conteo de no leídas para el badge rojo), así
  // que acá solo se piden esos dos números y el estado de la suscripción --
  // nada de lo demás se lee más, para no gastar lecturas de Firestore en
  // datos que no se muestran en ningún lado.
  const cargarTotales = async () => {
    try {
      if (usuario.role === 'Tecnico') return;

      const contar = async (ref) => (await getCountFromServer(ref)).data().count;

      const [consultas, consultasNoLeidas, config] = await Promise.all([
        contar(collection(db, 'consultas')),
        contar(query(collection(db, 'consultas'), where('leida', '==', false))),
        obtenerConfigSuscripcion()
      ]);

      setTotales({ consultas, consultasNoLeidas });
      setSuscripcionVencida(estaBloqueada(config));
    } catch (error) {
      console.error('Error al cargar totales:', error);
    }
  };

  // Buscador general: cruza los 9 tipos de documento de todos los clientes
  // (presupuesto, remito, recibo, factura, certificado, estado, orden,
  // mantenimiento, informe), más las empresas y sedes en sí, para poder
  // buscar por número, cliente, empresa, sede, concepto o fechas y llegar
  // directo a lo que corresponda. Vivía en el hub /admin/documentos, pero
  // como ya buscaba en todos los tipos (no solo los agrupados ahí dentro) no
  // tenía sentido tenerlo separado del panel principal -- solo Admin (mismos
  // datos cross-cliente que antes solo se pedían en esa página Admin-only).
  const [todosDocumentos, setTodosDocumentos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [sedeFiltro, setSedeFiltro] = useState('todas');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [tiposActivos, setTiposActivos] = useState(() => new Set(Object.keys(TIPOS_DOC)));
  const [vista, setVista] = useState('tabla');
  const [visibleDocs, setVisibleDocs] = useState(20);
  const [visibleEmpresas, setVisibleEmpresas] = useState(20);
  const [visibleSedes, setVisibleSedes] = useState(20);

  // El cruce de los 9 tipos de documento + empresas es una lectura pesada
  // (Firestore no tiene búsqueda de texto server-side, así que hay que traer
  // las colecciones enteras para poder filtrar en memoria). Antes se pedía
  // siempre al entrar al panel, se usara el buscador o no. Ahora se pide
  // recién la primera vez que el Admin toca el buscador (foco en el texto o
  // en las fechas) y se cachea para el resto de la sesión.
  const [busquedaIniciada, setBusquedaIniciada] = useState(false);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);

  const iniciarBusqueda = () => {
    if (busquedaIniciada || !usuario || usuario.role !== 'Admin') return;
    setBusquedaIniciada(true);
    setCargandoBusqueda(true);

    (async () => {
      try {
        const [presupuestos, remitos, recibos, facturas, certificados, estados, ordenesTrabajo, mantenimientosPreventivos, informes, empresasData] = await Promise.all([
          obtenerPresupuestos(),
          obtenerRemitos(),
          obtenerRecibos(),
          obtenerFacturas(),
          obtenerCertificados(),
          obtenerEstados(),
          obtenerOrdenesTrabajo(),
          obtenerMantenimientosPreventivos(),
          obtenerDocumentos(),
          obtenerEmpresas()
        ]);
        setTodosDocumentos(normalizarDocumentosAdmin({ presupuestos, remitos, recibos, facturas, certificados, estados, ordenesTrabajo, mantenimientosPreventivos, documentos: informes }));
        setEmpresas(empresasData);
      } catch (error) {
        console.error('Error al cargar los documentos para el buscador:', error);
      } finally {
        setCargandoBusqueda(false);
      }
    })();
  };

  // Sin ningún criterio cargado, no tiene sentido volcar todos los
  // documentos: se espera a que el Admin escriba algo o elija sede/fecha.
  const hayCriterio = busqueda.trim() !== '' || sedeFiltro !== 'todas' || desde !== '' || hasta !== '';

  // Cada vez que cambia el criterio arranca de nuevo desde los primeros 20 --
  // si no, "Ver más" en una búsqueda podría quedar pedido de una anterior.
  useEffect(() => {
    setVisibleDocs(20);
    setVisibleEmpresas(20);
    setVisibleSedes(20);
  }, [busqueda, sedeFiltro, desde, hasta, tiposActivos]);

  const empresasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return [];
    return empresas.filter((e) =>
      e.nombre?.toLowerCase().includes(q)
      || e.razonSocial?.toLowerCase().includes(q)
      || e.cuit?.toLowerCase().includes(q)
      || e.email?.toLowerCase().includes(q)
      || e.telefono?.toLowerCase().includes(q));
  }, [empresas, busqueda]);

  const sedesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return [];
    const resultado = [];
    empresas.forEach((e) => {
      (e.sedes || []).forEach((s) => {
        if (s.nombre?.toLowerCase().includes(q) || s.direccion?.toLowerCase().includes(q)) {
          resultado.push({ empresaId: e.id, empresaNombre: e.nombre, sede: s });
        }
      });
    });
    return resultado;
  }, [empresas, busqueda]);

  const tiposPresentes = useMemo(() => {
    const set = new Set(todosDocumentos.map((d) => d.tipo));
    return Object.keys(TIPOS_DOC).filter((t) => set.has(t));
  }, [todosDocumentos]);

  const sedesDisponibles = useMemo(() => {
    const set = new Set(todosDocumentos.map((d) => d.sede).filter(Boolean));
    return Array.from(set).sort();
  }, [todosDocumentos]);

  const toggleTipo = (tipo) => {
    setTiposActivos((prev) => {
      const next = new Set(prev);
      if (next.has(tipo)) next.delete(tipo); else next.add(tipo);
      return next;
    });
  };

  const documentosFiltrados = useMemo(() => {
    const porTipo = todosDocumentos.filter((d) => tiposActivos.has(d.tipo));
    return filtrarDocumentos(porTipo, { busqueda, sede: sedeFiltro, desde, hasta });
  }, [todosDocumentos, tiposActivos, sedeFiltro, busqueda, desde, hasta]);

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

  // Presupuestos, Estados, Remitos, Recibos e Informes viven agrupados atrás
  // de una sola tarjeta "Documentos" (nada de tarjetas sueltas en el panel
  // principal): al tocar la tarjeta se entra al hub /admin/documentos (una
  // tarjeta por tipo, mismo estilo, cada una con su "Nuevo"), y el botón
  // "Nuevo" de esta tarjeta despliega el acceso directo para crear cada tipo
  // sin tener que entrar primero al hub.
  const modulos = [
    {
      id: 'ordenes-trabajo',
      titulo: 'Órdenes de Trabajo',
      icono: ClipboardList,
      color: 'bg-teal-700', // Verde azulado, distinto de los tonos ya usados
      colorClaro: 'bg-teal-100',
      colorTexto: 'text-teal-700',
      descripcion: 'Detalle del trabajo, fotos y firmas',
      rutas: {
        nuevo: '/admin/ordenes-trabajo/nueva',
        historial: '/admin/ordenes-trabajo'
      },
      activo: true
    },
    {
      id: 'mantenimiento-preventivo',
      titulo: 'Mantenimiento Preventivo',
      icono: Wrench,
      color: 'bg-amber-600',
      colorClaro: 'bg-amber-100',
      colorTexto: 'text-amber-600',
      descripcion: 'Trabajo, fotos y firmas',
      rutas: {
        nuevo: '/admin/mantenimiento-preventivo/nueva',
        historial: '/admin/mantenimiento-preventivo'
      },
      activo: true
    },
    {
      id: 'documentos',
      titulo: 'Documentos',
      icono: Files,
      color: 'bg-[#154360]', // Deep Navy/Teal
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-[#154360]',
      descripcion: 'Presupuestos, remitos, recibos, estados e informes',
      rutas: {
        historial: '/admin/documentos'
      },
      activo: true,
      nuevoDropdown: true,
      nuevoAccesos: [
        { label: 'Nuevo Presupuesto', icono: FileText, href: '/admin/presupuestos/nuevo' },
        { label: 'Nuevo Estado de Cuenta', icono: DollarSign, href: '/admin/estados/nuevo' },
        { label: 'Nuevo Remito', icono: FileCheck, href: '/admin/remitos/nuevo' },
        { label: 'Nuevo Recibo', icono: Receipt, href: '/admin/recibos/nuevo' },
        { label: 'Nuevo Informe', icono: File, href: '/admin/informes/nuevo' }
      ]
    },
    {
      id: 'planillas',
      titulo: 'Planillas',
      icono: ListChecks,
      color: 'bg-slate-700',
      colorClaro: 'bg-slate-100',
      colorTexto: 'text-slate-700',
      descripcion: 'Plantillas de inspección para las OT',
      rutas: {
        nuevo: '/admin/planillas/nueva',
        historial: '/admin/planillas'
      },
      activo: true
    },
    {
      id: 'finanzas',
      titulo: 'Finanzas',
      icono: Wallet,
      color: 'bg-blue-900', // Azul de la familia del sitio, distinto de los tonos ya usados
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-blue-900',
      descripcion: 'Ingresos, gastos y ganancia real',
      rutas: {
        nuevo: '/admin/finanzas?nuevo=1',
        historial: '/admin/finanzas'
      },
      activo: true
    },
    {
      id: 'lista-precios',
      titulo: 'Lista de Precios',
      icono: Tag,
      color: 'bg-slate-600', // Slate más claro, dentro de la misma familia que Estados/Recibos
      colorClaro: 'bg-slate-100',
      colorTexto: 'text-slate-600',
      descripcion: 'Catálogo de items para presupuestos',
      rutas: {
        nuevo: '/admin/lista-precios?nuevo=1',
        historial: '/admin/lista-precios'
      },
      activo: true
    },
    {
      id: 'empresas',
      titulo: 'Empresas',
      icono: Building2,
      color: 'bg-cyan-800', // Cian oscuro, distinto de los tonos ya usados
      colorClaro: 'bg-cyan-100',
      colorTexto: 'text-cyan-800',
      descripcion: 'Empresas y sus sedes',
      rutas: {
        historial: '/admin/empresas'
      },
      sinNuevo: true,
      activo: true
    },
    {
      id: 'usuarios',
      titulo: 'Usuarios',
      icono: UserCog,
      color: 'bg-slate-900', // Slate más oscuro, dentro de la misma familia que Estados/Recibos
      colorClaro: 'bg-slate-200',
      colorTexto: 'text-slate-900',
      descripcion: 'Clientes, técnicos y roles',
      rutas: {
        nuevo: '/registro?origen=admin',
        historial: '/admin/usuarios'
      },
      activo: true
    },
    {
      id: 'consultas',
      titulo: 'Consultas',
      icono: MessageCircle,
      color: 'bg-[#3498DB]', // Azul info del sitio, dentro de la misma paleta que el resto
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-[#3498DB]',
      descripcion: 'Consultas recibidas desde la web',
      total: totales.consultas,
      badge: totales.consultasNoLeidas,
      rutas: {
        historial: '/admin/consultas'
      },
      activo: true,
      sinNuevo: true
    },
    {
      id: 'suscripcion',
      titulo: 'Suscripción',
      icono: CreditCard,
      color: 'bg-[#154360]', // Mismo azul oscuro que usaba antes la tarjeta de Informes
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-[#154360]',
      descripcion: 'Estado de pago y habilitación de la app',
      total: suscripcionVencida ? 'Vencida' : 'Al día',
      badge: suscripcionVencida ? 1 : 0,
      rutas: {
        historial: '/admin/suscripcion'
      },
      activo: true,
      sinNuevo: true,
      textoAcceso: 'Ver suscripción',
      iconoAcceso: CreditCard
    }
  ];

  // El Técnico solo ve las tarjetas que le corresponden (por ahora, Órdenes
  // de Trabajo y Mantenimiento Preventivo): el resto de los módulos son de
  // gestión administrativa.
  const modulosVisibles = usuario.role === 'Admin'
    ? modulos
    : modulos.filter((m) => IDS_VISIBLES_PARA_TECNICO.includes(m.id));

  return (
    <div>
      <div className="container px-4 py-8 mx-auto">
        {/* Título y bienvenida */}
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold md:text-3xl font-montserrat text-primary">
            ¡Bienvenido, {user?.displayName || user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Módulos del sistema */}
        <h3 className="mb-4 text-xl font-bold text-gray-800">Módulos del sistema</h3>
        <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">
          {modulosVisibles.map((modulo) => (
            <ModuloCard key={modulo.id} modulo={modulo} />
          ))}
        </div>

        {/* Buscador general: solo Admin (mismos datos cross-cliente que antes
            solo vivían en el hub Documentos, ahora Admin-only acá también). */}
        {usuario.role === 'Admin' && (
          <div className="mb-8">
            <h3 className="mb-1 text-lg font-semibold text-gray-700">Buscador general</h3>
            <p className="mb-4 text-sm text-gray-500">
              Por cliente, sede, número, título o concepto — cruza empresas, sedes y los 9 tipos de documento a la vez.
            </p>

            <div className="p-4 space-y-4 bg-white rounded-lg shadow-md">
              <div className="relative">
                <Search size={16} className="absolute -translate-y-1/2 left-3 top-1/2 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onFocus={iniciarBusqueda}
                  placeholder="Buscar por número, cliente, sede, concepto..."
                  className="w-full py-2 pl-9 pr-9 text-sm border border-gray-300 rounded-md"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda('')}
                    title="Limpiar búsqueda"
                    className="absolute p-1 -translate-y-1/2 rounded-full right-1.5 top-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-end gap-3">
                {sedesDisponibles.length > 1 && (
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-500">Sede</label>
                    <select
                      value={sedeFiltro}
                      onChange={(e) => setSedeFiltro(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md"
                    >
                      <option value="todas">Todas las sedes</option>
                      {sedesDisponibles.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-500">Desde</label>
                  <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} onFocus={iniciarBusqueda} className="px-3 py-2 text-sm border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-500">Hasta</label>
                  <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} onFocus={iniciarBusqueda} className="px-3 py-2 text-sm border border-gray-300 rounded-md" />
                </div>
                <ViewToggle vista={vista} onChange={setVista} />
              </div>

              {tiposPresentes.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {tiposPresentes.map((tipo) => {
                    const { label, icono: Icono } = TIPOS_DOC[tipo];
                    const activo = tiposActivos.has(tipo);
                    return (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => toggleTipo(tipo)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                          activo ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icono size={13} /> {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {!hayCriterio ? (
              <div className="p-10 mt-4 text-center bg-white rounded-lg shadow-md">
                <Search size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500">Escribí algo, o elegí sede/fecha, para buscar.</p>
              </div>
            ) : cargandoBusqueda ? (
              <div className="p-10 mt-4 text-center bg-white rounded-lg shadow-md">
                <div className="w-8 h-8 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
              </div>
            ) : (
              <>
                {busqueda.trim() && (empresasFiltradas.length > 0 || sedesFiltradas.length > 0) && (
                  <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
                    {empresasFiltradas.length > 0 && (
                      <div className="p-4 bg-white rounded-lg shadow-md">
                        <h4 className="mb-3 text-sm font-semibold text-gray-700">Empresas ({empresasFiltradas.length})</h4>
                        <div className="space-y-1">
                          {empresasFiltradas.slice(0, visibleEmpresas).map((e) => (
                            <Link
                              key={e.id}
                              href={`/admin/empresas/${e.id}`}
                              className="flex items-center justify-between gap-2 p-2 -mx-2 text-sm rounded-md hover:bg-gray-50"
                            >
                              <span className="text-gray-900 truncate">
                                {e.nombre}
                                {e.razonSocial ? ` · ${e.razonSocial}` : ''}
                              </span>
                              <span className="text-xs text-gray-400 whitespace-nowrap">{e.cuit}</span>
                            </Link>
                          ))}
                        </div>
                        {empresasFiltradas.length > visibleEmpresas && (
                          <button
                            type="button"
                            onClick={() => setVisibleEmpresas((v) => v + 20)}
                            className="w-full py-2 mt-2 text-xs font-medium text-center border rounded-md text-primary border-primary hover:bg-primary/5"
                          >
                            Ver más ({empresasFiltradas.length - visibleEmpresas} más)
                          </button>
                        )}
                      </div>
                    )}
                    {sedesFiltradas.length > 0 && (
                      <div className="p-4 bg-white rounded-lg shadow-md">
                        <h4 className="mb-3 text-sm font-semibold text-gray-700">Sedes ({sedesFiltradas.length})</h4>
                        <div className="space-y-1">
                          {sedesFiltradas.slice(0, visibleSedes).map(({ empresaId, empresaNombre, sede }) => (
                            <Link
                              key={`${empresaId}-${sede.id}`}
                              href={`/admin/empresas/${empresaId}?sede=${encodeURIComponent(sede.id)}`}
                              className="flex items-center justify-between gap-2 p-2 -mx-2 text-sm rounded-md hover:bg-gray-50"
                            >
                              <span className="text-gray-900 truncate">
                                {sede.nombre} <span className="text-gray-400">— {sede.direccion}</span>
                              </span>
                              <span className="text-xs text-gray-400 whitespace-nowrap">{empresaNombre}</span>
                            </Link>
                          ))}
                        </div>
                        {sedesFiltradas.length > visibleSedes && (
                          <button
                            type="button"
                            onClick={() => setVisibleSedes((v) => v + 20)}
                            className="w-full py-2 mt-2 text-xs font-medium text-center border rounded-md text-primary border-primary hover:bg-primary/5"
                          >
                            Ver más ({sedesFiltradas.length - visibleSedes} más)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4">
                  {todosDocumentos.length === 0 ? (
                    <div className="p-10 text-center bg-white rounded-lg shadow-md">
                      <FileText size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-500">Todavía no hay documentos cargados.</p>
                    </div>
                  ) : documentosFiltrados.length === 0 ? (
                    <div className="p-10 text-center bg-white rounded-lg shadow-md">
                      <p className="text-gray-500">No hay documentos que coincidan con la búsqueda.</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-white rounded-lg shadow-md sm:p-6">
                      <p className="mb-4 text-sm text-gray-400">{documentosFiltrados.length} documentos</p>
                      <ListaDocumentosAdmin documentos={documentosFiltrados.slice(0, visibleDocs)} vista={vista} />
                      {documentosFiltrados.length > visibleDocs && (
                        <div className="mt-4 text-center">
                          <button
                            type="button"
                            onClick={() => setVisibleDocs((v) => v + 20)}
                            className="px-4 py-2 text-sm font-medium border rounded-md text-primary border-primary hover:bg-primary/5"
                          >
                            Ver más ({documentosFiltrados.length - visibleDocs} más)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
