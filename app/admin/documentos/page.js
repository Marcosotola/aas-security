// app/admin/documentos/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Home, FileText, DollarSign, FileCheck, Receipt, File, Banknote, Award, Search, X } from 'lucide-react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  obtenerPresupuestos, obtenerEstados, obtenerRemitos, obtenerRecibos,
  obtenerOrdenesTrabajo, obtenerFacturas, obtenerCertificados, obtenerDocumentos,
  obtenerClientes
} from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';
import ModuloCard from '../../components/admin/ModuloCard';
import ViewToggle from '../../components/admin/ViewToggle';
import ListaDocumentosAdmin from '../../components/admin/ListaDocumentosAdmin';
import { normalizarDocumentosAdmin } from '../../lib/documentosAdmin';
import { filtrarDocumentos, TIPOS_DOC } from '../../lib/documentosCliente';

// Hub de "Documentos": agrupa los 5 tipos de documento (Presupuestos, Estados
// de Cuenta, Remitos, Recibos, Informes) con las mismas tarjetas que el panel
// principal (ver app/components/admin/ModuloCard.jsx), para no perder ese
// estilo al sacarlos del dashboard y agruparlos bajo un solo acceso.
export default function DocumentosHub() {
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [totales, setTotales] = useState({
    presupuestos: 0,
    estados: 0,
    remitos: 0,
    recibos: 0,
    documentos: 0,
    facturas: 0,
    certificados: 0
  });
  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const contar = async (ref) => (await getCountFromServer(ref)).data().count;
        const [presupuestos, estados, remitos, recibos, documentos, facturas, certificados] = await Promise.all([
          contar(collection(db, 'presupuestos')),
          contar(collection(db, 'estados')),
          contar(collection(db, 'remitos')),
          contar(collection(db, 'recibos')),
          contar(collection(db, 'documentos')),
          contar(collection(db, 'facturas')),
          contar(collection(db, 'certificados'))
        ]);
        setTotales({ presupuestos, estados, remitos, recibos, documentos, facturas, certificados });
      } catch (error) {
        console.error('Error al cargar totales de documentos:', error);
      } finally {
        setLoadingData(false);
      }
    })();
  }, [user]);

  // Buscador general: cruza los 8 tipos de documento de todos los clientes
  // (incluye "Informes" — colección `documentos` — ahora que también llevan
  // cliente/sede asociados), más los clientes y sedes en sí, para poder
  // buscar por cualquier cosa (número, cliente, empresa, sede, título,
  // contenido) y llegar rápido a lo que corresponda.
  // Fetch aparte del conteo de arriba: trae los documentos completos, no
  // solo la cantidad, así que carga en su propio estado para no demorar las
  // tarjetas (que ya se ven con el conteo liviano de getCountFromServer).
  const [loadingBusqueda, setLoadingBusqueda] = useState(true);
  const [todosDocumentos, setTodosDocumentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [sedeFiltro, setSedeFiltro] = useState('todas');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [tiposActivos, setTiposActivos] = useState(() => new Set(Object.keys(TIPOS_DOC)));
  const [vista, setVista] = useState('tabla');

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const [presupuestos, remitos, recibos, facturas, certificados, estados, ordenesTrabajo, informes, clientesData] = await Promise.all([
          obtenerPresupuestos(),
          obtenerRemitos(),
          obtenerRecibos(),
          obtenerFacturas(),
          obtenerCertificados(),
          obtenerEstados(),
          obtenerOrdenesTrabajo(),
          obtenerDocumentos(),
          obtenerClientes()
        ]);
        setTodosDocumentos(normalizarDocumentosAdmin({ presupuestos, remitos, recibos, facturas, certificados, estados, ordenesTrabajo, documentos: informes }));
        setClientes(clientesData);
      } catch (error) {
        console.error('Error al cargar los documentos para el buscador:', error);
      } finally {
        setLoadingBusqueda(false);
      }
    })();
  }, [user]);

  const clientesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return [];
    return clientes.filter((c) => {
      const nombreCompleto = `${c.nombre || ''} ${c.apellido || ''}`.toLowerCase();
      return nombreCompleto.includes(q)
        || c.empresa?.toLowerCase().includes(q)
        || c.email?.toLowerCase().includes(q)
        || c.telefono?.toLowerCase().includes(q);
    }).slice(0, 20);
  }, [clientes, busqueda]);

  const sedesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return [];
    const resultado = [];
    clientes.forEach((c) => {
      (c.sedes || []).forEach((s) => {
        if (s.nombre?.toLowerCase().includes(q) || s.direccion?.toLowerCase().includes(q)) {
          resultado.push({ clienteId: c.id, clienteNombre: `${c.nombre || ''} ${c.apellido || ''}`.trim(), sede: s });
        }
      });
    });
    return resultado.slice(0, 20);
  }, [clientes, busqueda]);

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

  const modulos = [
    {
      id: 'presupuestos',
      titulo: 'Presupuestos',
      icono: FileText,
      color: 'bg-[#1A5276]',
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-[#1A5276]',
      descripcion: 'Crear y gestionar presupuestos',
      total: totales.presupuestos,
      rutas: {
        nuevo: '/admin/presupuestos/nuevo',
        historial: '/admin/presupuestos'
      },
      activo: true
    },
    {
      id: 'estados',
      titulo: 'Estados de Cuenta',
      icono: DollarSign,
      color: 'bg-slate-700',
      colorClaro: 'bg-slate-100',
      colorTexto: 'text-slate-700',
      descripcion: 'Control de estados de cuenta',
      total: totales.estados,
      rutas: {
        nuevo: '/admin/estados/nuevo',
        historial: '/admin/estados'
      },
      activo: true
    },
    {
      id: 'remitos',
      titulo: 'Remitos',
      icono: FileCheck,
      color: 'bg-[#2E86C1]',
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-[#2E86C1]',
      descripcion: 'Gestión de remitos',
      total: totales.remitos,
      rutas: {
        nuevo: '/admin/remitos/nuevo',
        historial: '/admin/remitos'
      },
      activo: true
    },
    {
      id: 'recibos',
      titulo: 'Recibos',
      icono: Receipt,
      color: 'bg-slate-800',
      colorClaro: 'bg-slate-200',
      colorTexto: 'text-slate-800',
      descripcion: 'Administrar recibos',
      total: totales.recibos,
      rutas: {
        nuevo: '/admin/recibos/nuevo',
        historial: '/admin/recibos'
      },
      activo: true
    },
    {
      id: 'informes',
      titulo: 'Informes',
      icono: File,
      color: 'bg-[#154360]',
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-[#154360]',
      descripcion: 'Hojas membretadas y certificaciones',
      total: totales.documentos,
      rutas: {
        nuevo: '/admin/informes/nuevo',
        historial: '/admin/informes'
      },
      activo: true
    },
    {
      id: 'facturas',
      titulo: 'Facturas',
      icono: Banknote,
      color: 'bg-emerald-700',
      colorClaro: 'bg-emerald-100',
      colorTexto: 'text-emerald-700',
      descripcion: 'Facturas emitidas, PDF y estado de pago',
      total: totales.facturas,
      rutas: {
        nuevo: '/admin/facturas/nueva',
        historial: '/admin/facturas'
      },
      activo: true
    },
    {
      id: 'certificados',
      titulo: 'Certificados',
      icono: Award,
      color: 'bg-amber-700',
      colorClaro: 'bg-amber-100',
      colorTexto: 'text-amber-700',
      descripcion: 'Certificados por cliente y sede',
      total: totales.certificados,
      rutas: {
        nuevo: '/admin/certificados/nuevo',
        historial: '/admin/certificados'
      },
      activo: true
    }
  ];

  return (
    <div>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
            <Home size={16} className="mr-1" /> Panel
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">Documentos</span>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Documentos
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 md:gap-4">
          {modulos.map((modulo) => (
            <ModuloCard key={modulo.id} modulo={modulo} />
          ))}
        </div>

        <div className="mt-8">
          <h3 className="mb-1 text-lg font-semibold text-gray-700">Buscador general</h3>
          <p className="mb-4 text-sm text-gray-500">
            Por cliente, sede, número, título o concepto — cruza clientes, sedes y los 8 tipos de documento a la vez.
          </p>

          {loadingBusqueda ? (
            <div className="p-10 text-center bg-white rounded-lg shadow-md">
              <div className="w-8 h-8 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
            </div>
          ) : (
            <>
              <div className="p-4 space-y-4 bg-white rounded-lg shadow-md">
                <div className="relative">
                  <Search size={16} className="absolute -translate-y-1/2 left-3 top-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
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
                    <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-500">Hasta</label>
                    <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-md" />
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

              {busqueda.trim() && (clientesFiltrados.length > 0 || sedesFiltradas.length > 0) && (
                <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
                  {clientesFiltrados.length > 0 && (
                    <div className="p-4 bg-white rounded-lg shadow-md">
                      <h4 className="mb-3 text-sm font-semibold text-gray-700">Clientes ({clientesFiltrados.length})</h4>
                      <div className="space-y-1">
                        {clientesFiltrados.map((c) => (
                          <Link
                            key={c.id}
                            href={`/admin/usuarios/${c.id}`}
                            className="flex items-center justify-between gap-2 p-2 -mx-2 text-sm rounded-md hover:bg-gray-50"
                          >
                            <span className="text-gray-900 truncate">
                              {c.nombre ? `${c.nombre} ${c.apellido || ''}` : c.email}
                              {c.empresa ? ` · ${c.empresa}` : ''}
                            </span>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{c.email}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {sedesFiltradas.length > 0 && (
                    <div className="p-4 bg-white rounded-lg shadow-md">
                      <h4 className="mb-3 text-sm font-semibold text-gray-700">Sedes ({sedesFiltradas.length})</h4>
                      <div className="space-y-1">
                        {sedesFiltradas.map(({ clienteId, clienteNombre, sede }) => (
                          <Link
                            key={`${clienteId}-${sede.id}`}
                            href={`/admin/usuarios/${clienteId}?sede=${encodeURIComponent(sede.nombre)}`}
                            className="flex items-center justify-between gap-2 p-2 -mx-2 text-sm rounded-md hover:bg-gray-50"
                          >
                            <span className="text-gray-900 truncate">
                              {sede.nombre} <span className="text-gray-400">— {sede.direccion}</span>
                            </span>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{clienteNombre}</span>
                          </Link>
                        ))}
                      </div>
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
                    <ListaDocumentosAdmin documentos={documentosFiltrados} vista={vista} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
