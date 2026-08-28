'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';

const CLASE_BADGE = 'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 rounded-full bg-blue-50';

// Badge de sede reutilizado en todos los listados de documentos (Documentos,
// Órdenes de Trabajo). Si el documento está vinculado a un cliente
// registrado (clienteId), es un link a su ficha (/admin/usuarios/[id]) con
// esa sede ya preseleccionada como filtro.
export default function SedeLink({ clienteId, sede }) {
  if (!sede) return <span className="text-sm text-gray-400">-</span>;

  if (!clienteId) {
    return (
      <span className={CLASE_BADGE}>
        <MapPin size={11} />
        {sede}
      </span>
    );
  }

  return (
    <Link
      href={`/admin/usuarios/${clienteId}?sede=${encodeURIComponent(sede)}`}
      title={`Ver documentos de ${sede}`}
      className={`${CLASE_BADGE} hover:bg-blue-100 transition-colors`}
    >
      <MapPin size={11} />
      {sede}
    </Link>
  );
}
