// app/admin/documentos/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, FileText, DollarSign, FileCheck, Receipt, File, Banknote } from 'lucide-react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStaffAuth } from '../../lib/useStaffAuth';
import ModuloCard from '../../components/admin/ModuloCard';

// Hub de "Documentos": agrupa los 5 tipos de documento (Presupuestos, Estados
// de Cuenta, Remitos, Recibos, Informes) con las mismas tarjetas que el panel
// principal (ver app/components/admin/ModuloCard.jsx), para no perder ese
// estilo al sacarlos del dashboard y agruparlos bajo un solo acceso.
export default function DocumentosHub() {
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [totales, setTotales] = useState({
    presupuestos: 0,
    estados: 0,
    remitos: 0,
    recibos: 0,
    documentos: 0,
    facturas: 0
  });
  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const contar = async (ref) => (await getCountFromServer(ref)).data().count;
        const [presupuestos, estados, remitos, recibos, documentos, facturas] = await Promise.all([
          contar(collection(db, 'presupuestos')),
          contar(collection(db, 'estados')),
          contar(collection(db, 'remitos')),
          contar(collection(db, 'recibos')),
          contar(collection(db, 'documentos')),
          contar(collection(db, 'facturas'))
        ]);
        setTotales({ presupuestos, estados, remitos, recibos, documentos, facturas });
      } catch (error) {
        console.error('Error al cargar totales de documentos:', error);
      } finally {
        setLoadingData(false);
      }
    })();
  }, [user]);

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

  const modulos = [
    {
      id: 'presupuestos',
      titulo: 'Presupuestos',
      icono: FileText,
      color: 'bg-[#1A5276]',
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
      color: 'bg-slate-700',
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
      color: 'bg-[#2E86C1]',
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-[#2E86C1]',
      descripcion: 'Gestión de remitos',
      total: totales.remitos,
      rutas: {
        nuevo: '/admin/remitos/nuevo',
        historial: '/admin/remitos'
      },
      activo: true
    },
    {
      id: 'recibos',
      titulo: 'Recibos',
      icono: Receipt,
      color: 'bg-slate-800',
      colorClaro: 'bg-slate-200',
      colorTexto: 'text-slate-800',
      descripcion: 'Administrar recibos',
      total: totales.recibos,
      rutas: {
        nuevo: '/admin/recibos/nuevo',
        historial: '/admin/recibos'
      },
      activo: true
    },
    {
      id: 'informes',
      titulo: 'Informes',
      icono: File,
      color: 'bg-[#154360]',
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-[#154360]',
      descripcion: 'Hojas membretadas y certificaciones',
      total: totales.documentos,
      rutas: {
        nuevo: '/admin/informes/nuevo',
        historial: '/admin/informes'
      },
      activo: true
    },
    {
      id: 'facturas',
      titulo: 'Facturación',
      icono: Banknote,
      color: 'bg-emerald-700',
      colorClaro: 'bg-emerald-100',
      colorTexto: 'text-emerald-700',
      descripcion: 'Facturas emitidas, PDF y estado de pago',
      total: totales.facturas,
      rutas: {
        nuevo: '/admin/facturas/nueva',
        historial: '/admin/facturas'
      },
      activo: true
    }
  ];

  return (
    <div>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
            <Home size={16} className="mr-1" /> Panel
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">Documentos</span>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Documentos
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 md:gap-4">
          {modulos.map((modulo) => (
            <ModuloCard key={modulo.id} modulo={modulo} />
          ))}
        </div>
      </div>
    </div>
  );
}
