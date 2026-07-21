// app/admin/presupuestos/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Edit, ArrowLeft, Download, Check, X } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { obtenerPresupuestoPorId, actualizarPresupuesto } from '../../../lib/firestore';
import { use } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PresupuestoPDF from '../../../components/pdf/PresupuestoPDF';

export default function VerPresupuesto({ params }) {
  // Usar React.use para manejar params como una promesa
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [presupuesto, setPresupuesto] = useState(null);
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  // Función para formatear montos con punto como separador de miles y coma para decimales
  const formatearMonto = (valor) => {
    if (isNaN(valor)) return "0,00";
    
    // Convertir a número si es string
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    
    // Formatear con separador de miles (punto) y decimales (coma)
    return num.toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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

  useEffect(() => {
    if (!id) return;

    // Verificar autenticación y cargar presupuesto
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          // Cargar datos del presupuesto
          const presupuestoData = await obtenerPresupuestoPorId(id);
          setPresupuesto(presupuestoData);
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar presupuesto:', error);
          alert('Error al cargar los datos del presupuesto.');
          router.push('/admin/presupuestos');
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

  // Función para manejar el cambio de estado
  const handleCambiarEstado = async (nuevoEstado) => {
    if (presupuesto.estado === nuevoEstado) return;

    if (confirm(`¿Está seguro de cambiar el estado a "${nuevoEstado}"?`)) {
      setCambiandoEstado(true);
      try {
        await actualizarPresupuesto(id, {
          estado: nuevoEstado,
          fechaActualizacionEstado: new Date()
        });

        // Actualizar el estado local
        setPresupuesto({
          ...presupuesto,
          estado: nuevoEstado
        });

        alert(`El presupuesto ha sido marcado como "${nuevoEstado}".`);
      } catch (error) {
        console.error('Error al cambiar el estado:', error);
        alert('Error al cambiar el estado del presupuesto.');
      } finally {
        setCambiandoEstado(false);
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
                href="/admin/presupuestos"
                className="flex items-center mr-4 text-primary hover:underline"
              >
                Presupuestos
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="text-gray-700">Detalles</span>
            </div>

            <div className="flex space-x-2">
              <Link
                href="/admin/presupuestos"
                className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-2" /> Volver
              </Link>
              <Link
                href={`/admin/presupuestos/editar/${id}`}
                className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-secondary hover:bg-blue-600"
              >
                <Edit size={18} className="mr-2" /> Editar
              </Link>
              <button
                title="Descargar PDF"
                className="flex px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark"
              >
                <PDFDownloadLink
                  document={<PresupuestoPDF presupuesto={presupuesto} />}
                  fileName={`${presupuesto.numero}.pdf`}
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
            <h1 className="text-xl font-bold text-center text-blue-800">PRESUPUESTO</h1>
          </div>

          {/* Información en dos columnas */}
          <div className="flex px-8 py-4 space-x-6">
            {/* Información del presupuesto */}
            <div className="flex-1 p-4 rounded bg-gray-50">
              <h3 className="p-2 mb-3 text-sm font-bold text-blue-800 bg-gray-100 rounded">Detalles del Presupuesto</h3>
              <div className="space-y-2 text-xs">
                <div className="flex">
                  <span className="w-20 font-bold">Número:</span>
                  <span className="flex-1">{presupuesto.numero || ''}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-bold">Fecha:</span>
                  <span className="flex-1">{formatDate(presupuesto.fecha)}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-bold">Validez:</span>
                  <span className="flex-1">{presupuesto.validez || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-20 font-bold">Estado:</span>
                  <div className="flex items-center flex-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold mr-2
                      ${presupuesto.estado === 'Aprobado' ? 'bg-green-100 text-green-800' :
                        presupuesto.estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                      {presupuesto.estado}
                    </span>
                    {/* Botones para cambiar estado */}
                    <div className="flex ml-2 space-x-1">
                      <button
                        onClick={() => handleCambiarEstado('Aprobado')}
                        disabled={presupuesto.estado === 'Aprobado' || cambiandoEstado}
                        className={`p-1 rounded-md ${presupuesto.estado === 'Aprobado' ? 'bg-green-100 text-green-800 cursor-default' : 'bg-white text-green-600 hover:bg-green-50 border border-green-200'}`}
                        title="Aprobar presupuesto"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        onClick={() => handleCambiarEstado('Rechazado')}
                        disabled={presupuesto.estado === 'Rechazado' || cambiandoEstado}
                        className={`p-1 rounded-md ${presupuesto.estado === 'Rechazado' ? 'bg-red-100 text-red-800 cursor-default' : 'bg-white text-red-600 hover:bg-red-50 border border-red-200'}`}
                        title="Rechazar presupuesto"
                      >
                        <X size={12} />
                      </button>
                      <button
                        onClick={() => handleCambiarEstado('Pendiente')}
                        disabled={presupuesto.estado === 'Pendiente' || cambiandoEstado}
                        className={`p-1 rounded-md text-xs font-bold ${presupuesto.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800 cursor-default' : 'bg-white text-yellow-600 hover:bg-yellow-50 border border-yellow-200'}`}
                        title="Marcar como pendiente"
                      >
                        P
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del cliente */}
            <div className="flex-1 p-4 rounded bg-gray-50">
              <h3 className="p-2 mb-3 text-sm font-bold text-blue-800 bg-gray-100 rounded">Cliente</h3>
              <div className="space-y-2 text-xs">
                <div className="flex">
                  <span className="w-20 font-bold">Nombre:</span>
                  <span className="flex-1">{presupuesto.cliente?.nombre || ''}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-bold">Empresa:</span>
                  <span className="flex-1">{presupuesto.cliente?.empresa || ''}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-bold">Email:</span>
                  <span className="flex-1">{presupuesto.cliente?.email || ''}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-bold">Tel:</span>
                  <span className="flex-1">{presupuesto.cliente?.telefono || ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de items */}
          <div className="px-8 py-4">
            <h3 className="p-2 mb-3 text-sm font-bold text-blue-800 bg-gray-100 rounded">Detalle de Items</h3>
            
            {/* Encabezado de tabla */}
            <div className="flex text-xs font-bold text-white bg-blue-800">
              <div className="flex-1 p-3 pr-4">Descripción</div>
              <div className="w-20 p-3 text-center">Cant.</div>
              <div className="p-3 text-center w-28">Precio Unit.</div>
              <div className="p-3 text-center w-28">Subtotal</div>
            </div>
            
            {/* Filas de items */}
            {(presupuesto.items || []).map((item, index) => (
              <div key={item.id} className={`flex text-xs border-b border-gray-200 ${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="flex-1 p-3 pr-4">{item.descripcion || ''}</div>
                <div className="w-20 p-3 text-center">{parseFloat(item.cantidad || 0)}</div>
                <div className="p-3 text-center w-28">$ {formatearMonto(parseFloat(item.precioUnitario || 0))}</div>
                <div className="p-3 font-medium text-center w-28">$ {formatearMonto(parseFloat(item.subtotal || 0))}</div>
              </div>
            ))}

            {/* Totales con descuentos */}
            <div className="flex justify-end mt-4">
              <div className="w-80">
                <div className="flex justify-between py-2 text-xs border-t border-gray-200">
                  <span>Subtotal:</span>
                  <span className="font-medium">$ {formatearMonto(parseFloat(presupuesto.subtotal || 0))}</span>
                </div>
                
                {/* Mostrar descuento si existe */}
                {presupuesto.montoDescuento && presupuesto.montoDescuento > 0 && (
                  <div className="flex justify-between py-2 text-xs text-red-600">
                    <span>
                      Descuento {presupuesto.tipoDescuento === 'porcentaje' ? 
                        `(${presupuesto.valorDescuento}%)` : 
                        '(monto fijo)'
                      }:
                    </span>
                    <span className="font-medium">-$ {formatearMonto(parseFloat(presupuesto.montoDescuento))}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-3 text-sm font-bold text-blue-800 border-t border-gray-800">
                  <span>TOTAL:</span>
                  <span>$ {formatearMonto(parseFloat(presupuesto.total || 0))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="px-8 py-4">
            <h3 className="p-2 mb-3 text-sm font-bold text-blue-800 bg-gray-100 rounded">Notas y Condiciones</h3>
            <div className="p-4 text-xs whitespace-pre-line rounded bg-gray-50">
              {presupuesto.notas || ''}
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