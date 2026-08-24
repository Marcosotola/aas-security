'use client';

import { useEffect, useRef } from 'react';
import { FileUp, FileText, X } from 'lucide-react';

const esImagen = (file) => file.type.startsWith('image/');
const esAceptado = (file) => esImagen(file) || file.type === 'application/pdf';

// Selector de archivos para Certificados: a diferencia de ArchivosPdfUploader
// (solo PDF) acepta fotos o PDF mezclados, con preview de imagen para las
// fotos e ícono de archivo para los PDF. No sube nada a Storage acá: solo
// mantiene los File en memoria y avisa al padre vía onChange (mismo criterio
// que FotosUploader/ArchivosPdfUploader: la subida real ocurre al guardar).
// Un solo input (sin botón aparte de cámara): en mobile, el selector nativo
// ya ofrece elegir entre cámara o archivos/galería.
export default function ArchivosCertificadoUploader({ archivos, onChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      archivos.forEach((archivo) => archivo.previewUrl && URL.revokeObjectURL(archivo.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const agregarArchivos = (fileList) => {
    const nuevos = Array.from(fileList)
      .filter(esAceptado)
      .map((file) => ({ file, previewUrl: esImagen(file) ? URL.createObjectURL(file) : null }));
    onChange([...archivos, ...nuevos]);
  };

  const handleInputChange = (e) => {
    if (e.target.files?.length) {
      agregarArchivos(e.target.files);
    }
    e.target.value = '';
  };

  const quitarArchivo = (index) => {
    const archivo = archivos[index];
    if (archivo.previewUrl) URL.revokeObjectURL(archivo.previewUrl);
    onChange(archivos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center px-4 py-2 text-sm text-white transition-colors rounded-md bg-secondary hover:bg-secondary-light"
      >
        <FileUp size={18} className="mr-2" /> Elegir archivo
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />

      {archivos.length > 0 && (
        <ul className="mt-3 space-y-2">
          {archivos.map((archivo, index) => (
            <li key={`${archivo.file.name}-${index}`} className="flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50">
              <span className="flex items-center flex-1 min-w-0 gap-2 text-gray-700">
                {archivo.previewUrl ? (
                  <img src={archivo.previewUrl} alt={archivo.file.name} className="object-cover w-8 h-8 rounded shrink-0" />
                ) : (
                  <FileText size={16} className="shrink-0 text-primary" />
                )}
                <span className="truncate">{archivo.file.name}</span>
              </span>
              <button
                type="button"
                onClick={() => quitarArchivo(index)}
                title="Quitar archivo"
                className="ml-2 text-gray-400 shrink-0 hover:text-red-600"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {archivos.length === 0 && (
        <p className="mt-3 text-sm text-gray-400">Todavía no se adjuntó ningún archivo.</p>
      )}
    </div>
  );
}
