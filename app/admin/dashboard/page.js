// app/admin/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FilePlus,
  FileText,
  Home,
  LogOut,
  BarChart3,
  DollarSign,
  FileCheck,
  Receipt,
  ScrollText,
  TrendingUp,
  Users,
  Calendar,
  ChevronRight,
  Menu,
  X,
  Clock,
  AlertCircle,
  File
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [totales, setTotales] = useState({
    presupuestos: 0,
    estados: 0,
    remitos: 0,
    recibos: 0,
    documentos: 0
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarTotales();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarTotales = async () => {
    try {
      // Total de presupuestos
      const presupuestosRef = collection(db, 'presupuestos');
      const presupuestosSnapshot = await getDocs(presupuestosRef);

      // Total de estados
      const estadosRef = collection(db, 'estados');
      const estadosSnapshot = await getDocs(estadosRef);

      // Total de remitos
      const remitosRef = collection(db, 'remitos');
      const remitosSnapshot = await getDocs(remitosRef);

      // Total de recibos
      const recibosRef = collection(db, 'recibos');
      const recibosSnapshot = await getDocs(recibosRef);

      // Total de documentos
      const documentosRef = collection(db, 'documentos');
      const documentosSnapshot = await getDocs(documentosRef);

      setTotales({
        presupuestos: presupuestosSnapshot.size,
        estados: estadosSnapshot.size,
        remitos: remitosSnapshot.size,
        recibos: recibosSnapshot.size,
        documentos: documentosSnapshot.size
      });
    } catch (error) {
      console.error('Error al cargar totales:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
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

  // Definir módulos del sistema con totales
  const modulos = [
    {
      id: 'presupuestos',
      titulo: 'Presupuestos',
      icono: FileText,
      color: 'bg-[#1A5276]', // Primary Corporate Blue
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-[#1A5276]',
      descripcion: 'Crear y gestionar presupuestos',
      total: totales.presupuestos,
      rutas: {
        nuevo: '/admin/presupuestos/nuevo',
        historial: '/admin/presupuestos'
      },
      activo: true
    },
    {
      id: 'estados',
      titulo: 'Estados de Cuenta',
      icono: DollarSign,
      color: 'bg-slate-700', // Professional Slate
      colorClaro: 'bg-slate-100',
      colorTexto: 'text-slate-700',
      descripcion: 'Control de estados de cuenta',
      total: totales.estados,
      rutas: {
        nuevo: '/admin/estados/nuevo',
        historial: '/admin/estados'
      },
      activo: true
    },
    {
      id: 'remitos',
      titulo: 'Remitos',
      icono: FileCheck,
      color: 'bg-[#2E86C1]', // Secondary Corporate Blue
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-[#2E86C1]',
      descripcion: 'Gestión de remitos',
      total: totales.remitos,
      rutas: {
        nuevo: '/admin/remitos/nuevo',
        historial: '/admin/remitos'
      },
      activo: true,
      proximamente: false
    },
    {
      id: 'recibos',
      titulo: 'Recibos',
      icono: Receipt,
      color: 'bg-slate-800', // Darker Professional Slate
      colorClaro: 'bg-slate-200',
      colorTexto: 'text-slate-800',
      descripcion: 'Administrar recibos',
      total: totales.recibos,
      rutas: {
        nuevo: '/admin/recibos/nuevo',
        historial: '/admin/recibos'
      },
      activo: true,
      proximamente: false
    },
    {
      id: 'documentos',
      titulo: 'Documentos',
      icono: File,
      color: 'bg-[#154360]', // Deep Navy/Teal
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-[#154360]',
      descripcion: 'Hojas membretadas y certificaciones',
      total: totales.documentos,
      rutas: {
        nuevo: '/admin/documentos/nuevo',
        historial: '/admin/documentos'
      },
      activo: true,
      proximamente: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mejorado */}
      <header className="sticky top-0 z-50 text-white shadow-lg bg-primary">
        <div className="container flex items-center justify-between px-4 py-4 mx-auto">
          <div className="flex items-center">
            <button
              className="mr-4 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center">
              <div className="relative mr-2">
                <div className="absolute inset-0 transform rotate-45 rounded-full bg-white/30"></div>
                <div className="absolute inset-0 transform scale-75 -rotate-45 rounded-full bg-white/20"></div>
              </div>
              <h1 className="text-lg font-bold md:text-xl font-montserrat">Panel de Administración</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center p-2 text-white rounded-md hover:bg-primary-light"
            >
              <LogOut size={18} className="mr-2" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className="absolute w-full bg-white shadow-lg top-full md:hidden">
            <nav className="flex flex-col p-4">
              <Link href="/" className="py-2 text-gray-700 hover:text-primary">
                Volver al sitio principal
              </Link>
              {modulos.filter(m => m.activo).map(modulo => (
                <div key={modulo.id} className="py-2">
                  <p className="font-semibold text-gray-800">{modulo.titulo}</p>
                  <Link href={modulo.rutas.nuevo} className="block py-1 pl-4 text-gray-600 hover:text-primary">
                    Nuevo
                  </Link>
                  <Link href={modulo.rutas.historial} className="block py-1 pl-4 text-gray-600 hover:text-primary">
                    Historial
                  </Link>
                </div>
              ))}
            </nav>
          </div>
        )}
      </header>

      <div className="container px-4 py-8 mx-auto">
        {/* Título y bienvenida */}
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold md:text-3xl font-montserrat text-primary">
            ¡Bienvenido, {user?.displayName || user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Módulos del sistema */}
        <h3 className="mb-4 text-xl font-bold text-gray-800">Documentos</h3>
        <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:gap-4">
          {modulos.map(modulo => {
            const Icono = modulo.icono;
            return (
              <Link
                key={modulo.id}
                href={modulo.activo && !modulo.proximamente ? modulo.rutas.historial : '#'}
                className={`relative overflow-hidden rounded-xl shadow-sm transition-all block h-full ${modulo.activo && !modulo.proximamente ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'opacity-75 cursor-default'
                  }`}
                style={{ transition: 'box-shadow 0.2s, transform 0.2s' }}
              >
                {modulo.proximamente && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                    <span className="px-3 py-1 text-xs font-semibold text-white bg-yellow-500 rounded-full">
                      Próximamente
                    </span>
                  </div>
                )}

                <div className={`p-4 md:p-6 ${modulo.activo ? modulo.color : 'bg-gray-300'} text-white h-full flex flex-col`}>
                  <div className="flex items-start justify-between mb-2 md:mb-4">
                    <div className={`p-2.5 rounded-xl bg-white/20 shadow-inner`}>
                      <Icono size={32} className="md:w-10 md:h-10" />
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold leading-none md:text-2xl">{modulo.total}</p>
                      <p className="text-[10px] opacity-80 uppercase font-semibold mt-1">Total</p>
                    </div>
                  </div>

                  <h4 className="text-base font-bold leading-tight md:text-lg">{modulo.titulo}</h4>
                  <p className="hidden mt-1 text-sm md:block opacity-90 line-clamp-2">{modulo.descripcion}</p>

                  {modulo.activo && (
                    <div className="flex items-center justify-center mt-auto pt-3 md:pt-4 border-t border-white/10">
                      <span
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = modulo.rutas.nuevo; }}
                        className="flex items-center text-sm md:text-lg font-bold hover:underline bg-white/20 px-4 py-2 rounded-xl transition-all hover:bg-white/30 hover:scale-105 active:scale-95"
                      >
                        <FilePlus size={24} className="mr-2 md:w-7 md:h-7" />
                        <span>Nuevo</span>
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}