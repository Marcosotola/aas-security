// app/components/ui/EstadoFactura.jsx
'use client';

import { fechaHoyLocal } from '../../lib/fecha';

// Estado de pago de una factura: comparte la paleta de colores entre el
// badge de solo lectura (listado del cliente, listado admin) y el toggle
// editable (solo Admin), para que no se desincronicen si cambia algún día.
export const ESTADOS_FACTURA = [
  { value: 'pendiente', label: 'Pendiente', claseActiva: 'bg-yellow-500 text-white', claseBadge: 'text-yellow-800 bg-yellow-100' },
  { value: 'pagado', label: 'Pagado', claseActiva: 'bg-success text-white', claseBadge: 'text-green-800 bg-green-100' }
];

const estadoInfo = (estado) => ESTADOS_FACTURA.find((e) => e.value === estado) || ESTADOS_FACTURA[0];

// Vencida = no pagada y con vencimiento hoy o antes. `vencimiento` es
// "YYYY-MM-DD" (como `fecha`), así que se compara como texto contra hoy.
export const facturaVencida = (factura) =>
  factura?.estado !== 'pagado' && !!factura?.vencimiento && factura.vencimiento <= fechaHoyLocal();

// Pendientes arriba, de la que vence antes a la que vence después (las sin
// vencimiento al final de las pendientes); debajo las pagadas, de la más
// nueva a la más vieja.
export const ordenarFacturas = (a, b) => {
  const pagadaA = a.estado === 'pagado';
  const pagadaB = b.estado === 'pagado';
  if (pagadaA !== pagadaB) return pagadaA ? 1 : -1;
  if (!pagadaA && a.vencimiento !== b.vencimiento) {
    if (!a.vencimiento) return 1;
    if (!b.vencimiento) return -1;
    return a.vencimiento < b.vencimiento ? -1 : 1;
  }
  return (b.fecha || '').localeCompare(a.fecha || '');
};

// Badge de solo lectura, para el portal del cliente y para donde el admin no
// deba poder tocar el estado (ej. dentro de una tabla muy angosta).
export function EstadoFacturaBadge({ estado, vencida = false }) {
  if (vencida) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
        Vencida
      </span>
    );
  }
  const info = estadoInfo(estado);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${info.claseBadge}`}>
      {info.label}
    </span>
  );
}

// Toggle de dos botones para que el Admin cambie el estado (mismo patrón que
// los botones OK/N OK de PlanillasAdjuntas.jsx).
export default function EstadoFacturaToggle({ estado, onChange, disabled = false }) {
  return (
    <div className="inline-flex p-1 bg-gray-100 rounded-md">
      {ESTADOS_FACTURA.map((info) => (
        <button
          key={info.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(info.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            estado === info.value ? info.claseActiva : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          {info.label}
        </button>
      ))}
    </div>
  );
}
