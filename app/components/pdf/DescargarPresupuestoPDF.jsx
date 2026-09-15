'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import PresupuestoPDF from './PresupuestoPDF';

// Reemplaza a PDFDownloadLink mientras se está armando el presupuesto:
// PDFDownloadLink reconstruye y vuelve a renderizar el documento en cada
// cambio de estado (cada tecla, cada ítem agregado o eliminado), y ese
// reconciliador de @react-pdf/renderer no soporta bien actualizaciones tan
// rápidas y seguidas -especialmente cuando cambia la estructura del árbol,
// como al eliminar un ítem-, lo que termina tirando una excepción no
// controlada y rompe la página. Acá el PDF se genera una sola vez, recién
// al hacer click.
export default function DescargarPresupuestoPDF({ presupuesto, className, children }) {
  const [generando, setGenerando] = useState(false);

  const handleClick = async () => {
    setGenerando(true);
    try {
      const blob = await pdf(<PresupuestoPDF presupuesto={presupuesto} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${presupuesto.numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar el PDF del presupuesto:', error);
      alert('No se pudo generar el PDF. Inténtelo de nuevo.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <button type="button" onClick={handleClick} disabled={generando} className={className}>
      {generando ? (
        <span className="flex items-center">
          <span className="inline-block w-4 h-4 mr-2 border-t-2 border-white rounded-full animate-spin"></span>
          Generando PDF...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
