// app/components/ui/ArchivosPdfUploader.jsx
'use client';

import { useRef } from 'react';
import { FileUp, FileText, X } from 'lucide-react';

// Selector de PDFs para Facturas: permite elegir uno o varios archivos a
// la vez. No sube nada a Storage acá: solo mantiene los File en memoria y
// avisa al padre vía onChange. La subida real ocurre al guardar la factura
// (mismo criterio que FotosUploader con las fotos de Órdenes de Trabajo).
export default function ArchivosPdfUploader({ archivos, onChange }) {
  const inputRef = useRef(null);

  const agregarArchivos = (fileList) => {
    const nuevos = Array.from(fileList)
      .filter((file) => file.type === 'application/pdf')
      .map((file) => ({ file }));
    onChange([...archivos, ...nuevos]);
  };

  const handleInputChange = (e) => {
    if (e.target.files?.length) {
      agregarArchivos(e.target.files);
    }
    e.target.value = '';
  };

  const quitarArchivo = (index) => {
    onChange(archivos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center px-4 py-2 text-sm text-white transition-colors rounded-md bg-secondary hover:bg-secondary-light"
      >
        <FileUp size={18} className="mr-2" /> Elegir PDF
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />

      {archivos.length > 0 && (
        <ul className="mt-3 space-y-2">
          {archivos.map((archivo, index) => (
            <li key={`${archivo.file.name}-${index}`} className="flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50">
              <span className="flex items-center flex-1 min-w-0 gap-2 text-gray-700">
                <FileText size={16} className="shrink-0 text-primary" />
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
        <p className="mt-3 text-sm text-gray-400">Todavía no se adjuntó ningún PDF.</p>
      )}
    </div>
  );
}
