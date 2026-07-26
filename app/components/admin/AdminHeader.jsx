'use client';

import { useState, useEffect } from 'react';
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
  MessageCircle,
  Tag,
  UserCog,
  Wallet,
  CreditCard,
  ShieldAlert
} from 'lucide-react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { obtenerConfigSuscripcion } from '../../lib/firestore';
import { esSuperAdmin } from '../../lib/superAdmin';

const MODULOS_NAV = [
  { id: 'dashboard', label: 'Inicio', icono: Home, href: '/admin/dashboard' },
  { id: 'presupuestos', label: 'Presupuestos', icono: FileText, href: '/admin/presupuestos' },
  { id: 'estados', label: 'Estados de cuenta', icono: DollarSign, href: '/admin/estados' },
  { id: 'remitos', label: 'Remitos', icono: FileCheck, href: '/admin/remitos' },
  { id: 'recibos', label: 'Recibos', icono: Receipt, href: '/admin/recibos' },
  { id: 'documentos', label: 'Documentos', icono: File, href: '/admin/documentos' },
  { id: 'consultas', label: 'Consultas', icono: MessageCircle, href: '/admin/consultas' },
  { id: 'lista-precios', label: 'Lista de precios', icono: Tag, href: '/admin/lista-precios' },
  { id: 'usuarios', label: 'Usuarios', icono: UserCog, href: '/admin/usuarios' },
  { id: 'finanzas', label: 'Finanzas', icono: Wallet, href: '/admin/finanzas' },
  { id: 'suscripcion', label: 'Suscripción', icono: CreditCard, href: '/admin/suscripcion' },
];

export default function AdminHeader() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [suscripcionVencida, setSuscripcionVencida] = useState(false);
  const [redirigiendoAPago, setRedirigiendoAPago] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    obtenerConfigSuscripcion()
      .then((config) => {
        const hoy = new Date().toISOString().split('T')[0];
        const vencida = Boolean(config.fechaVencimiento && config.fechaVencimiento < hoy);
        setSuscripcionVencida(config.appHabilitada === false || vencida);
      })
      .catch(() => {}); // sin permiso (ej. Tecnico) o sin datos todavía: no mostrar banner
  }, [user]);

  // Al Admin (no al SuperAdmin) lo mandamos directo a MercadoPago apenas
  // detectamos que la suscripción está vencida, en vez de pedirle que
  // encuentre un link en algún lado. El SuperAdmin nunca se redirige: es
  // quien administra la app, no quien paga. La pantalla de Suscripción
  // tampoco redirige, para poder revisar el estado sin que te saque.
  useEffect(() => {
    if (!user || !suscripcionVencida) return;
    if (esSuperAdmin(user.email)) return;
    if (pathname === '/admin/suscripcion') return;

    let cancelado = false;
    (async () => {
      try {
        setRedirigiendoAPago(true);
        const token = await user.getIdToken();
        const res = await fetch('/api/mercadopago/crear-suscripcion', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelado && res.ok && data.initPoint) {
          window.location.href = data.initPoint;
          return;
        }
      } catch (error) {
        console.error('Error al redirigir a MercadoPago:', error);
      }
      if (!cancelado) setRedirigiendoAPago(false);
    })();

    return () => { cancelado = true; };
  }, [user, suscripcionVencida, pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const esActivo = (href) => pathname === href || pathname.startsWith(`${href}/`);

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
