// app/admin/proximamente/page.js
'use client';

import Link from 'next/link';
import { LogOut, Wrench } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useStaffAuth } from '../../lib/useStaffAuth';

export default function ProximamenteTecnico() {
  const { user, loading } = useStaffAuth(['Tecnico', 'Admin']);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/admin';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      <header className="text-white shadow bg-primary">
        <div className="container flex items-center justify-between px-4 py-20 mx-auto">
          <h1 className="text-xl font-bold font-montserrat">Panel de Administración</h1>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user?.email}</span>
            <button onClick={handleLogout} className="flex items-center p-2 text-white rounded-md hover:bg-primary-light">
              <LogOut size={18} className="mr-2" /> Salir
            </button>
          </div>
        </div>
      </header>

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
