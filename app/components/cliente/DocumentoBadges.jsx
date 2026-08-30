// app/components/cliente/DocumentoBadges.jsx
'use client';

import { MapPin, Eye, Download, FileText } from 'lucide-react';
import { accionIconoClase, ACCION_ICONO_TAMANO } from '../admin/accionIcono';
import VerDescargarPDF from '../pdf/VerDescargarPDF';
import DescargarOrdenTrabajoPDF from '../pdf/DescargarOrdenTrabajoPDF';
import PresupuestoPDF from '../pdf/PresupuestoPDF';
import RemitoPDF from '../pdf/RemitoPDF';
import ReciboPDF from '../pdf/ReciboPDF';
import EstadoPDF from '../pdf/EstadoPDF';
import { EstadoFacturaBadge } from '../ui/EstadoFactura';

// Solo los tipos generados con @react-pdf/renderer necesitan el componente
// PDF acá: factura/certificado se descargan del archivo subido directo, y
// orden usa DescargarOrdenTrabajoPDF (convierte fotos a base64 antes, ver ese
// componente). Compartido entre app/cuenta/page.js (buscador de Inicio) y
// app/cuenta/documentos/page.js (hub) para no duplicar esta lógica.
const PDF_COMPONENTS = {
  presupuesto: { Component: PresupuestoPDF, propName: 'presupuesto' },
  remito: { Component: RemitoPDF, propName: 'remito' },
  recibo: { Component: ReciboPDF, propName: 'recibo' },
  estado: { Component: EstadoPDF, propName: 'estado' }
};

export function BadgeSede({ nombre }) {
  if (!nombre) return <span className="text-sm text-gray-400">-</span>;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 rounded-full bg-blue-50">
      <MapPin size={11} /> {nombre}
    </span>
  );
}

export function CeldaEstado({ doc }) {
  if (doc.tipo === 'factura') return <EstadoFacturaBadge estado={doc.estado} />;
  if (doc.tipo === 'presupuesto') {
    const estado = doc.estado || 'Pendiente';
    const clase =
      estado === 'Aprobado' ? 'bg-green-100 text-green-800' :
      estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
      'bg-yellow-100 text-yellow-800';
    return <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${clase}`}>{estado}</span>;
  }
  return <span className="text-sm text-gray-400">-</span>;
}

export function AccionesDocumento({ doc }) {
  if (doc.tipo === 'orden') {
    return (
      <span className="inline-flex items-center gap-1">
        <DescargarOrdenTrabajoPDF orden={doc.raw} modo="ver" className={accionIconoClase('gray')}>
          <Eye size={ACCION_ICONO_TAMANO} />
        </DescargarOrdenTrabajoPDF>
        <DescargarOrdenTrabajoPDF orden={doc.raw} modo="descargar" className={accionIconoClase('primary')}>
          <Download size={ACCION_ICONO_TAMANO} />
        </DescargarOrdenTrabajoPDF>
      </span>
    );
  }

  if (doc.tipo === 'factura' || doc.tipo === 'certificado') {
    const archivos = doc.archivos || [];
    if (archivos.length === 0) return <FileText size={18} className="text-gray-300" />;
    return (
      <span className="inline-flex items-center gap-1">
        {archivos.map((archivo, index) => (
          <a
            key={archivo.path || index}
            href={archivo.url}
            target="_blank"
            rel="noopener noreferrer"
            title={archivo.nombre || 'Descargar'}
            className={accionIconoClase('primary')}
          >
            <Download size={ACCION_ICONO_TAMANO} />
          </a>
        ))}
      </span>
    );
  }

  const { Component, propName } = PDF_COMPONENTS[doc.tipo];
  return <VerDescargarPDF documento={<Component {...{ [propName]: doc.raw }} />} fileName={`${doc.numero}.pdf`} />;
}
