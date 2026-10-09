// app/lib/compartirPdf.js
// En el iPhone, con la app instalada en la pantalla de inicio (PWA), un link
// <a download> a un blob no descarga nada: Safari standalone ignora el
// atributo download y no hay forma de guardar el PDF. Ahí se usa el menú de
// compartir del sistema, que ofrece "Guardar en Archivos", WhatsApp, Mail...
//
// Pensado como onClick de PDFDownloadLink, que recibe (event, instance) con
// el PDF ya generado: navigator.share exige que se llame dentro del mismo
// toque del usuario, sin esperas de por medio. En cualquier otro navegador
// no hace nada y el link descarga como siempre.
const esPwaIOS = () => typeof window !== 'undefined' && window.navigator.standalone === true;

export function compartirPdfEnPwaIOS(event, blob, fileName) {
  if (!esPwaIOS() || !blob) return;

  const archivo = new File([blob], fileName, { type: 'application/pdf' });
  if (!navigator.canShare?.({ files: [archivo] })) return;

  event.preventDefault();
  navigator.share({ files: [archivo] }).catch((error) => {
    // AbortError = el usuario cerró el menú de compartir.
    if (error.name === 'AbortError') return;
    console.error('Error al compartir el PDF:', error);
    alert('No se pudo compartir el PDF. Inténtelo de nuevo.');
  });
}
