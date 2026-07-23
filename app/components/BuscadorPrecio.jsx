// app/components/BuscadorPrecio.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

const formatMoney = (amount) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (amount === undefined || amount === null || amount === '' || isNaN(num)) return '$0,00';
    const formatted = num.toFixed(2).replace('.', ',');
    const parts = formatted.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return '$' + parts.join(',');
};

// Combobox de búsqueda sobre la lista de precios: filtra en memoria y devuelve
// el item elegido vía onSelect, sin forzar el ingreso manual (siempre queda disponible).
export default function BuscadorPrecio({ listaPrecios, onSelect, placeholder = 'Buscar en la lista de precios...' }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!listaPrecios || listaPrecios.length === 0) return null;

    const terminoBusqueda = query.trim().toLowerCase();
    const resultados = (terminoBusqueda
        ? listaPrecios.filter(p => p.descripcion?.toLowerCase().includes(terminoBusqueda))
        : listaPrecios
    ).slice(0, 8);

    return (
        <div className="relative mb-2" ref={containerRef}>
            <div className="relative">
                <Search size={14} className="absolute text-gray-400 -translate-y-1/2 left-2 top-1/2" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    placeholder={placeholder}
                    className="w-full py-1.5 pl-7 pr-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            {open && (
                <div className="absolute left-0 right-0 z-20 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-56">
                    {resultados.length > 0 ? (
                        resultados.map((p) => (
                            <button
                                type="button"
                                key={p.id}
                                onClick={() => { onSelect(p); setQuery(''); setOpen(false); }}
                                className="flex items-center justify-between w-full px-3 py-2 text-sm text-left border-b border-gray-100 last:border-0 hover:bg-blue-50"
                            >
                                <span className="flex-1 mr-2 truncate">{p.descripcion}</span>
                                <span className="font-medium text-gray-600 whitespace-nowrap">{formatMoney(p.precioUnitario)}</span>
                            </button>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-400">Sin resultados en el catálogo</div>
                    )}
                </div>
            )}
        </div>
    );
}
