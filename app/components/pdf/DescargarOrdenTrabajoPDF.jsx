'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import OrdenTrabajoPDF from './OrdenTrabajoPDF';
import { fotosABase64 } from '../../lib/imagenes';

// Reemplaza a PDFDownloadLink para la Orden de Trabajo: PDFDownloadLink arma
// el documento de forma síncrona con las URLs de Storage tal cual, y
// @react-pdf/renderer no siempre logra resolverlas (el PDF sale sin fotos).
// Acá se convierten a base64 recién al click, antes de generar el blob.
export default function DescargarOrdenTrabajoPDF({ orden, className, children, modo = 'descargar' }) {
  const [generando, setGenerando] = useState(false);

  const handleClick = async () => {
    setGenerando(true);
    try {
      const fotosBase64 = await fotosABase64(orden.fotos);
      const blob = await pdf(<OrdenTrabajoPDF orden={{ ...orden, fotos: fotosBase64 }} />).toBlob();
      const url = URL.createObjectURL(blob);
      if (modo === 'ver') {
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${orden.numero}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error al generar el PDF de la orden de trabajo:', error);
      alert('No se pudo generar el PDF. Inténtelo de nuevo.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <button type="button" onClick={handleClick} disabled={generando} className={className}>
      {generando ? (
        <span className="inline-block w-4 h-4 border-t-2 rounded-full animate-spin" style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }} />
      ) : (
        children
      )}
    </button>
  );
}
