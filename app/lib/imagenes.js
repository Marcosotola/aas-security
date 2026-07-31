// app/lib/imagenes.js
// @react-pdf/renderer no siempre logra traer imágenes remotas de forma
// confiable (falla en silencio y el PDF sale sin fotos) -- se observa sobre
// todo con URLs de Firebase Storage. La solución es convertirlas a base64
// antes de pasarlas al documento, el mismo mecanismo que ya usan las firmas.

// Lee un File/Blob tal cual, sin procesar, como data URI base64.
const leerComoBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

// Redimensiona una imagen a un máximo de `maxDimension` px de lado más largo
// y la devuelve como data URI JPEG. Las fotos de un celular sin comprimir
// pueden pesar varios MB cada una; en el PDF se muestran chicas (~150pt), así
// que embeberlas a resolución completa infla el documento y, con varias
// fotos grandes juntas, algunas terminaban saliendo en blanco en el PDF.
const comprimirImagen = (blob, maxDimension = 1600, calidad = 0.82) => new Promise((resolve, reject) => {
  const objectUrl = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(objectUrl);
    try {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', calidad));
    } catch (error) {
      reject(error);
    }
  };
  img.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('No se pudo procesar la imagen'));
  };
  img.src = objectUrl;
});

// Convierte un File/Blob a data URI para el PDF, comprimiéndolo primero. Si
// la compresión falla (formato que <canvas> no puede decodificar, etc.) cae
// al base64 sin comprimir en vez de perder la foto.
const aBase64Comprimido = async (blob) => {
  try {
    return await comprimirImagen(blob);
  } catch (error) {
    console.error('No se pudo comprimir la imagen, se usa sin comprimir:', error);
    return leerComoBase64(blob);
  }
};

// Convierte un File local (ej. recién elegido en un input) a data URI base64.
export const archivoABase64 = (file) => aBase64Comprimido(file);

// Convierte una imagen remota (ej. URL de Firebase Storage) a data URI base64.
// El fetch se hace vía /api/planillas/imagen (proxy del propio servidor) y no
// directo a Storage: el bucket no tiene CORS habilitado para lectura de
// bytes desde el navegador, así que un fetch() directo falla con
// "TypeError: Failed to fetch" aunque la misma URL sí cargue en un <img src>.
export const urlABase64 = async (url) => {
  const response = await fetch(`/api/planillas/imagen?url=${encodeURIComponent(url)}`);
  if (!response.ok) throw new Error('No se pudo obtener la imagen');
  const blob = await response.blob();
  return aBase64Comprimido(blob);
};

// fotos: [{ url, path }] -> [{ url: <base64>, path }]
export const fotosABase64 = async (fotos) => {
  if (!fotos?.length) return [];
  return Promise.all(fotos.map(async (foto) => ({ ...foto, url: await urlABase64(foto.url) })));
};
