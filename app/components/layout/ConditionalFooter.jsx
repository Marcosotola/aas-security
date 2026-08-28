'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

// El footer es del sitio público: se oculta en el panel de staff (/admin) y
// en el portal del cliente (/cuenta), que ya tienen su propia navegación.
export default function ConditionalFooter() {
  const pathname = usePathname();
  const esAreaLogueada = pathname.startsWith('/admin') || pathname.startsWith('/cuenta');

  if (esAreaLogueada) return null;
  return <Footer />;
}
