// app/admin/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  DollarSign,
  FileCheck,
  Receipt,
  File,
  Files,
  MessageCircle,
  Tag,
  UserCog,
  Wallet,
  CreditCard,
  ClipboardList,
  ListChecks
} from 'lucide-react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStaffAuth } from '../../lib/useStaffAuth';
import { obtenerConfigSuscripcion } from '../../lib/firestore';
import { estaBloqueada } from '../../lib/suscripcion';
import ModuloCard from '../../components/admin/ModuloCard';

// Único módulo visible para el Técnico por ahora: el resto de las
// colecciones (movimientos, config, etc.) están bloqueadas para su rol por
// firestore.rules, así que ni siquiera se consultan cuando el usuario es
// Técnico (antes esto no importaba porque el dashboard era Admin-only).
const IDS_VISIBLES_PARA_TECNICO = ['ordenes-trabajo'];

export default function Dashboard() {
  const { user, usuario, loading: loadingAuth } = useStaffAuth(['Admin', 'Tecnico']);
  const [loadingData, setLoadingData] = useState(true);
  const [totales, setTotales] = useState({
    consultas: 0,
    consultasNoLeidas: 0
  });
  const [suscripcionVencida, setSuscripcionVencida] = useState(false);
  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!usuario) return;
    cargarTotales().then(() => setLoadingData(false));
  }, [usuario]);

  // Los módulos del dashboard ya no muestran cantidades (solo la tarjeta de
  // Consultas, que además usa el conteo de no leídas para el badge rojo), así
  // que acá solo se piden esos dos números y el estado de la suscripción --
  // nada de lo demás se lee más, para no gastar lecturas de Firestore en
  // datos que no se muestran en ningún lado.
  const cargarTotales = async () => {
    try {
      if (usuario.role === 'Tecnico') return;

      const contar = async (ref) => (await getCountFromServer(ref)).data().count;

      const [consultas, consultasNoLeidas, config] = await Promise.all([
        contar(collection(db, 'consultas')),
        contar(query(collection(db, 'consultas'), where('leida', '==', false))),
        obtenerConfigSuscripcion()
      ]);

      setTotales({ consultas, consultasNoLeidas });
      setSuscripcionVencida(estaBloqueada(config));
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

  // Presupuestos, Estados, Remitos, Recibos e Informes viven agrupados atrás
  // de una sola tarjeta "Documentos" (nada de tarjetas sueltas en el panel
  // principal): al tocar la tarjeta se entra al hub /admin/documentos (una
  // tarjeta por tipo, mismo estilo, cada una con su "Nuevo"), y el botón
  // "Nuevo" de esta tarjeta despliega el acceso directo para crear cada tipo
  // sin tener que entrar primero al hub.
  const modulos = [
    {
      id: 'ordenes-trabajo',
      titulo: 'Órdenes de Trabajo',
      icono: ClipboardList,
      color: 'bg-teal-700', // Verde azulado, distinto de los tonos ya usados
      colorClaro: 'bg-teal-100',
      colorTexto: 'text-teal-700',
      descripcion: 'Detalle del trabajo, fotos y firmas',
      rutas: {
        nuevo: '/admin/ordenes-trabajo/nueva',
        historial: '/admin/ordenes-trabajo'
      },
      activo: true
    },
    {
      id: 'documentos',
      titulo: 'Documentos',
      icono: Files,
      color: 'bg-[#154360]', // Deep Navy/Teal
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-[#154360]',
      descripcion: 'Presupuestos, remitos, recibos, estados e informes',
      rutas: {
        historial: '/admin/documentos'
      },
      activo: true,
      nuevoDropdown: true,
      nuevoAccesos: [
        { label: 'Nuevo Presupuesto', icono: FileText, href: '/admin/presupuestos/nuevo' },
        { label: 'Nuevo Estado de Cuenta', icono: DollarSign, href: '/admin/estados/nuevo' },
        { label: 'Nuevo Remito', icono: FileCheck, href: '/admin/remitos/nuevo' },
        { label: 'Nuevo Recibo', icono: Receipt, href: '/admin/recibos/nuevo' },
        { label: 'Nuevo Informe', icono: File, href: '/admin/informes/nuevo' }
      ]
    },
    {
      id: 'planillas',
      titulo: 'Planillas',
      icono: ListChecks,
      color: 'bg-slate-700',
      colorClaro: 'bg-slate-100',
      colorTexto: 'text-slate-700',
      descripcion: 'Plantillas de inspección para las OT',
      rutas: {
        nuevo: '/admin/planillas/nueva',
        historial: '/admin/planillas'
      },
      activo: true
    },
    {
      id: 'finanzas',
      titulo: 'Finanzas',
      icono: Wallet,
      color: 'bg-blue-900', // Azul de la familia del sitio, distinto de los tonos ya usados
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-blue-900',
      descripcion: 'Ingresos, gastos y ganancia real',
      rutas: {
        nuevo: '/admin/finanzas?nuevo=1',
        historial: '/admin/finanzas'
      },
      activo: true
    },
    {
      id: 'lista-precios',
      titulo: 'Lista de Precios',
      icono: Tag,
      color: 'bg-slate-600', // Slate más claro, dentro de la misma familia que Estados/Recibos
      colorClaro: 'bg-slate-100',
      colorTexto: 'text-slate-600',
      descripcion: 'Catálogo de items para presupuestos',
      rutas: {
        nuevo: '/admin/lista-precios?nuevo=1',
        historial: '/admin/lista-precios'
      },
      activo: true
    },
    {
      id: 'usuarios',
      titulo: 'Usuarios',
      icono: UserCog,
      color: 'bg-slate-900', // Slate más oscuro, dentro de la misma familia que Estados/Recibos
      colorClaro: 'bg-slate-200',
      colorTexto: 'text-slate-900',
      descripcion: 'Clientes, técnicos y roles',
      rutas: {
        nuevo: '/registro?origen=admin',
        historial: '/admin/usuarios'
      },
      activo: true
    },
    {
      id: 'consultas',
      titulo: 'Consultas',
      icono: MessageCircle,
      color: 'bg-[#3498DB]', // Azul info del sitio, dentro de la misma paleta que el resto
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-[#3498DB]',
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
      id: 'suscripcion',
      titulo: 'Suscripción',
      icono: CreditCard,
      color: 'bg-[#154360]', // Mismo azul oscuro que usaba antes la tarjeta de Informes
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-[#154360]',
      descripcion: 'Estado de pago y habilitación de la app',
      total: suscripcionVencida ? 'Vencida' : 'Al día',
      badge: suscripcionVencida ? 1 : 0,
      rutas: {
        historial: '/admin/suscripcion'
      },
      activo: true,
      sinNuevo: true,
      textoAcceso: 'Ver suscripción',
      iconoAcceso: CreditCard
    }
  ];

  // El Técnico solo ve las tarjetas que le corresponden (por ahora, Órdenes
  // de Trabajo): el resto de los módulos son de gestión administrativa.
  const modulosVisibles = usuario.role === 'Admin'
    ? modulos
    : modulos.filter((m) => IDS_VISIBLES_PARA_TECNICO.includes(m.id));

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
        <h3 className="mb-4 text-xl font-bold text-gray-800">Módulos del sistema</h3>
        <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">
          {modulosVisibles.map((modulo) => (
            <ModuloCard key={modulo.id} modulo={modulo} />
          ))}
        </div>
      </div>
    </div>
  );
}