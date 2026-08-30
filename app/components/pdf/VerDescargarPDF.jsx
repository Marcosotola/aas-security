'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Eye, Download } from 'lucide-react';

const Spinner = () => (
  <span className="inline-block w-4 h-4 border-t-2 rounded-full animate-spin" style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }} />
);

// Botones "Ver" (abre el PDF en una pestaña nueva) y "Descargar" para
// documentos livianos (presupuesto/remito/recibo/estado) generados con
// @react-pdf/renderer. A diferencia de PDFDownloadLink, permite elegir entre
// visualizar o forzar la descarga.
// Ícono de 20px + padding con fondo circular al hover (no 16px pelado): así
// el área táctil real queda pareja con accionIconoClase.js, que usan las
// otras acciones del hub de documentos (factura/certificado/orden) — ver
// app/cuenta/documentos/page.js.
export default function VerDescargarPDF({ documento, fileName }) {
  const [generando, setGenerando] = useState(null);

  const handleClick = async (modo) => {
    setGenerando(modo);
    try {
      const blob = await pdf(documento).toBlob();
      const url = URL.createObjectURL(blob);
      if (modo === 'ver') {
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else {
        const a = window.document.createElement('a');
        a.href = url;
        a.download = fileName;
        window.document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('No se pudo generar el PDF. Inténtelo de nuevo.');
    } finally {
      setGenerando(null);
    }
  };

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => handleClick('ver')}
        disabled={!!generando}
        title="Ver PDF"
        className="inline-flex items-center justify-center p-2.5 text-gray-600 transition-colors rounded-full hover:text-primary hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
      >
        {generando === 'ver' ? <Spinner /> : <Eye size={20} />}
      </button>
      <button
        type="button"
        onClick={() => handleClick('descargar')}
        disabled={!!generando}
        title="Descargar PDF"
        className="inline-flex items-center justify-center p-2.5 text-primary transition-colors rounded-full hover:text-primary-light hover:bg-primary/10 disabled:opacity-50 disabled:pointer-events-none"
      >
        {generando === 'descargar' ? <Spinner /> : <Download size={20} />}
      </button>
    </span>
  );
}
