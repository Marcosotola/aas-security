// app/admin/proximamente/page.js
'use client';

import Link from 'next/link';
import { Wrench } from 'lucide-react';
import { useStaffAuth } from '../../lib/useStaffAuth';

export default function ProximamenteTecnico() {
  const { loading } = useStaffAuth(['Tecnico', 'Admin']);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container flex flex-col items-center justify-center px-4 py-24 mx-auto text-center">
        <Wrench size={56} className="mb-4 text-gray-400" />
        <h2 className="mb-2 text-2xl font-bold font-montserrat text-primary">Inspección Técnica</h2>
        <p className="max-w-md text-gray-500">
          Este módulo todavía no está disponible. Cuando esté listo vas a poder gestionar tus inspecciones técnicas desde acá.
        </p>
        <Link href="/" className="mt-6 text-primary hover:underline">
          Volver al sitio principal
        </Link>
      </div>
    </div>
  );
}
