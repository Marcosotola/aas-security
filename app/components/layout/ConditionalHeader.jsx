'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

// El header público queda fijo/superpuesto y compite con la navegación
// propia del panel de staff (/admin) y del portal del cliente (/cuenta), que
// ya traen su propio header. Mismo criterio que ConditionalFooter.
export default function ConditionalHeader() {
  const pathname = usePathname();
  const esAreaLogueada = pathname.startsWith('/admin') || pathname.startsWith('/cuenta');

  if (esAreaLogueada) return null;
  return <Header />;
}
