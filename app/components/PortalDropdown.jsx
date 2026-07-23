// app/components/PortalDropdown.jsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Dropdown que se renderiza en document.body en vez de en el flujo normal.
// Los menús de "Estado"/"Rol" viven dentro de tablas envueltas en
// overflow-x-auto; por la regla de CSS que fuerza overflow-y a "auto" cuando
// overflow-x no es "visible", cualquier dropdown absolute posicionado ahí
// adentro queda recortado (parece "oculto"). Renderizar por portal con
// position: fixed evita ese recorte y cualquier problema de z-index/stacking.
export default function PortalDropdown({ open, anchorRef, onClose, children, align = 'left', width = 144 }) {
    const [coords, setCoords] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!open || !anchorRef.current) return;

        const actualizarPosicion = () => {
            const rect = anchorRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 4,
                left: align === 'right' ? rect.right - width : rect.left
            });
        };

        actualizarPosicion();
        window.addEventListener('scroll', actualizarPosicion, true);
        window.addEventListener('resize', actualizarPosicion);
        return () => {
            window.removeEventListener('scroll', actualizarPosicion, true);
            window.removeEventListener('resize', actualizarPosicion);
        };
    }, [open, anchorRef, align, width]);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e) => {
            if (anchorRef.current?.contains(e.target)) return;
            if (e.target.closest('[data-portal-dropdown]')) return;
            onClose();
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, onClose, anchorRef]);

    if (!open || !mounted || !coords) return null;

    return createPortal(
        <div
            data-portal-dropdown
            style={{ position: 'fixed', top: coords.top, left: coords.left, width, zIndex: 1000 }}
            className="overflow-hidden bg-white border border-gray-200 rounded-md shadow-lg"
        >
            {children}
        </div>,
        document.body
    );
}
