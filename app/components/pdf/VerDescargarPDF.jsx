'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Eye, Download } from 'lucide-react';

const Spinner = () => (
  <span className="inline-block w-4 h-4 border-t-2 rounded-full animate-spin" style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }} />
);

// Botones "Ver" (abre el PDF en una pestaña nueva) y "Descargar" para
// documentos livianos (presupuesto/remito/recibo) generados con
// @react-pdf/renderer. A diferencia de PDFDownloadLink, permite elegir entre
// visualizar o forzar la descarga.
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
    <span className="inline-flex items-center space-x-3">
      <button type="button" onClick={() => handleClick('ver')} disabled={!!generando} title="Ver PDF" className="text-gray-600 hover:text-primary disabled:opacity-50">
        {generando === 'ver' ? <Spinner /> : <Eye size={16} />}
      </button>
      <button type="button" onClick={() => handleClick('descargar')} disabled={!!generando} title="Descargar PDF" className="text-primary hover:text-primary-light disabled:opacity-50">
        {generando === 'descargar' ? <Spinner /> : <Download size={16} />}
      </button>
    </span>
  );
}
