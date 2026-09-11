'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

// Boundary de error global (convención de Next.js App Router). Sin este
// archivo, cualquier excepción de cliente no controlada muestra la pantalla
// en blanco genérica "Application error: a client-side exception has
// occurred", que no da forma de recuperarse ni de saber qué pasó.
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Error no controlado:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md p-6 text-center bg-white rounded-lg shadow-md">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-danger" />
        <h1 className="mb-2 text-lg font-semibold text-gray-800">Ocurrió un error inesperado</h1>
        <p className="mb-6 text-sm text-gray-500">
          No se pudo completar la acción. Probá de nuevo; si el problema persiste, volvé a intentar cargando los datos desde cero antes de continuar.
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="flex items-center px-4 py-2 text-sm text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
          >
            <RotateCcw size={16} className="mr-2" /> Reintentar
          </button>
          <Link
            href="/admin/dashboard"
            className="flex items-center px-4 py-2 text-sm text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
          >
            <Home size={16} className="mr-2" /> Ir al Panel
          </Link>
        </div>
      </div>
    </div>
  );
}
