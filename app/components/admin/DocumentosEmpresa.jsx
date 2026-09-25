// app/components/admin/DocumentosEmpresa.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Eye, Edit, Trash, Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import {
  obtenerDocumentosDeEmpresa,
  eliminarPresupuesto,
  eliminarRemito,
  eliminarRecibo,
  eliminarFactura,
  eliminarCertificado,
  eliminarEstado,
  eliminarOrdenTrabajo,
  eliminarMantenimientoPreventivo,
  eliminarDocumento
} from '../../lib/firestore';
import { TIPOS_DOC } from '../../lib/documentosCliente';
import ViewToggle from './ViewToggle';
import { accionIconoClase, ACCION_ICONO_TAMANO } from './accionIcono';
import { formatearFecha } from '../../lib/fecha';
import PresupuestoPDF from '../pdf/PresupuestoPDF';
import RemitoPDF from '../pdf/RemitoPDF';
import ReciboPDF from '../pdf/ReciboPDF';
import EstadoPDF from '../pdf/EstadoPDF';
import DocumentoPDF from '../pdf/DocumentoPDF';
import DescargarOrdenTrabajoPDF from '../pdf/DescargarOrdenTrabajoPDF';
import DescargarMantenimientoPreventivoPDF from '../pdf/DescargarMantenimientoPreventivoPDF';
import { EstadoFacturaBadge } from '../ui/EstadoFactura';

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

// Tabla genérica para documentos generados con @react-pdf/renderer
// (presupuesto/remito/recibo/estado/orden), que comparten forma: numero,
// fecha, sede + acciones Ver/Descargar/Editar/Eliminar.
function SeccionPDF({ titulo, Icono, items, rutaBase, PDFDoc, propName, montoField, badge, extraCol, sedeDe, tipo, onEliminar, eliminando, renderDescarga, vista }) {
  const Acciones = ({ item }) => (
    <>
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
    </>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-700">
        <Icono size={18} className="text-primary" /> {titulo}
        <span className="text-sm font-normal text-gray-400">({items.length})</span>
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No hay {titulo.toLowerCase()} para esta empresa con el filtro actual.</p>
      ) : vista === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="mb-1">
                <BadgeSede nombre={sedeDe(item)} />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-medium text-gray-900">{item.numero}</div>
                <div className="text-xs text-gray-500 whitespace-nowrap">{formatFecha(item)}</div>
              </div>
              {extraCol && (
                <div className="mt-1 text-sm text-gray-500 line-clamp-2" title={extraCol.render(item)}>{extraCol.render(item)}</div>
              )}
              {(montoField || badge) && (
                <div className="flex items-center justify-between mt-1">
                  {montoField && <div className="text-sm font-medium text-gray-900">{formatMoney(item[montoField])}</div>}
                  {badge && badge(item)}
                </div>
              )}

              <div className="flex justify-end pt-3 mt-3 gap-1 border-t border-gray-100">
                <Acciones item={item} />
              </div>
            </div>
          ))}
        </div>
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
                      <Acciones item={item} />
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
function SeccionArchivos({ titulo, Icono, items, rutaBase, nombreField, montoField, badge, extraCol, sedeDe, tipo, onEliminar, eliminando, vista }) {
  const Acciones = ({ item }) => {
    const archivos = item.archivos || [];
    return (
      <>
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
      </>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-700">
        <Icono size={18} className="text-primary" /> {titulo}
        <span className="text-sm font-normal text-gray-400">({items.length})</span>
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No hay {titulo.toLowerCase()} para esta empresa con el filtro actual.</p>
      ) : vista === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="mb-1">
                <BadgeSede nombre={sedeDe(item)} />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-medium text-gray-900">{item[nombreField]}</div>
                <div className="text-xs text-gray-500 whitespace-nowrap">{formatFecha(item)}</div>
              </div>
              {extraCol && (
                <div className="mt-1 text-sm text-gray-500 line-clamp-2" title={extraCol.render(item)}>{extraCol.render(item)}</div>
              )}
              {(montoField || badge) && (
                <div className="flex items-center justify-between mt-1">
                  {montoField && <div className="text-sm font-medium text-gray-900">{formatMoney(item[montoField])}</div>}
                  {badge && badge(item)}
                </div>
              )}

              <div className="flex justify-end pt-3 mt-3 gap-1 border-t border-gray-100">
                <Acciones item={item} />
              </div>
            </div>
          ))}
        </div>
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
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{item[nombreField]}</td>
                  <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">{formatFecha(item)}</td>
                  <td className="px-4 py-2 text-sm whitespace-nowrap"><BadgeSede nombre={sedeDe(item)} /></td>
                  {extraCol && <td className="max-w-xs px-4 py-2 text-sm text-gray-500 truncate">{extraCol.render(item)}</td>}
                  {montoField && <td className="px-4 py-2 text-sm font-medium text-right text-gray-900 whitespace-nowrap">{formatMoney(item[montoField])}</td>}
                  {badge && <td className="px-4 py-2 whitespace-nowrap">{badge(item)}</td>}
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Acciones item={item} />
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

