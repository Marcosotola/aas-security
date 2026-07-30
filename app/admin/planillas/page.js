// app/admin/planillas/page.js
'use client';

import Link from 'next/link';
import { Home, ClipboardList } from 'lucide-react';
import { useStaffAuth } from '../../lib/useStaffAuth';

export default function Planillas() {
  const { loading } = useStaffAuth(['Admin']);

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
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
            <Home size={16} className="mr-1" /> Panel
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">Planillas</span>
        </div>

        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ClipboardList size={56} className="mb-4 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold font-montserrat text-primary">Planillas</h2>
          <p className="max-w-md text-gray-500">
            Este módulo todavía no está disponible. Cuando esté listo vas a poder gestionar tus planillas desde acá.
          </p>
        </div>
      </div>
    </div>
  );
}
