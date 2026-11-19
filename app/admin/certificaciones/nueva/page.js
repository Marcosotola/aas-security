'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { useStaffAuth } from '../../../lib/useStaffAuth';
import CertificacionForm from '../../../components/certificaciones/CertificacionForm';

export default function NuevaCertificacion() {
  const router = useRouter();
  const { user, loading } = useStaffAuth({ modulo: 'certificacion', accion: 'crear' });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
            <Home size={16} className="mr-1" /> Panel
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link href="/admin/certificaciones" className="mr-4 text-primary hover:underline">Certificaciones</Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">Nueva</span>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">Nueva Certificación</h2>

        <CertificacionForm user={user} onGuardado={(id) => router.push(`/admin/certificaciones/${id}`)} />
      </div>
    </div>
  );
}
