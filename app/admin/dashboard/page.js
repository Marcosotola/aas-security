// app/admin/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FilePlus,
  FileText,
  Home,
  BarChart3,
  DollarSign,
  FileCheck,
  Receipt,
  ScrollText,
  TrendingUp,
  Users,
  Calendar,
  ChevronRight,
  Clock,
  AlertCircle,
  File,
  MessageCircle,
  Tag,
  UserCog
} from 'lucide-react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStaffAuth } from '../../lib/useStaffAuth';

export default function Dashboard() {
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [totales, setTotales] = useState({
    presupuestos: 0,
    estados: 0,
    remitos: 0,
    recibos: 0,
    documentos: 0,
    consultas: 0,
    consultasNoLeidas: 0,
    listaPrecios: 0,
    usuarios: 0
  });
  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!user) return;
    cargarTotales().then(() => setLoadingData(false));
  }, [user]);

  const cargarTotales = async () => {
    try {
      // Cuenta cada colección con una agregación en el servidor (no descarga
      // los documentos) y todas en paralelo: antes se hacían 9 lecturas
      // completas de colección en serie, una esperando a la anterior, lo que
      // hacía que el dashboard tardara varios segundos en mostrar solo unos
      // números de acceso.
      const contar = async (ref) => (await getCountFromServer(ref)).data().count;

      const [
        presupuestos,
        estados,
        remitos,
        recibos,
        documentos,
        consultas,
        consultasNoLeidas,
        listaPrecios,
        usuarios
      ] = await Promise.all([
        contar(collection(db, 'presupuestos')),
        contar(collection(db, 'estados')),
        contar(collection(db, 'remitos')),
        contar(collection(db, 'recibos')),
        contar(collection(db, 'documentos')),
        contar(collection(db, 'consultas')),
        contar(query(collection(db, 'consultas'), where('leida', '==', false))),
        contar(collection(db, 'listaPrecios')),
        contar(collection(db, 'usuarios'))
      ]);

      setTotales({
        presupuestos,
        estados,
        remitos,
        recibos,
        documentos,
        consultas,
        consultasNoLeidas,
        listaPrecios,
        usuarios
      });
    } catch (error) {
      console.error('Error al cargar totales:', error);
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
    },
    {
      id: 'consultas',
      titulo: 'Consultas',
      icono: MessageCircle,
      color: 'bg-emerald-600', // Distinto al resto para destacarlo
      colorClaro: 'bg-emerald-100',
      colorTexto: 'text-emerald-600',
      descripcion: 'Consultas recibidas desde la web',
      total: totales.consultas,
      badge: totales.consultasNoLeidas,
      rutas: {
        historial: '/admin/consultas'
      },
      activo: true,
      sinNuevo: true
    },
    {
      id: 'lista-precios',
      titulo: 'Lista de Precios',
      icono: Tag,
      color: 'bg-amber-600', // Distinto al resto para destacarlo
      colorClaro: 'bg-amber-100',
      colorTexto: 'text-amber-600',
      descripcion: 'Catálogo de items para presupuestos',
      total: totales.listaPrecios,
      rutas: {
        historial: '/admin/lista-precios'
      },
      activo: true,
      sinNuevo: true,
      textoAcceso: 'Ver catálogo',
      iconoAcceso: Tag
    },
    {
      id: 'usuarios',
      titulo: 'Usuarios',
      icono: UserCog,
      color: 'bg-indigo-600', // Distinto al resto para destacarlo
      colorClaro: 'bg-indigo-100',
      colorTexto: 'text-indigo-600',
      descripcion: 'Clientes, técnicos y roles',
      total: totales.usuarios,
      rutas: {
        historial: '/admin/usuarios'
      },
      activo: true,
      sinNuevo: true,
      textoAcceso: 'Ver usuarios',
      iconoAcceso: UserCog
    }
  ];

  return (
    <div>
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
        <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">
          {modulos.map(modulo => {
            const Icono = modulo.icono;
            return (
              <Link
                key={modulo.id}
                href={modulo.activo && !modulo.proximamente ? modulo.rutas.historial : '#'}
                className={`relative block h-full ${modulo.activo && !modulo.proximamente ? 'cursor-pointer' : 'opacity-75 cursor-default'
                  }`}
              >
                {modulo.proximamente && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/50">
                    <span className="px-3 py-1 text-xs font-semibold text-white bg-yellow-500 rounded-full">
                      Próximamente
                    </span>
                  </div>
                )}

                {/* Tarjeta de módulo: mismo diseño en mobile y escritorio */}
                <div
                  className={`flex flex-col overflow-hidden rounded-xl shadow-sm transition-all h-full ${modulo.activo && !modulo.proximamente ? 'hover:shadow-md hover:-translate-y-0.5' : ''}`}
                  style={{ transition: 'box-shadow 0.2s, transform 0.2s' }}
                >
                  <div className={`p-4 md:p-6 ${modulo.activo ? modulo.color : 'bg-gray-300'} text-white h-full flex flex-col`}>
                    <div className="flex items-start justify-between mb-2 md:mb-4">
                      <div className="relative p-2.5 rounded-xl bg-white/20 shadow-inner">
                        <Icono size={26} className="md:w-10 md:h-10" />
                        {modulo.badge > 0 && (
                          <span className="absolute flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -right-2">
                            {modulo.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold leading-none md:text-2xl">{modulo.total}</p>
                        <p className="text-[10px] opacity-80 uppercase font-semibold mt-1">Total</p>
                      </div>
                    </div>

                    <h4 className="text-base font-bold leading-tight md:text-lg">{modulo.titulo}</h4>
                    <p className="mt-1 text-sm opacity-90 line-clamp-2">{modulo.descripcion}</p>

                    {modulo.activo && !modulo.sinNuevo && (
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
                    {modulo.activo && modulo.sinNuevo && (
                      <div className="flex items-center justify-center mt-auto pt-3 md:pt-4 border-t border-white/10">
                        <span className="flex items-center text-sm md:text-lg font-bold bg-white/20 px-4 py-2 rounded-xl">
                          {(() => {
                            const IconoAcceso = modulo.iconoAcceso || MessageCircle;
                            return <IconoAcceso size={24} className="mr-2 md:w-7 md:h-7" />;
                          })()}
                          <span>{modulo.textoAcceso || 'Ver consultas'}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}