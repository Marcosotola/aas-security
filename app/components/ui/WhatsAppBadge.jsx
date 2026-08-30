// components/ui/WhatsAppBadge.js
"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppBadge({ phoneNumber }) {
  const pathname = usePathname();
  
  // Ocultar en rutas de admin y del portal del cliente: son paneles logueados,
  // no la página pública que necesita el botón de contacto rápido.
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/cuenta')) {
    return null;
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-50 flex items-center justify-center w-16 h-16 text-white transition-colors bg-green-600 rounded-full shadow-lg bottom-6 right-6 hover:bg-green-700"
    >
      <MessageCircle size={32} />
    </Link>
  );
}