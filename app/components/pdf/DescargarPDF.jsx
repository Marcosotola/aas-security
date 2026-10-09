'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';

// Reemplaza a PDFDownloadLink (mismas props: document, fileName, children).
// PDFDownloadLink arma el PDF apenas se muestra el botón y, hasta que
// termina, el link no tiene archivo: un toque en ese momento no hace nada y
// tampoco se reintenta. En el celular, con un listado que arma un PDF por
// fila a la vez, eso tarda varios segundos y parece que el botón "quedó
// presionado". Acá el PDF se genera recién al tocar, con el spinner visible
// hasta que se descarga.
//
// `children` puede ser una función ({ loading }) => contenido, como en
// PDFDownloadLink, o un contenido fijo (ej. solo el ícono), que mientras
// tanto se reemplaza por el spinner.
export default function DescargarPDF({ document: documentoPdf, fileName, className, title, disabled, children }) {
  const [generando, setGenerando] = useState(false);

  const handleClick = async () => {
    setGenerando(true);
    try {
      const blob = await pdf(documentoPdf).toBlob();
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = fileName;
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('No se pudo generar el PDF. Inténtelo de nuevo.');
    } finally {
      setGenerando(false);
    }
  };

  let contenido;
  if (typeof children === 'function') {
    contenido = children({ loading: generando });
  } else if (generando) {
    contenido = (
      <span className="inline-block w-4 h-4 border-t-2 rounded-full animate-spin" style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }} />
    );
  } else {
    contenido = children;
  }

  return (
    <button type="button" onClick={handleClick} disabled={disabled || generando} title={title} className={className}>
      {contenido}
    </button>
  );
}
