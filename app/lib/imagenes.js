// app/lib/imagenes.js
// @react-pdf/renderer no siempre logra traer imágenes remotas de forma
// confiable (falla en silencio y el PDF sale sin fotos) -- se observa sobre
// todo con URLs de Firebase Storage. La solución es convertirlas a base64
// antes de pasarlas al documento, el mismo mecanismo que ya usan las firmas.

// Convierte un File local (ej. recién elegido en un input) a data URI base64.
export const archivoABase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

// Convierte una imagen remota (ej. URL de Firebase Storage) a data URI base64.
// El fetch se hace vía /api/planillas/imagen (proxy del propio servidor) y no
// directo a Storage: el bucket no tiene CORS habilitado para lectura de
// bytes desde el navegador, así que un fetch() directo falla con
// "TypeError: Failed to fetch" aunque la misma URL sí cargue en un <img src>.
export const urlABase64 = async (url) => {
  const response = await fetch(`/api/planillas/imagen?url=${encodeURIComponent(url)}`);
  if (!response.ok) throw new Error('No se pudo obtener la imagen');
  const blob = await response.blob();
  return archivoABase64(blob);
};

// fotos: [{ url, path }] -> [{ url: <base64>, path }]
export const fotosABase64 = async (fotos) => {
  if (!fotos?.length) return [];
  return Promise.all(fotos.map(async (foto) => ({ ...foto, url: await urlABase64(foto.url) })));
};
