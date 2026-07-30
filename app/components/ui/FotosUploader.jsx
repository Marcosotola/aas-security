// app/components/ui/FotosUploader.jsx
'use client';

import { useEffect, useRef } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';

// Selector de fotos para la Orden de Trabajo: permite elegir varias imágenes
// a la vez desde la galería o sacar una foto con la cámara del dispositivo.
// No sube nada a Storage acá: solo mantiene los File en memoria (con su
// preview) y avisa al padre vía onChange. La subida real ocurre recién al
// guardar el documento (ver ordenes-trabajo/nueva/page.js).
export default function FotosUploader({ fotos, onChange }) {
  const galeriaInputRef = useRef(null);
  const camaraInputRef = useRef(null);

  // Libera los object URLs de preview cuando el componente se desmonta, para
  // no filtrar memoria del navegador.
  useEffect(() => {
    return () => {
      fotos.forEach((foto) => URL.revokeObjectURL(foto.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const agregarArchivos = (fileList) => {
    const nuevasFotos = Array.from(fileList).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    onChange([...fotos, ...nuevasFotos]);
  };

  const handleInputChange = (e) => {
    if (e.target.files?.length) {
      agregarArchivos(e.target.files);
    }
    e.target.value = '';
  };

  const quitarFoto = (index) => {
    const foto = fotos[index];
    URL.revokeObjectURL(foto.previewUrl);
    onChange(fotos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => galeriaInputRef.current?.click()}
          className="flex items-center px-4 py-2 text-sm text-white transition-colors rounded-md bg-secondary hover:bg-secondary-light"
        >
          <ImagePlus size={18} className="mr-2" /> Elegir de galería
        </button>
        <button
          type="button"
          onClick={() => camaraInputRef.current?.click()}
          className="flex items-center px-4 py-2 text-sm text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
        >
          <Camera size={18} className="mr-2" /> Usar cámara
        </button>
      </div>

      <input
        ref={galeriaInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />
      <input
        ref={camaraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />

      {fotos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-3 md:grid-cols-4">
          {fotos.map((foto, index) => (
            <div key={foto.previewUrl} className="relative overflow-hidden border border-gray-200 rounded-md aspect-square group">
              <img src={foto.previewUrl} alt={`Foto ${index + 1}`} className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={() => quitarFoto(index)}
                title="Quitar foto"
                className="absolute flex items-center justify-center w-6 h-6 text-white transition-colors bg-black/60 rounded-full top-1 right-1 hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {fotos.length === 0 && (
        <p className="mt-3 text-sm text-gray-400">Todavía no se adjuntaron fotos.</p>
      )}
    </div>
  );
}
