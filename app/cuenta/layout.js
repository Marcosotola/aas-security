// app/cuenta/layout.js
'use client';

import { ClienteAuthProvider, useCliente } from '../lib/useClienteAuth';
import ClienteHeader from '../components/cliente/ClienteHeader';

function CuentaShell({ children }) {
  const { user, perfil, loading } = useCliente();

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
    <div className="min-h-screen bg-gray-50 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0">
      <ClienteHeader user={user} perfil={perfil} />
      {children}
    </div>
  );
}

export default function CuentaLayout({ children }) {
  return (
    <ClienteAuthProvider>
      <CuentaShell>{children}</CuentaShell>
    </ClienteAuthProvider>
  );
}
