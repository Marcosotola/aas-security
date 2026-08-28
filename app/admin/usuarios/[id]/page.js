// app/admin/usuarios/[id]/page.js
'use client';

import { Suspense, useState, useEffect, useMemo, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Home, MapPin, Eye, Edit, Trash, Download,
  FileText, FileCheck, Receipt, Banknote, Award, DollarSign, ClipboardList
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import {
  obtenerUsuarioPorId,
  obtenerPresupuestosPorCliente,
  obtenerRemitosPorCliente,
  obtenerRecibosPorCliente,
  obtenerFacturasPorCliente,
  obtenerCertificadosPorCliente,
  obtenerEstadosPorCliente,
  obtenerOrdenesTrabajoPorCliente,
  eliminarPresupuesto,
  eliminarRemito,
  eliminarRecibo,
  eliminarFactura,
  eliminarCertificado,
  eliminarEstado,
  eliminarOrdenTrabajo
} from '../../../lib/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';
import { accionIconoClase, ACCION_ICONO_TAMANO } from '../../../components/admin/accionIcono';
import { formatearFecha } from '../../../lib/fecha';
import PresupuestoPDF from '../../../components/pdf/PresupuestoPDF';
import RemitoPDF from '../../../components/pdf/RemitoPDF';
import ReciboPDF from '../../../components/pdf/ReciboPDF';
import EstadoPDF from '../../../components/pdf/EstadoPDF';
import DescargarOrdenTrabajoPDF from '../../../components/pdf/DescargarOrdenTrabajoPDF';
import { EstadoFacturaBadge } from '../../../components/ui/EstadoFactura';

const formatFecha = (doc) => {
  if (doc.fechaCreacion?.toDate) return doc.fechaCreacion.toDate().toLocaleDateString('es-AR');
  if (doc.fecha) return formatearFecha(doc.fecha);
  return '-';
};

const formatMoney = (amount) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!num || isNaN(num)) return '$0,00';
  const formatted = num.toFixed(2).replace('.', ',');
  const parts = formatted.split(',');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return '$' + parts.join(',');
};

const BadgeSede = ({ nombre }) => nombre ? (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 rounded-full bg-blue-50">
    <MapPin size={11} /> {nombre}
  </span>
) : <span className="text-gray-400">-</span>;

