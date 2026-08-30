'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LogOut, Menu, X, LayoutDashboard, FileText, MapPin, User } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

const ITEM_INICIO = { id: 'inicio', label: 'Inicio', icono: LayoutDashboard, href: '/cuenta' };
const ITEM_DOCUMENTOS = { id: 'documentos', label: 'Documentos', icono: FileText, href: '/cuenta/documentos' };
const ITEM_SEDES = { id: 'sedes', label: 'Sedes', icono: MapPin, href: '/cuenta/sedes' };
const ITEM_PERFIL = { id: 'perfil', label: 'Mi perfil', icono: User, href: '/cuenta/perfil' };

// Desktop tiene lugar de sobra: los 4 destinos quedan siempre a la vista.
const NAV_ESCRITORIO = [ITEM_INICIO, ITEM_DOCUMENTOS, ITEM_SEDES, ITEM_PERFIL];

export default function ClienteHeader({ user, perfil }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const esActivo = (href) => (href === '/cuenta' ? pathname === '/cuenta' : pathname.startsWith(href));

  // Perfil se edita poco (corrección de datos), así que en mobile siempre
  // queda detrás de "Más". Sedes sí gana un lugar fijo en la barra inferior
  // cuando el cliente tiene 2 o más — ahí sí es un filtro que se usa seguido
  // para encontrar los documentos de una sede puntual — y si no, se suma a
  // "Más" en vez de ocupar un cuarto de la barra para un caso poco frecuente.
  const multiSede = (perfil?.sedes || []).length >= 2;
  const navInferior = multiSede ? [ITEM_INICIO, ITEM_DOCUMENTOS, ITEM_SEDES] : [ITEM_INICIO, ITEM_DOCUMENTOS];
  const navMas = multiSede ? [ITEM_PERFIL] : [ITEM_SEDES, ITEM_PERFIL];
  const masActivo = navMas.some((item) => esActivo(item.href));

  return (
    <header className="sticky top-0 z-50 text-white shadow-lg bg-primary">
      <div className="container flex items-center justify-between px-4 py-4 mx-auto">
        <Link href="/cuenta" className="flex items-center">
          <span className="text-lg font-bold md:text-xl font-montserrat">AAS Security</span>
        </Link>
        <div className="flex items-center space-x-1 md:space-x-2">
          <span className="hidden mr-2 md:inline">{user?.email}</span>
          <Link href="/" className="flex items-center p-2 rounded-md hover:bg-primary-light" title="Volver al sitio">
            <Home size={18} className="md:mr-2" />
            <span className="hidden md:inline">Sitio</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center p-2 rounded-md hover:bg-primary-light" title="Salir">
            <LogOut size={18} className="md:mr-2" />
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </div>

      {/* Nav de escritorio: los 4 destinos a la vista, sin submenús. */}
      <nav className="hidden border-t border-white/20 bg-primary md:block">
        <div className="container flex px-2 mx-auto">
          {NAV_ESCRITORIO.map((item) => {
            const Icono = item.icono;
            const activo = esActivo(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activo ? 'border-white text-white bg-white/10' : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icono size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Panel "Más" (mobile): lo que no entra en la barra inferior. */}
      {menuAbierto && (
        <div className="absolute w-full bg-white shadow-lg top-full md:hidden">
          <nav className="flex flex-col p-4">
            {navMas.map((item) => {
              const Icono = item.icono;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center py-2 text-gray-700 hover:text-primary"
                  onClick={() => setMenuAbierto(false)}
                >
                  <Icono size={16} className="mr-2" />
                  {item.label}
                </Link>
              );
            })}
            <Link href="/" className="flex items-center py-2 text-gray-700 hover:text-primary" onClick={() => setMenuAbierto(false)}>
              <Home size={16} className="mr-2" /> Volver al sitio
            </Link>
            <button onClick={handleLogout} className="flex items-center py-2 text-left text-gray-700 hover:text-primary">
              <LogOut size={16} className="mr-2" /> Salir
            </button>
          </nav>
        </div>
      )}

      {/* Barra inferior (mobile): Inicio + Documentos siempre, Sedes si hay 2+, el resto en "Más". */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navInferior.map((item) => {
          const Icono = item.icono;
          const activo = esActivo(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setMenuAbierto(false)}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 py-2 text-[11px] font-medium ${activo ? 'text-primary' : 'text-gray-500'}`}
            >
              <Icono size={20} />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
          aria-label="Más opciones"
          className={`flex flex-col items-center justify-center flex-1 gap-0.5 py-2 text-[11px] font-medium ${
            menuAbierto || masActivo ? 'text-primary' : 'text-gray-500'
          }`}
        >
          {menuAbierto ? <X size={20} /> : <Menu size={20} />}
          Más
        </button>
      </nav>
    </header>
  );
}
