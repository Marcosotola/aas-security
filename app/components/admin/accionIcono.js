// app/components/admin/accionIcono.js

// Estilo compartido por los íconos de acción (ver/descargar/editar/eliminar)
// de los listados de Documentos y Órdenes de Trabajo: agranda el ícono y el
// área táctil real (padding + fondo circular al hover) para que sean fáciles
// de tocar en mobile, que es la vista principal, sin tener que hacer zoom.
// El contenedor de estos íconos usa `gap-1`: la separación real entre ellos
// la da el padding de cada uno, no el gap.
export const ACCION_ICONO_TAMANO = 20;

const COLORES_ACCION_ICONO = {
  gray: 'text-gray-600 hover:text-primary hover:bg-gray-100',
  primary: 'text-primary hover:text-primary-light hover:bg-primary/10',
  secondary: 'text-secondary hover:text-secondary-light hover:bg-secondary/10',
  red: 'text-red-500 hover:text-red-700 hover:bg-red-50',
  green: 'text-green-600 hover:text-green-700 hover:bg-green-50'
};

export const accionIconoClase = (color) =>
  `inline-flex items-center justify-center p-2.5 rounded-full transition-colors disabled:opacity-50 disabled:pointer-events-none ${COLORES_ACCION_ICONO[color]}`;
