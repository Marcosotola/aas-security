// app/components/ui/FirmaCanvas.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Save, RefreshCw } from 'lucide-react';

// Bloque de firma digital reutilizable (canvas + aclaración + guardar/limpiar).
// Reproduce el mismo comportamiento que ya usan Remitos y Recibos, extraído
// acá porque la Orden de Trabajo necesita dos instancias (técnico y cliente).
export default function FirmaCanvas({ titulo, aclaracionLabel = 'Aclaración de firma', firma, aclaracion, onGuardar, onAclaracionChange }) {
  const sigCanvas = useRef(null);
  const [showCanvas, setShowCanvas] = useState(!firma);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 200 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setCanvasSize({ width: containerRef.current.offsetWidth - 4, height: 200 });
      }
    };

    if (showCanvas) {
      handleResize();
      window.addEventListener('resize', handleResize);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [showCanvas]);

  const guardarFirma = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const firmaData = sigCanvas.current.toDataURL('image/png');
      onGuardar(firmaData);
      setShowCanvas(false);
    } else {
      alert('Por favor, firme antes de guardar');
    }
  };

  const limpiarFirma = () => {
    sigCanvas.current?.clear();
    onGuardar(null);
    onAclaracionChange('');
    setShowCanvas(true);
  };

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-gray-700">{titulo}</h3>

      {firma && !showCanvas ? (
        <div className="text-center">
          <img
            src={firma}
            alt={titulo}
            className="mx-auto mb-2 border border-gray-300 rounded"
            style={{ maxWidth: '300px', height: '150px', objectFit: 'contain' }}
          />
          <p className="mb-2 text-sm font-medium text-gray-700">{aclaracion || 'Sin aclaración'}</p>
          <button
            type="button"
            onClick={limpiarFirma}
            className="flex items-center px-3 py-1.5 mx-auto text-sm text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
          >
            <RefreshCw size={14} className="mr-1" /> Volver a firmar
          </button>
        </div>
      ) : (
        <div>
          <div
            ref={containerRef}
            className="mb-4 overflow-hidden border-2 border-gray-300 rounded-md signature-container"
            style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}
          >
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                width: canvasSize.width,
                height: canvasSize.height,
                className: 'signature-canvas',
                style: { width: '100%', height: 'auto', display: 'block' }
              }}
              backgroundColor="#f9f9f9"
            />
          </div>

          <div className="mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <label className="block mb-1 text-sm font-medium text-gray-700">{aclaracionLabel}</label>
            <input
              type="text"
              value={aclaracion}
              onChange={(e) => onAclaracionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Nombre y apellido"
            />
          </div>

          <div className="flex justify-center space-x-2">
            <button
              type="button"
              onClick={guardarFirma}
              className="flex items-center px-4 py-2 text-white transition-colors bg-green-500 rounded-md hover:bg-green-600"
            >
              <Save size={18} className="mr-2" /> Guardar firma
            </button>
            <button
              type="button"
              onClick={limpiarFirma}
              className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
            >
              <RefreshCw size={18} className="mr-2" /> Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
