// app/components/ui/CompartirDocumentoModal.jsx
'use client';

import { useState } from 'react';
import { pdf, PDFDownloadLink } from '@react-pdf/renderer';
import { CheckCircle2, Share2, Download, List } from 'lucide-react';
import { construirLinkWhatsApp } from '../../lib/whatsapp';

// Se muestra apenas se guarda un documento (presupuesto, recibo, remito,
// estado de cuenta, hoja membretada). Antes había que ir a la lista, entrar
// al detalle, descargar el PDF y recién ahí compartirlo a mano; acá se ofrece
// compartir directo con el share nativo del dispositivo (adjunta el PDF ya
// generado) y, si el navegador no lo soporta, se descarga el PDF y se abre
// WhatsApp para que el usuario solo tenga que adjuntarlo.
export default function CompartirDocumentoModal({
  abierto,
  pdfElement,
  fileName,
  tipo,
  numero,
  telefono,
  onIrALista
}) {
  const [compartiendo, setCompartiendo] = useState(false);

  if (!abierto) return null;

  const handleCompartir = async () => {
    setCompartiendo(true);
    try {
      const blob = await pdf(pdfElement).toBlob();
      const file = new File([blob], fileName, { type: 'application/pdf' });
      const texto = `Te comparto ${tipo.toLowerCase()} ${numero}.`;

      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `${tipo} ${numero}`, text: texto });
      } else {
        // Fallback para navegadores sin soporte de share con archivos (ej. desktop):
        // descarga el PDF y, si hay teléfono cargado, abre WhatsApp con el mensaje listo
        // para que el usuario solo tenga que adjuntar el archivo ya descargado.
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        const linkWhatsApp = construirLinkWhatsApp(telefono, texto);
        if (linkWhatsApp) {
          window.open(linkWhatsApp, '_blank', 'noopener,noreferrer');
        }
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('Error al compartir el documento:', error);
        alert('No se pudo compartir el documento. Podés descargarlo con el botón de abajo.');
      }
    } finally {
      setCompartiendo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/50 sm:items-center sm:p-4">
      <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-t-2xl sm:rounded-2xl">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex items-center justify-center w-14 h-14 mb-3 rounded-full bg-green-100">
            <CheckCircle2 size={32} className="text-success" />
          </div>
          <h3 className="text-xl font-bold font-montserrat text-primary">
            ¡{tipo} guardado!
          </h3>
          <p className="text-sm text-gray-500">N° {numero}</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleCompartir}
            disabled={compartiendo}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-medium text-white transition-colors rounded-md bg-primary hover:bg-primary-light disabled:opacity-50"
          >
            {compartiendo ? (
              <span className="inline-block w-4 h-4 border-t-2 border-white rounded-full animate-spin" />
            ) : (
              <Share2 size={18} />
            )}
            {compartiendo ? 'Compartiendo...' : 'Compartir'}
          </button>

          <PDFDownloadLink
            document={pdfElement}
            fileName={fileName}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-medium transition-colors border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {({ loading }) =>
              loading ? (
                'Generando PDF...'
              ) : (
                <>
                  <Download size={18} /> Descargar PDF
                </>
              )
            }
          </PDFDownloadLink>

          <button
            type="button"
            onClick={onIrALista}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <List size={16} /> Ir a la lista
          </button>
        </div>
      </div>
    </div>
  );
}
