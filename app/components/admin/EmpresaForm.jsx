'use client';

import { useState } from 'react';

export const EMPRESA_VACIA = { nombre: '', razonSocial: '', cuit: '', email: '', telefono: '' };

const CAMPOS = [
  { name: 'nombre', label: 'Nombre', placeholder: 'Cómo la conocen (ej. A&A)', required: true, span: true },
  { name: 'razonSocial', label: 'Razón social', placeholder: 'Opcional' },
  { name: 'cuit', label: 'CUIT', placeholder: 'Opcional' },
  { name: 'email', label: 'Email', placeholder: 'Opcional', type: 'email' },
  { name: 'telefono', label: 'Teléfono', placeholder: 'Opcional', type: 'tel' }
];

// Datos generales de una empresa (alta desde /admin/empresas y edición desde
// su ficha). Las sedes se gestionan aparte, en la ficha.
export default function EmpresaForm({ inicial = EMPRESA_VACIA, onGuardar, onCancelar, guardando, textoGuardar = 'Guardar' }) {
  const [datos, setDatos] = useState({ ...EMPRESA_VACIA, ...inicial });

  const handleSubmit = (e) => {
    e.preventDefault();
    const limpios = Object.fromEntries(Object.keys(EMPRESA_VACIA).map((k) => [k, (datos[k] || '').trim()]));
    if (!limpios.nombre) return;
    onGuardar(limpios);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CAMPOS.map((campo) => (
          <div key={campo.name} className={campo.span ? 'sm:col-span-2' : ''}>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {campo.label}{campo.required && ' *'}
            </label>
            <input
              type={campo.type || 'text'}
              value={datos[campo.name]}
              onChange={(e) => setDatos({ ...datos, [campo.name]: e.target.value })}
              placeholder={campo.placeholder}
              required={campo.required}
              autoFocus={campo.name === 'nombre'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onCancelar}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando || !datos.nombre.trim()}
          className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-light disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : textoGuardar}
        </button>
      </div>
    </form>
  );
}
