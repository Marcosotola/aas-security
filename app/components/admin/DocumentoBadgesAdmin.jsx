// app/components/admin/DocumentoBadgesAdmin.jsx
'use client';

import Link from 'next/link';
import { Eye, Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { accionIconoClase, ACCION_ICONO_TAMANO } from './accionIcono';
import DescargarOrdenTrabajoPDF from '../pdf/DescargarOrdenTrabajoPDF';
import PresupuestoPDF from '../pdf/PresupuestoPDF';
import RemitoPDF from '../pdf/RemitoPDF';
import ReciboPDF from '../pdf/ReciboPDF';
import EstadoPDF from '../pdf/EstadoPDF';
// BadgeSede y CeldaEstado son genéricos (no dependen de estar viendo los
// documentos de un solo cliente), así que se reutilizan tal cual del portal
// del cliente en vez de duplicarlos acá.
export { BadgeSede, CeldaEstado } from '../cliente/DocumentoBadges';

const RUTA_BASE = {
  presupuesto: '/admin/presupuestos',
  remito: '/admin/remitos',
  recibo: '/admin/recibos',
  factura: '/admin/facturas',
  certificado: '/admin/certificados',
  estado: '/admin/estados',
  orden: '/admin/ordenes-trabajo'
};

const PDF_COMPONENTS = {
  presupuesto: { Component: PresupuestoPDF, propName: 'presupuesto' },
  remito: { Component: RemitoPDF, propName: 'remito' },
  recibo: { Component: ReciboPDF, propName: 'recibo' },
  estado: { Component: EstadoPDF, propName: 'estado' }
};

// Badge con el nombre del cliente, linkeado a su ficha (con clienteId) —
// mismo criterio que SedeLink.jsx, pero para el nombre en vez de la sede.
export function BadgeCliente({ doc }) {
  if (!doc.clienteNombre) return <span className="text-sm text-gray-400">-</span>;
  if (!doc.clienteId) return <span className="text-sm text-gray-700">{doc.clienteNombre}</span>;
  return (
    <Link href={`/admin/usuarios/${doc.clienteId}`} className="text-sm text-gray-700 hover:text-primary hover:underline">
      {doc.clienteNombre}
    </Link>
  );
}

// "Ver" acá manda al detalle del documento (no a abrir el PDF, como en el
// portal del cliente) — Editar/Eliminar quedan en esa página de detalle en
// vez de duplicarse acá, para no repetir el manejo de estado por tipo que ya
// tiene cada listado (app/admin/presupuestos/page.js, etc.).
export function AccionesDocumentoAdmin({ doc }) {
  const rutaBase = RUTA_BASE[doc.tipo];
  // JSX no acepta una expresión de miembro (PDF_COMPONENTS[doc.tipo].Component)
  // directo como nombre de tag, así que se resuelve antes a una variable.
  const pdfInfo = PDF_COMPONENTS[doc.tipo];
  const PdfComponent = pdfInfo?.Component;

  return (
    <span className="inline-flex items-center gap-1">
      <Link href={`${rutaBase}/${doc.id}`} title="Ver detalles" className={accionIconoClase('gray')}>
        <Eye size={ACCION_ICONO_TAMANO} />
      </Link>

      {doc.tipo === 'orden' ? (
        <DescargarOrdenTrabajoPDF orden={doc.raw} className={accionIconoClase('primary')}>
          <Download size={ACCION_ICONO_TAMANO} />
        </DescargarOrdenTrabajoPDF>
      ) : doc.tipo === 'factura' || doc.tipo === 'certificado' ? (
        (doc.archivos || []).length > 0 ? (
          <a
            href={doc.archivos[0].url}
            target="_blank"
            rel="noopener noreferrer"
            title="Descargar"
            className={accionIconoClase('primary')}
          >
            <Download size={ACCION_ICONO_TAMANO} />
          </a>
        ) : (
          <span className={`${accionIconoClase('gray')} text-gray-300 hover:bg-transparent`}>
            <Download size={ACCION_ICONO_TAMANO} />
          </span>
        )
      ) : (
        <PDFDownloadLink
          document={<PdfComponent {...{ [pdfInfo.propName]: doc.raw }} />}
          fileName={`${doc.numero}.pdf`}
          title="Descargar PDF"
          className={accionIconoClase('primary')}
        >
          {({ loading }) => <Download size={ACCION_ICONO_TAMANO} className={loading ? 'animate-pulse' : ''} />}
        </PDFDownloadLink>
      )}
    </span>
  );
}
