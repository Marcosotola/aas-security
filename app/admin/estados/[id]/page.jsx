// app/admin/estados/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Edit, ArrowLeft, Download, Printer } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { obtenerEstadoPorId } from '../../../lib/firestore';
import { use } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import EstadoPDF from '../../../components/pdf/EstadoPDF';

// Función para formatear montos con separador de miles (punto) y decimal (coma)
const formatMoney = (amount) => {
    if (amount === undefined || amount === null) return '$0,00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const formatted = num.toFixed(2).replace('.', ',');
    const parts = formatted.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return '$' + parts.join(',');
};

// Función para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

export default function VerEstado({ params }) {
  // Usar React.use para manejar params como una promesa
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    if (!id) return;

    // Verificar autenticación y cargar estado
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          // Cargar datos del estado
          const estadoData = await obtenerEstadoPorId(id);
          setEstado(estadoData);
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar estado:', error);
          alert('Error al cargar los datos del estado.');
          router.push('/admin/estados');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [id, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handlePrint = () => {
    window.print();
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del administrador - Solo visible en pantalla */}
      <header className="text-white shadow bg-primary print:hidden">
        <div className="container flex items-center justify-between px-4 py-20 mx-auto">
          <div className="flex items-center">
            <div className="relative mr-2">
              <div className="absolute inset-0 transform rotate-45 rounded-full bg-white/30"></div>
              <div className="absolute inset-0 transform scale-75 -rotate-45 rounded-full bg-white/20"></div>
            </div>
            <h1 className="text-xl font-bold font-montserrat">Panel de Administración</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center p-2 text-white rounded-md hover:bg-primary-light"
            >
              <LogOut size={18} className="mr-2" /> Salir
            </button>
          </div>
        </div>
      </header>

      {/* Navegación y acciones - Solo visible en pantalla */}
      <div className="container px-4 py-8 mx-auto print:hidden">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              <Home size={16} className="mr-1" /> Dashboard
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link
              href="/admin/estados"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              Estados
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Vista Previa</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <Link
              href="/admin/estados"
              className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
            >
              <ArrowLeft size={18} className="mr-2" /> Volver
            </Link>
            <Link
              href={`/admin/estados/editar/${id}`}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-secondary hover:bg-blue-600"
            >
              <Edit size={18} className="mr-2" /> Editar
            </Link>

            <PDFDownloadLink
              document={<EstadoPDF estado={estado} />}
              fileName={`${estado.numero}.pdf`}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
            >     
              {({ blob, url, loading, error }) =>
                loading ?
                  <span><span className="inline-block w-4 h-4 mr-2 border-t-2 border-white rounded-full animate-spin"></span> Generando PDF...</span> :
                  <span><Download size={18} className="mr-2" /> Descargar PDF</span>
              }
            </PDFDownloadLink>
          </div>
        </div>
      </div>

      {/* Documento estilo PDF */}
      <div className="container mx-auto print:container-none print:mx-0 print:max-w-none">
        <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none print:mx-0">
          
          {/* Encabezado de la empresa */}
          <div className="flex items-center justify-between p-8 border-b-4 border-blue-800">
            <div className="flex items-center">
              {/* Logo placeholder */}
              <div className="w-12 mr-4 bg-blue-800 rounded h-14"></div>
              <div>
                <h1 className="text-3xl font-bold">
                  <span className="text-blue-800">Sin</span>
                  <span className="text-blue-500">corp</span>
                </h1>
                <p className="text-sm text-gray-600">Servicios Integrales</p>
              </div>
            </div>
            <div className="text-sm text-right text-gray-700">
              <p>Email: sincorpserviciosintegrales@gmail.com</p>
              <p>Teléfono: (351) 681 0777</p>
              <p>Web: www.sincorp.vercel.app</p>
            </div>
          </div>

          {/* Título del documento */}
          <div className="py-6 text-center">
            <h2 className="text-2xl font-bold text-blue-800">ESTADO DE CUENTA</h2>
          </div>

          {/* Información principal en dos columnas */}
          <div className="grid grid-cols-1 gap-6 px-8 mb-6 md:grid-cols-2">
            {/* Datos del estado */}
            <div className="p-4 rounded-lg bg-gray-50">
              <h3 className="pb-2 mb-3 text-lg font-semibold text-blue-800 border-b border-gray-300">Datos</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-20 font-medium text-gray-700">Número:</span>
                  <span className="text-gray-900">{estado.numero}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-medium text-gray-700">Fecha:</span>
                  <span className="text-gray-900">{formatDate(estado.fecha)}</span>
                </div>
              </div>
            </div>

            {/* Información del cliente */}
            <div className="p-4 rounded-lg bg-gray-50">
              <h3 className="pb-2 mb-3 text-lg font-semibold text-blue-800 border-b border-gray-300">Cliente</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-20 font-medium text-gray-700">Nombre:</span>
                  <span className="text-gray-900">{estado.cliente.nombre || ''}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-medium text-gray-700">Empresa:</span>
                  <span className="text-gray-900">{estado.cliente.empresa || ''}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-medium text-gray-700">Email:</span>
                  <span className="text-gray-900">{estado.cliente.email || ''}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-medium text-gray-700">Tel:</span>
                  <span className="text-gray-900">{estado.cliente.telefono || ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de items */}
          <div className="px-8 mb-8">
            <h3 className="pb-2 mb-4 text-lg font-semibold text-blue-800 border-b border-gray-300">Reporte de avances</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="text-white bg-blue-800">
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase border-r border-blue-600">Fecha</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase border-r border-blue-600">Concepto</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase border-r border-blue-600">Monto</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Comentarios</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(estado.items || []).map((item, index) => (
                    <tr key={item.id} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                        {formatDate(item.fecha)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                        {item.descripcion || ''}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                        $ {formatMoney(parseFloat(item.precio || 0)).replace('$', '')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.comentarios || ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end mt-6">
              <div className="w-64">
                <div className="flex items-center justify-between py-3 border-t-2 border-blue-800">
                  <span className="text-lg font-bold text-blue-800">SALDO:</span>
                  <span className="text-lg font-bold text-blue-800">$ {formatMoney(estado.total).replace('$', '')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pie de página */}
          <div className="px-8 py-6 text-sm text-center text-gray-600 border-t-2 border-blue-800">
            <p className="font-medium">SINCORP Servicios Integrales - CUIT: 20-24471842-7</p>
            <p>Av. Luciano Torrent 4800, 5000 - Cordoba - Tel: (351) 681 0777 - www.sincorp.vercel.app</p>
          </div>
        </div>
      </div>

      {/* Estilos para impresión */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5in;
            size: A4;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:container-none {
            container: none !important;
          }
          .print\\:mx-0 {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}