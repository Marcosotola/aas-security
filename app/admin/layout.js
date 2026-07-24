'use client';

import { usePathname } from 'next/navigation';
import AdminHeader from '../components/admin/AdminHeader';

// Layout compartido por todo /admin/*: agrega un navegador persistente entre
// módulos (presupuestos, remitos, recibos, etc.) para no tener que volver al
// panel cada vez. La pantalla de login (/admin) queda sin este header.
export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const esLogin = pathname === '/admin';

  if (esLogin) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      {children}
    </div>
  );
}
