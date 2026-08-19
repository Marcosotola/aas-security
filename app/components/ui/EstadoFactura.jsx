// app/components/ui/EstadoFactura.jsx
'use client';

// Estado de pago de una factura: comparte la paleta de colores entre el
// badge de solo lectura (listado del cliente, listado admin) y el toggle
// editable (solo Admin), para que no se desincronicen si cambia algún día.
export const ESTADOS_FACTURA = [
  { value: 'pendiente', label: 'Pendiente', claseActiva: 'bg-yellow-500 text-white', claseBadge: 'text-yellow-800 bg-yellow-100' },
  { value: 'pagado', label: 'Pagado', claseActiva: 'bg-success text-white', claseBadge: 'text-green-800 bg-green-100' }
];

const estadoInfo = (estado) => ESTADOS_FACTURA.find((e) => e.value === estado) || ESTADOS_FACTURA[0];

// Badge de solo lectura, para el portal del cliente y para donde el admin no
// deba poder tocar el estado (ej. dentro de una tabla muy angosta).
export function EstadoFacturaBadge({ estado }) {
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
