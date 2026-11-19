'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import CertificacionPDF from './CertificacionPDF';
import { fotosABase64, urlABase64 } from '../../lib/imagenes';

// Mismo criterio que DescargarOrdenTrabajoPDF: las imágenes de Storage se
// pasan a base64 recién al tocar el botón, antes de armar el PDF (fotos de la
// certificación, de las OT anexadas y credencial).

const opcional = (promesa) => promesa.catch((error) => {
  console.error('No se pudo cargar una imagen del certificado:', error);
  return null;
});

// Como fotosABase64, pero deja pasar las que ya son data URI (vista previa
// desde el formulario, con fotos todavía sin subir).
const fotosParaPdf = async (fotos) => {
  const remotas = (fotos || []).filter((f) => !f.url?.startsWith('data:'));
  const convertidas = await fotosABase64(remotas);
  let i = 0;
  return (fotos || []).map((f) => (f.url?.startsWith('data:') ? f : convertidas[i++]));
};

export async function generarBlobCertificacion(certificacion) {
  const certificador = certificacion.certificador || null;
  const [fotos, vinculados, credencial] = await Promise.all([
    fotosParaPdf(certificacion.fotos),
    Promise.all((certificacion.vinculados || []).map(async (v) => ({
      ...v,
      datos: { ...v.datos, fotos: await fotosParaPdf(v.datos?.fotos) }
    }))),
    certificador?.credencial ? opcional(urlABase64(certificador.credencial)) : null
  ]);

  const datos = {
    ...certificacion,
    fotos,
    vinculados,
    certificador: certificador ? { ...certificador, credencial } : null
  };
  return pdf(<CertificacionPDF certificacion={datos} />).toBlob();
}

export const nombreArchivoCertificacion = (c) => `Certificado-${c.numero || 'borrador'}${c.sistemaCertificado ? ` - ${c.sistemaCertificado}` : ''}`
  .replace(/[\\/:*?"<>|]/g, '-')
  .slice(0, 120) + '.pdf';

export default function DescargarCertificacionPDF({ certificacion, className, children, modo = 'descargar', title }) {
  const [generando, setGenerando] = useState(false);

  const handleClick = async () => {
    setGenerando(true);
    try {
      const blob = await generarBlobCertificacion(certificacion);
      const url = URL.createObjectURL(blob);
      if (modo === 'ver') {
        window.open(url, '_blank');
        // No se libera el blob: la pestaña del visor lo necesita para que su
        // botón Descargar/Imprimir funcione (liberado, Chrome falla con
        // "Comprueba la conexión"). Se libera al recargar o cerrar el panel.
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivoCertificacion(certificacion);
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Con un pequeño margen: liberarlo en el acto a veces corta la descarga.
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      }
    } catch (error) {
      console.error('Error al generar el PDF de la certificación:', error);
      alert('No se pudo generar el PDF. Inténtelo de nuevo.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <button type="button" onClick={handleClick} disabled={generando} className={className} title={title}>
      {generando ? (
        <span className="inline-block w-4 h-4 border-t-2 rounded-full animate-spin" style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }} />
      ) : (
        children
      )}
    </button>
  );
}
