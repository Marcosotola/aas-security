'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  LogOut,
  FileDown,
  Home,
  FileText,
  DollarSign,
  FileCheck,
  Receipt,
  File,
  ChevronDown,
  MessageCircle,
  Tag,
  UserCog,
  Wallet,
  CreditCard,
  ClipboardList,
  ListChecks,
  ShieldAlert
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { esSuperAdmin } from '../../lib/superAdmin';
import PortalDropdown from '../PortalDropdown';

// Presupuestos, Recibos, Remitos, Estados de cuenta e Informes viven agrupados
// bajo el menú "Documentos" (nav de escritorio como dropdown, mobile como
// sublista) para no saturar la barra de navegación con tantos ítems sueltos.
const DOCUMENTOS_SUBMENU = [
  { id: 'presupuestos', label: 'Presupuestos', icono: FileText, href: '/admin/presupuestos' },
  { id: 'estados', label: 'Estados de cuenta', icono: DollarSign, href: '/admin/estados' },
  { id: 'remitos', label: 'Remitos', icono: FileCheck, href: '/admin/remitos' },
  { id: 'recibos', label: 'Recibos', icono: Receipt, href: '/admin/recibos' },
  { id: 'informes', label: 'Informes', icono: File, href: '/admin/informes' },
];

const MODULOS_NAV = [
  { id: 'ordenes-trabajo', label: 'Órdenes de Trabajo', icono: ClipboardList, href: '/admin/ordenes-trabajo' },
  { id: 'planillas', label: 'Planillas', icono: ListChecks, href: '/admin/planillas' },
  { id: 'finanzas', label: 'Finanzas', icono: Wallet, href: '/admin/finanzas' },
  { id: 'lista-precios', label: 'Lista de precios', icono: Tag, href: '/admin/lista-precios' },
  { id: 'usuarios', label: 'Usuarios', icono: UserCog, href: '/admin/usuarios' },
  { id: 'consultas', label: 'Consultas', icono: MessageCircle, href: '/admin/consultas' },
  { id: 'suscripcion', label: 'Suscripción', icono: CreditCard, href: '/admin/suscripcion' },
];

