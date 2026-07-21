// app/admin/remitos/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Edit, ArrowLeft, Download, Trash } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import { use } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RemitoPDF from '../../../components/pdf/RemitoPDF';

export default function VerRemito({ params }) {
  // Usar React.use para manejar params como una promesa
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remito, setRemito] = useState(null);

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

  useEffect(() => {
    if (!id) return;

    // Verificar autenticación y cargar remito
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          // Cargar datos del remito
          const remitoDoc = doc(db, 'remitos', id);
          const remitoSnapshot = await getDoc(remitoDoc);
          
          if (remitoSnapshot.exists()) {
            setRemito({ id: remitoSnapshot.id, ...remitoSnapshot.data() });
          } else {
            alert('Remito no encontrado.');
            router.push('/admin/remitos');
          }
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar remito:', error);
          alert('Error al cargar los datos del remito.');
          router.push('/admin/remitos');
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

  const handleDeleteRemito = async () => {
    if (confirm('¿Está seguro de que desea eliminar este remito?')) {
      try {
        await deleteDoc(doc(db, 'remitos', id));
        alert('Remito eliminado exitosamente.');
        router.push('/admin/remitos');
      } catch (error) {
        console.error('Error al eliminar remito:', error);
        alert('Error al eliminar el remito.');
      }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del administrador */}
      <header className="text-white shadow bg-primary">
        <div className="container flex items-center justify-between px-4 py-4 mx-auto">
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

      {/* Navegación y controles */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <Link
                href="/admin/dashboard"
                className="flex items-center mr-4 text-primary hover:underline"
              >
                <Home size={16} className="mr-1" /> Dashboard
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <Link
                href="/admin/remitos"
                className="flex items-center mr-4 text-primary hover:underline"
              >
                Remitos
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="text-gray-700">Detalles</span>
            </div>

            <div className="flex space-x-2">
              <Link
                href="/admin/remitos"
                className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-2" /> Volver
              </Link>
              <Link
                href={`/admin/remitos/editar/${id}`}
                className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-secondary hover:bg-blue-600"
              >
                <Edit size={18} className="mr-2" /> Editar
              </Link>
              <button
                onClick={handleDeleteRemito}
                className="flex items-center px-4 py-2 text-white transition-colors bg-red-500 rounded-md hover:bg-red-600"
              >
                <Trash size={18} className="mr-2" /> Eliminar
              </button>
              <button
                title="Descargar PDF"
                className="flex px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark"
              >
                <PDFDownloadLink
                  document={<RemitoPDF remito={remito} />}
                  fileName={`${remito.numero}.pdf`}
                  className="flex text-white"
                >     
                  {({ blob, url, loading, error }) =>
                    loading ?
                      <span><span className="inline-block w-4 h-4 mr-2 border-t-2 border-white rounded-full animate-spin"></span> Generando PDF...</span> :
                      <span><Download size={18} className="mr-2" /> Descargar PDF</span>
                  }
                </PDFDownloadLink>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vista previa estilo PDF */}
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto bg-white shadow-lg">
          {/* Encabezado estilo PDF */}
          <div className="flex items-center justify-between px-8 py-6 border-b-2 border-blue-800">
            <div className="flex items-center">
              <div className="mr-3">
                {/* Logo placeholder */}
                <div className="flex items-center justify-center w-8 h-10 font-bold text-white bg-blue-800 rounded">
                  S
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  <span className="text-blue-800">Sin</span>
                  <span className="text-blue-500">corp</span>
                </div>
                <div className="text-xs text-gray-600">Servicios Integrales</div>
              </div>
            </div>
            <div className="text-xs text-right text-gray-700">
              <div>Email: sincorpserviciosintegrales@gmail.com</div>
              <div>Teléfono: (351) 681 0777</div>
              <div>Web: www.sincorp.vercel.app</div>
            </div>
          </div>

          {/* Título */}
          <div className="px-8 py-4">
            <h1 className="text-xl font-bold text-center text-blue-800">REMITO</h1>
          </div>

          {/* Información en dos columnas */}
          <div className="flex px-8 py-4 space-x-6">
            {/* Información del remito */}
            <div className="flex-1 p-4 rounded bg-gray-50">
              <h3 className="p-2 mb-3 text-sm font-bold text-blue-800 bg-gray-100 rounded">Detalles del Remito</h3>
              <div className="space-y-2 text-xs">
                <div className="flex">
                  <span className="w-20 font-bold">Número:</span>
                  <span className="flex-1">{remito.numero || ''}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-bold">Fecha:</span>
                  <span className="flex-1">{formatDate(remito.fecha)}</span>
                </div>
              </div>
            </div>

            {/* Información del cliente */}
            <div className="flex-1 p-4 rounded bg-gray-50">
              <h3 className="p-2 mb-3 text-sm font-bold text-blue-800 bg-gray-100 rounded">Cliente</h3>
              <div className="space-y-2 text-xs">
                <div className="flex">
                  <span className="w-20 font-bold">Nombre:</span>
                  <span className="flex-1">{remito.cliente?.nombre || ''}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-bold">Empresa:</span>
                  <span className="flex-1">{remito.cliente?.empresa || ''}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-bold">Dirección:</span>
                  <span className="flex-1">{remito.cliente?.direccion || ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de items */}
          <div className="px-8 py-4">
            <h3 className="p-2 mb-3 text-sm font-bold text-blue-800 bg-gray-100 rounded">Detalle de Artículos</h3>
            
            {/* Encabezado de tabla */}
            <div className="flex text-xs font-bold text-white bg-blue-800">
              <div className="flex-1 p-3 pr-4">Descripción</div>
              <div className="w-24 p-3 text-center">Cantidad</div>
              <div className="w-24 p-3 text-center">Unidad</div>
            </div>
            
            {/* Filas de items */}
            {(remito.items || []).map((item, index) => (
              <div key={item.id} className={`flex text-xs border-b border-gray-200 ${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="flex-1 p-3 pr-4">{item.descripcion || ''}</div>
                <div className="w-24 p-3 text-center">{item.cantidad || ''}</div>
                <div className="w-24 p-3 text-center">{item.unidad || ''}</div>
              </div>
            ))}
          </div>

          {/* Observaciones */}
          {remito.observaciones && (
            <div className="px-8 py-4">
              <h3 className="p-2 mb-3 text-sm font-bold text-blue-800 bg-gray-100 rounded">Observaciones</h3>
              <div className="p-4 text-xs whitespace-pre-line rounded bg-gray-50">
                {remito.observaciones}
              </div>
            </div>
          )}

          {/* Sección de firma */}
          <div className="flex justify-center px-8 py-12 mt-8">
            <div className="flex flex-col items-center w-1/2">
              {remito.firma && (
                <div className="flex items-center justify-center w-40 h-16 mb-2 border border-gray-200 rounded bg-gray-50">
                  <img 
                    src={remito.firma} 
                    alt="Firma" 
                    className="object-contain max-w-full max-h-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <span style={{display: 'none'}} className="text-xs text-gray-400">Firma no disponible</span>
                </div>
              )}
              <div className="w-full pt-2 border-t border-gray-800">
                <div className="text-xs text-center">Recibí conforme</div>
                <div className="mt-1 text-xs font-bold text-center">
                  {remito.aclaracionFirma || 'Sin aclaración'}
                </div>
              </div>
            </div>
          </div>

          {/* Pie de página */}
          <div className="px-8 py-4 text-xs text-center text-gray-600 border-t border-blue-800">
            <div>SINCORP Servicios Integrales - CUIT: 20-24471842-7</div>
            <div>Av. Luciano Torrent 4800, 5000 - Córdoba - Tel: (351) 681 0777 - www.sincorp.vercel.app</div>
          </div>
        </div>
      </div>
    </div>
  );
}