const ELIMINAR = {
  presupuesto: eliminarPresupuesto,
  remito: eliminarRemito,
  recibo: eliminarRecibo,
  factura: eliminarFactura,
  certificado: eliminarCertificado,
  estado: eliminarEstado,
  orden: eliminarOrdenTrabajo,
  mantenimiento: eliminarMantenimientoPreventivo,
  informe: eliminarDocumento
};

const TITULOS = {
  presupuesto: 'Presupuestos',
  remito: 'Remitos',
  recibo: 'Recibos',
  factura: 'Facturas',
  certificado: 'Certificados',
  estado: 'Estados de Cuenta',
  orden: 'Órdenes de Trabajo',
  mantenimiento: 'Mantenimiento Preventivo',
  informe: 'Informes'
};

const VACIOS =Object.fromEntries(Object.keys(TIPOS_DOC).map((t) => [t, []]));

// Documentos emitidos a una empresa, agrupados por tipo y filtrables por
// sede (por id: `sedeInicial` viene del link ?sede= de los listados).
export default function DocumentosEmpresa({ empresa, sedeInicial = 'todas' }) {
  const [documentos, setDocumentos] = useState(VACIOS);
  const [cargando, setCargando] = useState(true);
  const [sedeFiltro, setSedeFiltro] = useState(sedeInicial);
  const [tiposVisibles, setTiposVisibles] = useState(() => new Set(Object.keys(TIPOS_DOC)));
  const [eliminando, setEliminando] = useState(null);
  const [vista, setVista] = useState('tabla');

  useEffect(() => setSedeFiltro(sedeInicial), [sedeInicial]);

  useEffect(() => {
    const tipos = Object.keys(TIPOS_DOC);
    Promise.all(tipos.map((t) => obtenerDocumentosDeEmpresa(t, empresa.id)))
      .then((resultados) => {
        const porTipo = Object.fromEntries(tipos.map((t, i) => [t, resultados[i]]));
        // Los informes no tienen número correlativo, solo un título de texto
        // libre: se usa como "número" para listarlos con la misma tabla.
        porTipo.informe = porTipo.informe.map((d) => ({ ...d, numero: d.titulo || 'Informe' }));
        setDocumentos(porTipo);
      })
      .catch((error) => console.error('Error al cargar los documentos de la empresa:', error))
      .finally(() => setCargando(false));
  }, [empresa.id]);

  const nombreSede = useMemo(() => {
    const porId = new Map((empresa.sedes || []).map((s) => [s.id, s.nombre]));
    return (d) => porId.get(d.sedeId) || d.cliente?.sedeNombre || d.sedeNombre;
  }, [empresa.sedes]);

  // Sedes con documentos (incluidas las archivadas) para el filtro.
  const sedesConDocumentos = useMemo(() => {
    const ids = new Set(Object.values(documentos).flat().map((d) => d.sedeId).filter(Boolean));
    return (empresa.sedes || []).filter((s) => ids.has(s.id));
  }, [documentos, empresa.sedes]);

  const filtrados = useMemo(() => Object.fromEntries(Object.entries(documentos).map(([t, items]) => [
    t, sedeFiltro === 'todas' ? items : items.filter((d) => d.sedeId === sedeFiltro)
  ])), [documentos, sedeFiltro]);

  const total = Object.values(documentos).reduce((n, items) => n + items.length, 0);

  const toggleTipo = (tipo) => setTiposVisibles((prev) => {
    const nuevo = new Set(prev);
    if (nuevo.has(tipo)) nuevo.delete(tipo); else nuevo.add(tipo);
    return nuevo;
  });

  const handleEliminar = async (tipo, docId) => {
    if (!confirm('¿Eliminar este documento? Esta acción no se puede deshacer.')) return;
    setEliminando(`${tipo}:${docId}`);
    try {
      await ELIMINAR[tipo](docId);
      setDocumentos((prev) => ({ ...prev, [tipo]: prev[tipo].filter((d) => d.id !== docId) }));
    } catch (error) {
      console.error(`Error al eliminar (${tipo}):`, error);
      alert('Error al eliminar el documento. Inténtelo de nuevo más tarde.');
    } finally {
      setEliminando(null);
    }
  };

  if (cargando) {
    return <p className="py-6 text-sm text-center text-gray-400">Cargando documentos...</p>;
  }

  const comunes = (tipo) => ({
    titulo: TITULOS[tipo],
    Icono: TIPOS_DOC[tipo].icono,
    items: filtrados[tipo],
    sedeDe: nombreSede,
    tipo,
    eliminando,
    vista,
    onEliminar: (docId) => handleEliminar(tipo, docId)
  });

  return (
    <>
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
              {sedesConDocumentos.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}{s.activa === false ? ' (archivada)' : ''}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-4">
            <p className="text-sm text-gray-400">{total} documentos en total</p>
            <ViewToggle vista={vista} onChange={setVista} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(TIPOS_DOC).map(([tipo, { label, icono: Icono }]) => (
            <button
              key={tipo}
              type="button"
              onClick={() => toggleTipo(tipo)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${tiposVisibles.has(tipo)
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
        {tiposVisibles.has('presupuesto') && (
          <SeccionPDF
            {...comunes('presupuesto')}
            rutaBase="/admin/presupuestos" PDFDoc={PresupuestoPDF} propName="presupuesto"
            montoField="total" badge={(d) => <BadgePresupuesto estado={d.estado} />}
          />
        )}
        {tiposVisibles.has('remito') && (
          <SeccionPDF {...comunes('remito')} rutaBase="/admin/remitos" PDFDoc={RemitoPDF} propName="remito" />
        )}
        {tiposVisibles.has('recibo') && (
          <SeccionPDF
            {...comunes('recibo')}
            rutaBase="/admin/recibos" PDFDoc={ReciboPDF} propName="recibo"
            montoField="monto" extraCol={{ header: 'Concepto', render: (d) => d.concepto || '-' }}
          />
        )}
        {tiposVisibles.has('factura') && (
          <SeccionArchivos
            {...comunes('factura')}
            rutaBase="/admin/facturas" nombreField="numero" montoField="monto"
            badge={(d) => <EstadoFacturaBadge estado={d.estado} />}
          />
        )}
        {tiposVisibles.has('certificado') && (
          <SeccionArchivos
            {...comunes('certificado')}
            rutaBase="/admin/certificados" nombreField="nombre"
            extraCol={{ header: 'Descripción', render: (d) => d.descripcion || '-' }}
          />
        )}
        {tiposVisibles.has('estado') && (
          <SeccionPDF {...comunes('estado')} rutaBase="/admin/estados" PDFDoc={EstadoPDF} propName="estado" montoField="total" />
        )}
        {tiposVisibles.has('orden') && (
          <SeccionPDF
            {...comunes('orden')}
            rutaBase="/admin/ordenes-trabajo"
            renderDescarga={(item) => (
              <DescargarOrdenTrabajoPDF orden={item} className={accionIconoClase('primary')}>
                <Download size={ACCION_ICONO_TAMANO} />
              </DescargarOrdenTrabajoPDF>
            )}
          />
        )}
        {tiposVisibles.has('mantenimiento') && (
          <SeccionPDF
            {...comunes('mantenimiento')}
            rutaBase="/admin/mantenimiento-preventivo"
            renderDescarga={(item) => (
              <DescargarMantenimientoPreventivoPDF mantenimiento={item} className={accionIconoClase('primary')}>
                <Download size={ACCION_ICONO_TAMANO} />
              </DescargarMantenimientoPreventivoPDF>
            )}
          />
        )}
        {tiposVisibles.has('informe') && (
          <SeccionPDF
            {...comunes('informe')}
            rutaBase="/admin/informes" PDFDoc={DocumentoPDF} propName="documento"
            extraCol={{ header: 'Contenido', render: (d) => d.contenido || '-' }}
          />
        )}
      </div>
    </>
  );
}