export default function AdminHeader({ user, suscripcionVencida }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [documentosMenuAbierto, setDocumentosMenuAbierto] = useState(false);
  const [redirigiendoAPago, setRedirigiendoAPago] = useState(false);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [errorPago, setErrorPago] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const documentosBtnRef = useRef(null);

  // El SuperAdmin registra la cookie de bypass apenas se loguea, para poder
  // navegar el sitio público sin que middleware.js lo mande a /mantenimiento
  // cuando la suscripción está vencida (ver app/lib/superAdminSesion.js).
  useEffect(() => {
    if (!user || !esSuperAdmin(user.email)) return;
    user.getIdToken()
      .then((token) => fetch('/api/superadmin/sesion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      }))
      .catch((error) => console.error('Error al registrar la sesión de SuperAdmin:', error));
  }, [user]);

  // Al Admin (no al SuperAdmin) le mostramos un modal apenas detectamos que
  // la suscripción está vencida, en vez de redirigirlo de una sin avisar.
  // No le pedimos el email de MercadoPago: si se lo pasamos a MercadoPago
  // como payer_email y el navegador ya tiene otra cuenta logueada ahí,
  // rechaza el pago con un error de cuenta que no coincide. Dejamos que
  // MercadoPago maneje el login/cambio de cuenta con su propia UI. El
  // SuperAdmin nunca ve esto: es quien administra la app, no quien paga.
  // La pantalla de Suscripción tampoco lo muestra, para poder revisar el
  // estado sin que te saque.
  useEffect(() => {
    if (!user || !suscripcionVencida) return;
    if (esSuperAdmin(user.email)) return;
    if (pathname === '/admin/suscripcion') return;

    setErrorPago('');
    setMostrarModalPago(true);
  }, [user, suscripcionVencida, pathname]);

  const irAMercadoPago = async () => {
    setErrorPago('');
    setMostrarModalPago(false);
    setRedirigiendoAPago(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/mercadopago/crear-suscripcion', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.initPoint) {
        window.location.href = data.initPoint;
        return;
      }
      setErrorPago(data.error || 'No se pudo generar el link de pago.');
    } catch (error) {
      console.error('Error al redirigir a MercadoPago:', error);
      setErrorPago('No se pudo generar el link de pago.');
    }
    setRedirigiendoAPago(false);
    setMostrarModalPago(true);
  };

  const handleLogout = async () => {
    try {
      if (user && esSuperAdmin(user.email)) {
        await fetch('/api/superadmin/sesion', { method: 'DELETE' }).catch(() => {});
      }
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const esActivo = (href) => pathname === href || pathname.startsWith(`${href}/`);
  const documentosActivo = DOCUMENTOS_SUBMENU.some((item) => esActivo(item.href));

  if (redirigiendoAPago) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="text-gray-700">Te estamos llevando a MercadoPago para regularizar el pago...</p>
        </div>
      </div>
    );
  }

  if (mostrarModalPago) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
          <div className="flex items-center gap-2 mb-2 text-danger">
            <ShieldAlert size={20} />
            <h2 className="text-lg font-semibold">Suscripción vencida</h2>
          </div>
          <p className="mb-4 text-sm text-gray-600">
            El sitio público está bloqueado. Te vamos a llevar a MercadoPago para autorizar el débito mensual.
          </p>

          {errorPago && <p className="mt-2 text-sm text-danger">{errorPago}</p>}

          <button
            type="button"
            onClick={irAMercadoPago}
            className="w-full px-4 py-2 mt-4 font-medium text-white transition-colors rounded-md bg-primary hover:bg-primary-light disabled:opacity-50"
          >
            Continuar a MercadoPago
          </button>

          <Link
            href="/admin/suscripcion"
            className="block mt-3 text-sm text-center text-gray-500 hover:underline"
          >
            Ver detalles de la suscripción
          </Link>
        </div>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 text-white shadow-lg bg-primary">
      <div className="container flex items-center justify-between px-4 py-4 mx-auto">
        <div className="flex items-center">
          <button
            className="mr-3 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link href="/admin/dashboard" className="flex items-center">
            <div className="relative mr-2">
              <div className="absolute inset-0 transform rotate-45 rounded-full bg-white/30"></div>
              <div className="absolute inset-0 transform scale-75 -rotate-45 rounded-full bg-white/20"></div>
            </div>
            <h1 className="text-lg font-bold md:text-xl font-montserrat">Panel de Administración</h1>
          </Link>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <span className="hidden md:inline">{user?.email}</span>
          <a
            href="/carta-presentacion-aas-security.pdf"
            download
            title="Descargar carta de presentación"
            className="flex items-center p-2 text-white rounded-md hover:bg-primary-light"
          >
            <FileDown size={18} className="md:mr-2" />
            <span className="hidden md:inline">Carta de presentación</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center p-2 text-white rounded-md hover:bg-primary-light"
          >
            <LogOut size={18} className="md:mr-2" />
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </div>

      {/* Navegador de módulos: solo en escritorio. En mobile ya está el menú hamburguesa. */}
      <nav className="hidden border-t border-white/20 bg-primary md:block">
        <div className="container flex px-2 mx-auto overflow-x-auto">
          <Link
            href="/admin/dashboard"
            className={`flex items-center flex-shrink-0 gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              esActivo('/admin/dashboard')
                ? 'border-white text-white bg-white/10'
                : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home size={16} />
            Inicio
          </Link>

          <div className="relative flex-shrink-0">
            <button
              type="button"
              ref={documentosBtnRef}
              onClick={() => setDocumentosMenuAbierto((o) => !o)}
              className={`flex items-center flex-shrink-0 gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                documentosActivo
                  ? 'border-white text-white bg-white/10'
                  : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText size={16} />
              Documentos
              <ChevronDown size={14} className={documentosMenuAbierto ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>

            <PortalDropdown
              open={documentosMenuAbierto}
              anchorRef={documentosBtnRef}
              onClose={() => setDocumentosMenuAbierto(false)}
              width={200}
            >
              {DOCUMENTOS_SUBMENU.map((item) => {
                const Icono = item.icono;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setDocumentosMenuAbierto(false)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                      esActivo(item.href) ? 'font-semibold text-primary' : 'text-gray-700'
                    }`}
                  >
                    <Icono size={15} />
                    {item.label}
                  </Link>
                );
              })}
            </PortalDropdown>
          </div>

          {MODULOS_NAV.map((modulo) => {
            const Icono = modulo.icono;
            const activo = esActivo(modulo.href);
            return (
              <Link
                key={modulo.id}
                href={modulo.href}
                className={`flex items-center flex-shrink-0 gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activo
                    ? 'border-white text-white bg-white/10'
                    : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icono size={16} />
                {modulo.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Aviso de suscripción vencida/deshabilitada: visible en todo el panel */}
      {suscripcionVencida && (
        <Link
          href="/admin/suscripcion"
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-danger hover:bg-red-700"
        >
          <ShieldAlert size={16} />
          Suscripción vencida: el sitio público está bloqueado. Tocá acá para regularizar el pago.
        </Link>
      )}

      {/* Menú móvil: mismos accesos, en formato lista */}
      {mobileMenuOpen && (
        <div className="absolute w-full bg-white shadow-lg top-full md:hidden">
          <nav className="flex flex-col p-4">
            <Link
              href="/"
              className="py-2 text-gray-700 hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Volver al sitio principal
            </Link>
            <a
              href="/carta-presentacion-aas-security.pdf"
              download
              className="flex items-center py-2 text-gray-700 hover:text-primary"
            >
              <FileDown size={16} className="mr-2" />
              Descargar carta de presentación
            </a>
            <Link
              href="/admin/dashboard"
              className="flex items-center py-2 text-gray-700 hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home size={16} className="mr-2" />
              Inicio
            </Link>

            <span className="pt-3 pb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">Documentos</span>
            {DOCUMENTOS_SUBMENU.map((item) => {
              const Icono = item.icono;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center py-2 pl-2 text-gray-700 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icono size={16} className="mr-2" />
                  {item.label}
                </Link>
              );
            })}

            {MODULOS_NAV.map((modulo) => {
              const Icono = modulo.icono;
              return (
                <Link
                  key={modulo.id}
                  href={modulo.href}
                  className="flex items-center py-2 text-gray-700 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icono size={16} className="mr-2" />
                  {modulo.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
