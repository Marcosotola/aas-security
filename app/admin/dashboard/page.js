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
  ClipboardList
} from 'lucide-react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStaffAuth } from '../../lib/useStaffAuth';
import { obtenerConfigSuscripcion } from '../../lib/firestore';
import { SUPER_ADMIN_EMAIL } from '../../lib/superAdmin';
import ModuloCard from '../../components/admin/ModuloCard';

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
    usuarios: 0,
    movimientos: 0
  });
  const [suscripcionVencida, setSuscripcionVencida] = useState(false);
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
        usuarios,
        movimientos,
        config
      ] = await Promise.all([
        contar(collection(db, 'presupuestos')),
        contar(collection(db, 'estados')),
        contar(collection(db, 'remitos')),
        contar(collection(db, 'recibos')),
        contar(collection(db, 'documentos')),
        contar(collection(db, 'consultas')),
        contar(query(collection(db, 'consultas'), where('leida', '==', false))),
        contar(collection(db, 'listaPrecios')),
        // El SuperAdmin nunca cuenta como "usuario" acá: mismo criterio que
        // obtenerUsuarios() en app/lib/firestore.js.
        contar(query(collection(db, 'usuarios'), where('email', '!=', SUPER_ADMIN_EMAIL))),
        contar(collection(db, 'movimientos')),
        obtenerConfigSuscripcion()
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
        usuarios,
        movimientos
      });

      const hoy = new Date().toISOString().split('T')[0];
      const vencida = Boolean(config.fechaVencimiento && config.fechaVencimiento < hoy);
      setSuscripcionVencida(config.appHabilitada === false || vencida);
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
  const totalDocumentos = totales.presupuestos + totales.estados + totales.remitos + totales.recibos + totales.documentos;

  // Definir módulos del sistema con totales
  const modulos = [
    {
      id: 'documentos',
      titulo: 'Documentos',
      icono: Files,
      color: 'bg-[#154360]', // Deep Navy/Teal
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-[#154360]',
      descripcion: 'Presupuestos, remitos, recibos, estados e informes',
      total: totalDocumentos,
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
      icono: ClipboardList,
      color: 'bg-teal-700', // Verde azulado, distinto de los tonos ya usados
      colorClaro: 'bg-teal-100',
      colorTexto: 'text-teal-700',
      descripcion: 'Próximamente',
      total: '-',
      rutas: {
        historial: '/admin/planillas'
      },
      activo: true,
      sinNuevo: true,
      textoAcceso: 'Ver planillas',
      iconoAcceso: ClipboardList
    },
    {
      id: 'finanzas',
      titulo: 'Finanzas',
      icono: Wallet,
      color: 'bg-blue-900', // Azul de la familia del sitio, distinto de los tonos ya usados
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-blue-900',
      descripcion: 'Ingresos, gastos y ganancia real',
      total: totales.movimientos,
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
      total: totales.listaPrecios,
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
      total: totales.usuarios,
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
          {modulos.map((modulo) => (
            <ModuloCard key={modulo.id} modulo={modulo} />
          ))}
        </div>
      </div>
    </div>
  );
}