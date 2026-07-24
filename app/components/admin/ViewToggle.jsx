'use client';

import { List, LayoutGrid } from 'lucide-react';

// Botón para alternar entre vista de tabla y vista de cards en las listas del
// panel admin. Las cards ayudan mucho a leer estas listas desde el celular.
export default function ViewToggle({ vista, onChange }) {
  return (
    <div className="inline-flex overflow-hidden border border-gray-300 rounded-md shrink-0">
      <button
        type="button"
        onClick={() => onChange('tabla')}
        title="Vista de tabla"
        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
          vista === 'tabla' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        <List size={16} />
        <span className="hidden sm:inline">Tabla</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('cards')}
        title="Vista de tarjetas"
        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-l border-gray-300 transition-colors ${
          vista === 'cards' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        <LayoutGrid size={16} />
        <span className="hidden sm:inline">Cards</span>
      </button>
    </div>
  );
}
