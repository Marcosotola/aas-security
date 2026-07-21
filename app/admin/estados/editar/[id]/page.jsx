// app/admin/estados/editar/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Save, Download, Eye, PlusCircle, Trash2 } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import { obtenerEstadoPorId, actualizarEstado } from '../../../../lib/firestore';
import { use } from 'react';

// Función para formatear montos con separador de miles (punto) y decimal (coma)
const formatMoney = (amount) => {
    if (amount === undefined || amount === null) return '$0,00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const formatted = num.toFixed(2).replace('.', ',');
    const parts = formatted.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return '$' + parts.join(',');
};

export default function EditarEstado({ params }) {
  // Usar React.use para manejar params como una promesa
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [estadoOriginal, setEstadoOriginal] = useState(null);

  // Estado para el modal de descripción
  const [modalDescripcion, setModalDescripcion] = useState({
    isOpen: false,
    itemId: null,
    value: ''
  });

  // Estado para el modal de comentarios
  const [modalComentarios, setModalComentarios] = useState({
    isOpen: false,
    itemId: null,
    value: ''
  });

  // Estado del formulario
  const [cliente, setCliente] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    direccion: ''
  });
  
  const [estado, setEstado] = useState({
    numero: '',
    fecha: '',
    items: [
      { id: 1, fecha: new Date().toISOString().split('T')[0], descripcion: '', precio: '', comentarios: '' }
    ],
    total: 0
  });

  useEffect(() => {
    if (!id) return;
    
    // Verificar autenticación y cargar estado
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          // Cargar datos del estado
          const estadoData = await obtenerEstadoPorId(id);
          setEstadoOriginal(estadoData);
          
          // Actualizar estado con los datos cargados
          setEstado({
            numero: estadoData.numero,
            fecha: estadoData.fecha,
            items: estadoData.items || [],
            total: estadoData.total || 0
          });
          
          setCliente(estadoData.cliente);
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

  // Función para abrir el modal de descripción
  const abrirModalDescripcion = (itemId, descripcion) => {
    setModalDescripcion({
      isOpen: true,
      itemId: itemId,
      value: descripcion || ''
    });
  };

  // Función para guardar y cerrar el modal de descripción
  const guardarDescripcion = () => {
    handleItemChange(modalDescripcion.itemId, 'descripcion', modalDescripcion.value);
    setModalDescripcion({
      isOpen: false,
      itemId: null,
      value: ''
    });
  };

  // Función para abrir el modal de comentarios
  const abrirModalComentarios = (itemId, comentarios) => {
    setModalComentarios({
      isOpen: true,
      itemId: itemId,
      value: comentarios || ''
    });
  };

  // Función para guardar y cerrar el modal de comentarios
  const guardarComentarios = () => {
    handleItemChange(modalComentarios.itemId, 'comentarios', modalComentarios.value);
    setModalComentarios({
      isOpen: false,
      itemId: null,
      value: ''
    });
  };

  // Función para verificar si es móvil
  const isMobile = () => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    setCliente({...cliente, [name]: value});
  };

  const handleItemChange = (id, field, value) => {
    const updatedItems = estado.items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    
    const total = updatedItems.reduce((sum, item) => sum + (parseFloat(item.precio) || 0), 0);
    
    setEstado({
      ...estado,
      items: updatedItems,
      total: total
    });
  };

  const addItem = () => {
    const newId = Math.max(...estado.items.map(item => item.id), 0) + 1;
    setEstado({
      ...estado,
      items: [
        ...estado.items,
        { id: newId, fecha: new Date().toISOString().split('T')[0], descripcion: '', precio: '', comentarios: '' }
      ]
    });
  };

  const removeItem = (id) => {
    if (estado.items.length === 1) return;
    
    const updatedItems = estado.items.filter(item => item.id !== id);
    const total = updatedItems.reduce((sum, item) => sum + (parseFloat(item.precio) || 0), 0);
    
    setEstado({
      ...estado,
      items: updatedItems,
      total: total
    });
  };

  const handleGuardarEstado = async () => {
    setGuardando(true);
    try {
      // Preparar datos del estado
      const estadoData = {
        numero: estado.numero,
        fecha: estado.fecha,
        cliente: cliente,
        items: estado.items,
        total: estado.total,
        estado: estadoOriginal.estado || 'Pendiente',
      };
      
      // Actualizar en Firestore
      await actualizarEstado(id, estadoData);
      alert('Estado actualizado exitosamente');
      router.push('/admin/estados');
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      alert('Error al actualizar el estado. Inténtelo de nuevo más tarde.');
    } finally {
      setGuardando(false);
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

      <div className="container px-4 py-8 mx-auto">
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
            <span className="text-gray-700">Editar Estado</span>
          </div>
          
          <div className="flex mb-4 space-x-2">
            <button
              onClick={handleGuardarEstado}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" /> 
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Editar Estado {estado.numero}
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {/* Información del estado */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Estado</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Número</label>
                <input 
                  type="text" 
                  value={estado.numero} 
                  disabled 
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha</label>
                <input 
                  type="date" 
                  value={estado.fecha}
                  onChange={(e) => setEstado({...estado, fecha: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          
          {/* Información del cliente */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Cliente</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Nombre</label>
                <input 
                  type="text" 
                  name="nombre"
                  value={cliente.nombre} 
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Empresa</label>
                <input 
                  type="text" 
                  name="empresa"
                  value={cliente.empresa} 
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={cliente.email} 
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Teléfono</label>
                <input 
                  type="text" 
                  name="telefono"
                  value={cliente.telefono} 
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">Dirección</label>
                <input 
                  type="text" 
                  name="direccion"
                  value={cliente.direccion} 
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          
          {/* Items del estado */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Reporte de avances</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="w-32 px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Fecha</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Concepto</th>
                    <th className="w-32 px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Monto</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Comentarios</th>
                    <th className="w-16 px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estado.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">
                        <input 
                          type="date" 
                          value={item.fecha || ''} 
                          onChange={(e) => handleItemChange(item.id, 'fecha', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        />
                      </td>
                      <td className="px-4 py-2">
                        {/* Vista móvil - Botón que abre modal */}
                        <div className="md:hidden">
                          <div 
                            onClick={() => abrirModalDescripcion(item.id, item.descripcion)}
                            className="min-h-[60px] p-3 border border-gray-300 rounded-md bg-gray-50 cursor-pointer flex items-center justify-between transition-colors hover:bg-gray-100"
                          >
                            <span className={`text-sm flex-1 ${item.descripcion ? 'text-gray-800' : 'text-gray-400'}`}>
                              {item.descripcion || 'Toca para editar concepto'}
                            </span>
                            <svg className="w-5 h-5 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </div>
                          {/* Preview del texto si existe */}
                          {item.descripcion && (
                            <div className="mt-2 text-xs text-gray-500">
                              {item.descripcion.length > 50 
                                ? `${item.descripcion.substring(0, 50)}...` 
                                : item.descripcion
                              }
                            </div>
                          )}
                        </div>
                        
                        {/* Vista desktop - Textarea normal */}
                        <div className="hidden md:block">
                          <textarea 
                            value={item.descripcion || ''} 
                            onChange={(e) => handleItemChange(item.id, 'descripcion', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md min-h-[60px] resize-y"
                            placeholder="Concepto del avance"
                            rows={2}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          value={item.precio || ''} 
                          onChange={(e) => handleItemChange(item.id, 'precio', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-2">
                        {/* Vista móvil - Botón que abre modal */}
                        <div className="md:hidden">
                          <div 
                            onClick={() => abrirModalComentarios(item.id, item.comentarios)}
                            className="min-h-[60px] p-3 border border-gray-300 rounded-md bg-gray-50 cursor-pointer flex items-center justify-between transition-colors hover:bg-gray-100"
                          >
                            <span className={`text-sm flex-1 ${item.comentarios ? 'text-gray-800' : 'text-gray-400'}`}>
                              {item.comentarios || 'Toca para editar comentarios'}
                            </span>
                            <svg className="w-5 h-5 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </div>
                          {/* Preview del texto si existe */}
                          {item.comentarios && (
                            <div className="mt-2 text-xs text-gray-500">
                              {item.comentarios.length > 50 
                                ? `${item.comentarios.substring(0, 50)}...` 
                                : item.comentarios
                              }
                            </div>
                          )}
                        </div>
                        
                        {/* Vista desktop - Textarea normal */}
                        <div className="hidden md:block">
                          <textarea 
                            value={item.comentarios || ''} 
                            onChange={(e) => handleItemChange(item.id, 'comentarios', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md min-h-[60px] resize-y"
                            placeholder="Comentarios adicionales"
                            rows={2}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={estado.items.length === 1}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4">
              <button 
                onClick={addItem}
                className="flex items-center text-blue-500 hover:text-blue-700"
              >
                <PlusCircle size={18} className="mr-1" /> Agregar ítem
              </button>
            </div>
            
            <div className="w-full mt-6 ml-auto md:w-64">
              <div className="flex justify-between py-2 text-lg font-bold border-t border-b border-gray-200">
                <span>Total:</span>
                <span>{formatMoney(estado.total)}</span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => router.push('/admin/estados')}
              className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardarEstado}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" /> 
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal para editar descripción */}
      {modalDescripcion.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col w-full h-full bg-white md:w-11/12 md:h-5/6 md:rounded-lg md:max-w-4xl">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 md:rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Editar concepto del avance</h3>
              <button
                onClick={() => setModalDescripcion({ isOpen: false, itemId: null, value: '' })}
                className="p-2 text-gray-500 transition-colors hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Contenido del modal */}
            <div className="flex flex-col flex-1 p-4 bg-white md:rounded-b-lg">
              <textarea
                value={modalDescripcion.value}
                onChange={(e) => setModalDescripcion({ ...modalDescripcion, value: e.target.value })}
                className="flex-1 w-full p-4 text-base border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Edita el concepto del avance...

Ejemplos:
• Avance 50% desarrollo módulo de usuarios actualizado
• Entrega de wireframes y diseño revisado
• Implementación sistema de autenticación completado
• Revisión y correcciones segunda etapa
• Instalación y configuración de servidor finalizado
• Capacitación equipo de trabajo fase 2 completada"
                autoFocus
                style={{ minHeight: '200px' }}
              />
              
              {/* Contador de caracteres */}
              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <span>{modalDescripcion.value.length} caracteres</span>
                <span className="text-xs text-gray-400">Tip: Especifica el porcentaje y tipo de avance</span>
              </div>
              
              {/* Botones del modal */}
              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={() => setModalDescripcion({ isOpen: false, itemId: null, value: '' })}
                  className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarDescripcion}
                  className="px-6 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar comentarios */}
      {modalComentarios.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col w-full h-full bg-white md:w-11/12 md:h-5/6 md:rounded-lg md:max-w-4xl">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 md:rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Editar comentarios del avance</h3>
              <button
                onClick={() => setModalComentarios({ isOpen: false, itemId: null, value: '' })}
                className="p-2 text-gray-500 transition-colors hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Contenido del modal */}
            <div className="flex flex-col flex-1 p-4 bg-white md:rounded-b-lg">
              <textarea
                value={modalComentarios.value}
                onChange={(e) => setModalComentarios({ ...modalComentarios, value: e.target.value })}
                className="flex-1 w-full p-4 text-base border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Edita los comentarios adicionales sobre el avance..."
                autoFocus
                style={{ minHeight: '200px' }}
              />
              
              {/* Contador de caracteres */}
              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <span>{modalComentarios.value.length} caracteres</span>
                <span className="text-xs text-gray-400">Tip: Incluye observaciones y notas importantes</span>
              </div>
              
              {/* Botones del modal */}
              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={() => setModalComentarios({ isOpen: false, itemId: null, value: '' })}
                  className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarComentarios}
                  className="px-6 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}