const BadgePresupuesto = ({ estado }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${estado === 'Aprobado' ? 'bg-green-100 text-green-800' :
      estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
    }`}>
    {estado || 'Pendiente'}
  </span>
);

const TIPOS = [
  { key: 'presupuestos', label: 'Presupuestos', icono: FileText },
  { key: 'remitos', label: 'Remitos', icono: FileCheck },
  { key: 'recibos', label: 'Recibos', icono: Receipt },
  { key: 'facturas', label: 'Facturas', icono: Banknote },
  { key: 'certificados', label: 'Certificados', icono: Award },
  { key: 'estados', label: 'Estados de Cuenta', icono: DollarSign },
  { key: 'ordenes', label: 'Órdenes de Trabajo', icono: ClipboardList }
];

// Tabla genérica para documentos generados con @react-pdf/renderer
// (presupuesto/remito/recibo/estado/orden), que comparten forma: numero,
// fecha, sede + acciones Ver/Descargar/Editar/Eliminar.
function SeccionPDF({ titulo, Icono, items, rutaBase, PDFDoc, propName, montoField, badge, extraCol, sedeDe, tipo, onEliminar, eliminando, renderDescarga }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-700">
        <Icono size={18} className="text-primary" /> {titulo}
        <span className="text-sm font-normal text-gray-400">({items.length})</span>
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No hay {titulo.toLowerCase()} para este cliente con el filtro actual.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Número</th>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Sede</th>
                {extraCol && <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{extraCol.header}</th>}
                {montoField && <th className="px-4 py-2 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Monto</th>}
                {badge && <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Estado</th>}
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{item.numero}</td>
                  <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">{formatFecha(item)}</td>
                  <td className="px-4 py-2 text-sm whitespace-nowrap"><BadgeSede nombre={sedeDe(item)} /></td>
                  {extraCol && <td className="max-w-xs px-4 py-2 text-sm text-gray-500 truncate">{extraCol.render(item)}</td>}
                  {montoField && <td className="px-4 py-2 text-sm font-medium text-right text-gray-900 whitespace-nowrap">{formatMoney(item[montoField])}</td>}
                  {badge && <td className="px-4 py-2 whitespace-nowrap">{badge(item)}</td>}
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`${rutaBase}/${item.id}`} title="Ver detalles" className={accionIconoClase('gray')}>
                        <Eye size={ACCION_ICONO_TAMANO} />
                      </Link>
                      {renderDescarga ? renderDescarga(item) : (
                        <PDFDownloadLink
                          document={<PDFDoc {...{ [propName]: item }} />}
                          fileName={`${item.numero}.pdf`}
                          title="Descargar PDF"
                          className={accionIconoClase('primary')}
                        >
                          {({ loading }) => <Download size={ACCION_ICONO_TAMANO} className={loading ? 'animate-pulse' : ''} />}
                        </PDFDownloadLink>
                      )}
                      <Link href={`${rutaBase}/editar/${item.id}`} title="Editar" className={accionIconoClase('secondary')}>
                        <Edit size={ACCION_ICONO_TAMANO} />
                      </Link>
                      <button
                        onClick={() => onEliminar(item.id)}
                        disabled={eliminando === `${tipo}:${item.id}`}
                        title="Eliminar"
                        className={accionIconoClase('red')}
                      >
                        <Trash size={ACCION_ICONO_TAMANO} />
                      </button>
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

// Tabla para documentos basados en archivos subidos (factura/certificado):
// no se generan con react-pdf, se descarga el archivo adjunto directamente.
function SeccionArchivos({ titulo, Icono, items, rutaBase, nombreField, montoField, badge, extraCol, sedeDe, tipo, onEliminar, eliminando }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-700">
        <Icono size={18} className="text-primary" /> {titulo}
        <span className="text-sm font-normal text-gray-400">({items.length})</span>
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No hay {titulo.toLowerCase()} para este cliente con el filtro actual.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{nombreField === 'nombre' ? 'Nombre' : 'Número'}</th>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Sede</th>
                {extraCol && <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{extraCol.header}</th>}
                {montoField && <th className="px-4 py-2 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Monto</th>}
                {badge && <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Estado</th>}
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => {
                const archivos = item.archivos || [];
                return (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{item[nombreField]}</td>
                    <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">{formatFecha(item)}</td>
                    <td className="px-4 py-2 text-sm whitespace-nowrap"><BadgeSede nombre={sedeDe(item)} /></td>
                    {extraCol && <td className="max-w-xs px-4 py-2 text-sm text-gray-500 truncate">{extraCol.render(item)}</td>}
                    {montoField && <td className="px-4 py-2 text-sm font-medium text-right text-gray-900 whitespace-nowrap">{formatMoney(item[montoField])}</td>}
                    {badge && <td className="px-4 py-2 whitespace-nowrap">{badge(item)}</td>}
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`${rutaBase}/${item.id}`} title="Ver detalles" className={accionIconoClase('gray')}>
                          <Eye size={ACCION_ICONO_TAMANO} />
                        </Link>
                        {archivos.length > 0 ? (
                          <a href={archivos[0].url} target="_blank" rel="noopener noreferrer" title="Descargar" className={accionIconoClase('primary')}>
                            <Download size={ACCION_ICONO_TAMANO} />
                          </a>
                        ) : (
                          <span className={`${accionIconoClase('gray')} text-gray-300 hover:bg-transparent`}>
                            <Download size={ACCION_ICONO_TAMANO} />
                          </span>
                        )}
                        <Link href={`${rutaBase}/editar/${item.id}`} title="Editar" className={accionIconoClase('secondary')}>
                          <Edit size={ACCION_ICONO_TAMANO} />
                        </Link>
                        <button
                          onClick={() => onEliminar(item.id)}
                          disabled={eliminando === `${tipo}:${item.id}`}
                          title="Eliminar"
                          className={accionIconoClase('red')}
                        >
                          <Trash size={ACCION_ICONO_TAMANO} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DocumentosCliente({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [sedeFiltro, setSedeFiltro] = useState(searchParams.get('sede') || 'todas');
  const [tiposVisibles, setTiposVisibles] = useState(() => Object.fromEntries(TIPOS.map((t) => [t.key, true])));
  const [eliminando, setEliminando] = useState(null);

  const [presupuestos, setPresupuestos] = useState([]);
  const [remitos, setRemitos] = useState([]);
  const [recibos, setRecibos] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [certificados, setCertificados] = useState([]);
  const [estados, setEstados] = useState([]);
  const [ordenes, setOrdenes] = useState([]);

  const loading = loadingAuth || loadingData;

  // Si se navega a esta página con ?sede=X (desde el link de una sede en un
  // listado de documentos), sincronizamos el filtro. No se dispara con los
  // cambios manuales del select de abajo, que no tocan la URL.
  useEffect(() => {
    const sedeParam = searchParams.get('sede');
    if (sedeParam) setSedeFiltro(sedeParam);
  }, [searchParams]);

  useEffect(() => {
    if (!user || !id) return;

    (async () => {
      try {
        const [perfilData, pres, rem, rec, fac, cert, est, ord] = await Promise.all([
          obtenerUsuarioPorId(id),
          obtenerPresupuestosPorCliente(id),
          obtenerRemitosPorCliente(id),
          obtenerRecibosPorCliente(id),
          obtenerFacturasPorCliente(id),
          obtenerCertificadosPorCliente(id),
          obtenerEstadosPorCliente(id),
          obtenerOrdenesTrabajoPorCliente(id)
        ]);

        if (!perfilData) {
          alert('No se encontró el usuario.');
          router.push('/admin/usuarios');
          return;
        }

        setPerfil(perfilData);
        setPresupuestos(pres);
        setRemitos(rem);
        setRecibos(rec);
        setFacturas(fac);
        setCertificados(cert);
        setEstados(est);
        setOrdenes(ord);
      } catch (error) {
        console.error('Error al cargar los documentos del cliente:', error);
      } finally {
        setLoadingData(false);
      }
    })();
  }, [user, id, router]);

  const sedesDisponibles = useMemo(() => {
    const set = new Set();
    (perfil?.sedes || []).forEach((s) => s.nombre && set.add(s.nombre));
    [...presupuestos, ...remitos, ...estados, ...ordenes].forEach((d) => d.cliente?.sedeNombre && set.add(d.cliente.sedeNombre));
    [...recibos, ...facturas, ...certificados].forEach((d) => d.sedeNombre && set.add(d.sedeNombre));
    return Array.from(set).sort();
  }, [perfil, presupuestos, remitos, recibos, facturas, certificados, estados, ordenes]);

  const porSedeA = (items) => sedeFiltro === 'todas' ? items : items.filter((d) => (d.cliente?.sedeNombre || '') === sedeFiltro);
  const porSedeB = (items) => sedeFiltro === 'todas' ? items : items.filter((d) => (d.sedeNombre || '') === sedeFiltro);

  const presupuestosFiltrados = useMemo(() => porSedeA(presupuestos), [presupuestos, sedeFiltro]);
  const remitosFiltrados = useMemo(() => porSedeA(remitos), [remitos, sedeFiltro]);
  const estadosFiltrados = useMemo(() => porSedeA(estados), [estados, sedeFiltro]);
  const ordenesFiltradas = useMemo(() => porSedeA(ordenes), [ordenes, sedeFiltro]);
  const recibosFiltrados = useMemo(() => porSedeB(recibos), [recibos, sedeFiltro]);
  const facturasFiltradas = useMemo(() => porSedeB(facturas), [facturas, sedeFiltro]);
  const certificadosFiltrados = useMemo(() => porSedeB(certificados), [certificados, sedeFiltro]);

  const totalDocumentos = presupuestos.length + remitos.length + recibos.length + facturas.length + certificados.length + estados.length + ordenes.length;

  const toggleTipo = (key) => setTiposVisibles((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleEliminar = async (tipo, eliminarFn, docId, setState, items) => {
    if (!confirm('¿Eliminar este documento? Esta acción no se puede deshacer.')) return;
    setEliminando(`${tipo}:${docId}`);
    try {
      await eliminarFn(docId);
      setState(items.filter((d) => d.id !== docId));
    } catch (error) {
      console.error(`Error al eliminar (${tipo}):`, error);
      alert('Error al eliminar el documento. Inténtelo de nuevo más tarde.');
    } finally {
      setEliminando(null);
    }
  };

  if (loading || !perfil) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  const nombreCompleto = perfil.nombre ? `${perfil.nombre} ${perfil.apellido || ''}`.trim() : perfil.email;

  return (
    <div>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
            <Home size={16} className="mr-1" /> Panel
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link href="/admin/usuarios" className="mr-2 text-primary hover:underline">Usuarios</Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">{nombreCompleto}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold font-montserrat text-primary">{nombreCompleto}</h2>
            <p className="text-sm text-gray-500">{perfil.email}{perfil.empresa ? ` · ${perfil.empresa}` : ''}</p>
          </div>
          <Link
            href={`/admin/usuarios/completar?uid=${id}`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
          >
            <Edit size={16} /> Editar datos del cliente
          </Link>
        </div>

        <div className="p-4 mb-6 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Sede</label>
              <select
                value={sedeFiltro}
                onChange={(e) => setSedeFiltro(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md"
              >
                <option value="todas">Todas las sedes</option>
                {sedesDisponibles.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <p className="text-sm text-gray-400">{totalDocumentos} documentos en total</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {TIPOS.map(({ key, label, icono: Icono }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleTipo(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${tiposVisibles[key]
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <Icono size={13} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {tiposVisibles.presupuestos && (
            <SeccionPDF
              titulo="Presupuestos" Icono={FileText} items={presupuestosFiltrados}
              rutaBase="/admin/presupuestos" PDFDoc={PresupuestoPDF} propName="presupuesto"
              montoField="total" badge={(d) => <BadgePresupuesto estado={d.estado} />}
              sedeDe={(d) => d.cliente?.sedeNombre} tipo="presupuestos" eliminando={eliminando}
              onEliminar={(docId) => handleEliminar('presupuestos', eliminarPresupuesto, docId, setPresupuestos, presupuestos)}
            />
          )}
          {tiposVisibles.remitos && (
            <SeccionPDF
              titulo="Remitos" Icono={FileCheck} items={remitosFiltrados}
              rutaBase="/admin/remitos" PDFDoc={RemitoPDF} propName="remito"
              sedeDe={(d) => d.cliente?.sedeNombre} tipo="remitos" eliminando={eliminando}
              onEliminar={(docId) => handleEliminar('remitos', eliminarRemito, docId, setRemitos, remitos)}
            />
          )}
          {tiposVisibles.recibos && (
            <SeccionPDF
              titulo="Recibos" Icono={Receipt} items={recibosFiltrados}
              rutaBase="/admin/recibos" PDFDoc={ReciboPDF} propName="recibo"
              montoField="monto" extraCol={{ header: 'Concepto', render: (d) => d.concepto || '-' }}
              sedeDe={(d) => d.sedeNombre} tipo="recibos" eliminando={eliminando}
              onEliminar={(docId) => handleEliminar('recibos', eliminarRecibo, docId, setRecibos, recibos)}
            />
          )}
          {tiposVisibles.facturas && (
            <SeccionArchivos
              titulo="Facturas" Icono={Banknote} items={facturasFiltradas}
              rutaBase="/admin/facturas" nombreField="numero" montoField="monto"
              badge={(d) => <EstadoFacturaBadge estado={d.estado} />}
              sedeDe={(d) => d.sedeNombre} tipo="facturas" eliminando={eliminando}
              onEliminar={(docId) => handleEliminar('facturas', eliminarFactura, docId, setFacturas, facturas)}
            />
          )}
          {tiposVisibles.certificados && (
            <SeccionArchivos
              titulo="Certificados" Icono={Award} items={certificadosFiltrados}
              rutaBase="/admin/certificados" nombreField="nombre"
              extraCol={{ header: 'Descripción', render: (d) => d.descripcion || '-' }}
              sedeDe={(d) => d.sedeNombre} tipo="certificados" eliminando={eliminando}
              onEliminar={(docId) => handleEliminar('certificados', eliminarCertificado, docId, setCertificados, certificados)}
            />
          )}
          {tiposVisibles.estados && (
            <SeccionPDF
              titulo="Estados de Cuenta" Icono={DollarSign} items={estadosFiltrados}
              rutaBase="/admin/estados" PDFDoc={EstadoPDF} propName="estado"
              montoField="total"
              sedeDe={(d) => d.cliente?.sedeNombre} tipo="estados" eliminando={eliminando}
              onEliminar={(docId) => handleEliminar('estados', eliminarEstado, docId, setEstados, estados)}
            />
          )}
          {tiposVisibles.ordenes && (
            <SeccionPDF
              titulo="Órdenes de Trabajo" Icono={ClipboardList} items={ordenesFiltradas}
              rutaBase="/admin/ordenes-trabajo"
              sedeDe={(d) => d.cliente?.sedeNombre} tipo="ordenes" eliminando={eliminando}
              onEliminar={(docId) => handleEliminar('ordenes', eliminarOrdenTrabajo, docId, setOrdenes, ordenes)}
              renderDescarga={(item) => (
                <DescargarOrdenTrabajoPDF orden={item} className={accionIconoClase('primary')}>
                  <Download size={ACCION_ICONO_TAMANO} />
                </DescargarOrdenTrabajoPDF>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function DocumentosClientePage({ params }) {
  return (
    <Suspense fallback={null}>
      <DocumentosCliente params={params} />
    </Suspense>
  );
}
