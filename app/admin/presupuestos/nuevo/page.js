// app/admin/presupuestos/nuevo/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Save, Download, Eye, PlusCircle, Trash2, Percent, DollarSign } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { crearPresupuesto } from '../../../lib/firestore';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PresupuestoPDF from '../../../components/pdf/PresupuestoPDF';

// Función para formatear montos con separador de miles (punto) y decimal (coma)
const formatMoney = (amount) => {
    if (amount === undefined || amount === null) return '$0,00';

    // Convertir a número si es string
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Formatear con 2 decimales y reemplazar punto por coma para decimales
    const formatted = num.toFixed(2).replace('.', ',');

    // Agregar separadores de miles (puntos)
    const parts = formatted.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return '$' + parts.join(',');
};

export default function NuevoPresupuesto() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    
    // Estado para el modal de descripción
    const [modalDescripcion, setModalDescripcion] = useState({
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

    const [presupuesto, setPresupuesto] = useState({
        numero: `P-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        fecha: new Date().toISOString().split('T')[0],
        validez: '30 días',
        items: [
            { id: 1, descripcion: '', cantidad: '', precioUnitario: '', subtotal: 0 }
        ],
        notas: 'Este presupuesto tiene una validez de 30 días a partir de la fecha de emisión.',
        subtotal: 0,
        // Nuevos campos para descuentos
        tipoDescuento: 'ninguno', // 'ninguno', 'porcentaje', 'monto'
        valorDescuento: 0,
        montoDescuento: 0,
        total: 0
    });

    useEffect(() => {
        // Verificar autenticación con Firebase
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setLoading(false);
            } else {
                router.push('/admin');
            }
        });

        // Limpiar la suscripción al desmontar
        return () => unsubscribe();
    }, [router]);

    // Función para calcular totales incluyendo descuentos
    const calcularTotales = (items, tipoDescuento, valorDescuento) => {
        const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        let montoDescuento = 0;
        let total = subtotal;

        if (tipoDescuento === 'porcentaje' && valorDescuento > 0) {
            montoDescuento = (subtotal * valorDescuento) / 100;
        } else if (tipoDescuento === 'monto' && valorDescuento > 0) {
            montoDescuento = valorDescuento;
        }

        // Asegurar que el descuento no sea mayor al subtotal
        montoDescuento = Math.min(montoDescuento, subtotal);
        total = subtotal - montoDescuento;

        return { subtotal, montoDescuento, total };
    };

    // Función para abrir el modal de descripción
    const abrirModalDescripcion = (itemId, descripcion) => {
        setModalDescripcion({
            isOpen: true,
            itemId: itemId,
            value: descripcion
        });
    };

    // Función para guardar y cerrar el modal
    const guardarDescripcion = () => {
        handleItemChange(modalDescripcion.itemId, 'descripcion', modalDescripcion.value);
        setModalDescripcion({
            isOpen: false,
            itemId: null,
            value: ''
        });
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
        setCliente({ ...cliente, [name]: value });
    };

    const handleItemChange = (id, field, value) => {
        const updatedItems = presupuesto.items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'cantidad' || field === 'precioUnitario') {
                    const cantidad = parseFloat(updatedItem.cantidad) || 0;
                    const precio = parseFloat(updatedItem.precioUnitario) || 0;
                    updatedItem.subtotal = cantidad * precio;
                }
                return updatedItem;
            }
            return item;
        });

        const totales = calcularTotales(updatedItems, presupuesto.tipoDescuento, presupuesto.valorDescuento);

        setPresupuesto({
            ...presupuesto,
            items: updatedItems,
            ...totales
        });
    };

    // Función para manejar cambios en descuentos
    const handleDescuentoChange = (tipo, valor) => {
        const valorNumerico = parseFloat(valor) || 0;
        
        // Validaciones
        if (tipo === 'porcentaje' && valorNumerico > 100) {
            alert('El porcentaje de descuento no puede ser mayor a 100%');
            return;
        }

        const totales = calcularTotales(presupuesto.items, tipo, valorNumerico);

        setPresupuesto({
            ...presupuesto,
            tipoDescuento: tipo,
            valorDescuento: valorNumerico,
            ...totales
        });
    };

    const addItem = () => {
        const newId = Math.max(...presupuesto.items.map(item => item.id), 0) + 1;
        const newItems = [
            ...presupuesto.items,
            { id: newId, descripcion: '', cantidad: '', precioUnitario: '', subtotal: 0 }
        ];

        const totales = calcularTotales(newItems, presupuesto.tipoDescuento, presupuesto.valorDescuento);

        setPresupuesto({
            ...presupuesto,
            items: newItems,
            ...totales
        });
    };

    const removeItem = (id) => {
        if (presupuesto.items.length === 1) return;

        const updatedItems = presupuesto.items.filter(item => item.id !== id);
        const totales = calcularTotales(updatedItems, presupuesto.tipoDescuento, presupuesto.valorDescuento);

        setPresupuesto({
            ...presupuesto,
            items: updatedItems,
            ...totales
        });
    };

    const handleGuardarPresupuesto = async () => {
        setGuardando(true);
        try {
            // Preparar datos del presupuesto
            const presupuestoData = {
                numero: presupuesto.numero,
                fecha: presupuesto.fecha,
                validez: presupuesto.validez,
                cliente: cliente,
                items: presupuesto.items,
                notas: presupuesto.notas,
                subtotal: presupuesto.subtotal,
                tipoDescuento: presupuesto.tipoDescuento,
                valorDescuento: presupuesto.valorDescuento,
                montoDescuento: presupuesto.montoDescuento,
                total: presupuesto.total,
                estado: 'Pendiente',
                usuarioCreador: user.email
            };

            // Guardar en Firestore
            await crearPresupuesto(presupuestoData);
            alert('Presupuesto guardado exitosamente');
            router.push('/admin/presupuestos');
        } catch (error) {
            console.error('Error al guardar el presupuesto:', error);
            alert('Error al guardar el presupuesto. Inténtelo de nuevo más tarde.');
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
                            href="/admin/presupuestos"
                            className="flex items-center mr-4 text-primary hover:underline"
                        >
                            Presupuestos
                        </Link>
                        <span className="mx-2 text-gray-500">/</span>
                        <span className="text-gray-700">Nuevo Presupuesto</span>
                    </div>

                    <div className="flex mb-4 space-x-2">
                        <button
                            onClick={handleGuardarPresupuesto}
                            disabled={guardando}
                            className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
                        >
                            <Save size={18} className="mr-2" />
                            {guardando ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                            className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-secondary hover:bg-blue-600"
                        >
                            <PDFDownloadLink
                                document={<PresupuestoPDF presupuesto={{ ...presupuesto, cliente }} />}
                                fileName={`${presupuesto.numero}.pdf`}
                                className={`bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center ${!presupuesto.items[0].descripcion ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!presupuesto.items[0].descripcion}
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

                <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
                    Nuevo Presupuesto
                </h2>

                <div className="grid grid-cols-1 gap-6">
                    {/* Información del presupuesto */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Presupuesto</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Número</label>
                                <input
                                    type="text"
                                    value={presupuesto.numero}
                                    disabled
                                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha</label>
                                <input
                                    type="date"
                                    value={presupuesto.fecha}
                                    onChange={(e) => setPresupuesto({ ...presupuesto, fecha: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Validez</label>
                                <input
                                    type="text"
                                    value={presupuesto.validez}
                                    onChange={(e) => setPresupuesto({ ...presupuesto, validez: e.target.value })}
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

                    {/* Items del presupuesto */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="mb-4 text-lg font-semibold text-gray-700">Detalle del Presupuesto</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Descripción</th>
                                        <th className="w-24 px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Cantidad</th>
                                        <th className="w-32 px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Precio Unit.</th>
                                        <th className="w-32 px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Subtotal</th>
                                        <th className="w-16 px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {presupuesto.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-2">
                                                {/* Vista móvil - Botón que abre modal */}
                                                <div className="md:hidden">
                                                    <div 
                                                        onClick={() => abrirModalDescripcion(item.id, item.descripcion)}
                                                        className="min-h-[60px] p-3 border border-gray-300 rounded-md bg-gray-50 cursor-pointer flex items-center justify-between transition-colors hover:bg-gray-100"
                                                    >
                                                        <span className={`text-sm flex-1 ${item.descripcion ? 'text-gray-800' : 'text-gray-400'}`}>
                                                            {item.descripcion || 'Toca para agregar descripción'}
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
                                                        value={item.descripcion}
                                                        onChange={(e) => handleItemChange(item.id, 'descripcion', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-md min-h-[100px] resize-y"
                                                        placeholder="Descripción del servicio"
                                                        rows={5}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={item.cantidad}
                                                    onChange={(e) =>
                                                        handleItemChange(item.id, 'cantidad', e.target.value)
                                                    }
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={item.precioUnitario}
                                                    onChange={(e) =>
                                                        handleItemChange(item.id, 'precioUnitario', e.target.value)
                                                    }
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-4 py-2 font-medium text-gray-700">
                                                {formatMoney(item.subtotal)}
                                            </td>
                                            <td className="px-4 py-2">
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                    disabled={presupuesto.items.length === 1}
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

                        {/* Sección de Descuentos */}
                        <div className="p-4 mt-6 border rounded-lg bg-gray-50">
                            <h4 className="flex items-center mb-3 font-semibold text-gray-700 text-md">
                                <Percent size={16} className="mr-2" />
                                Descuentos
                            </h4>
                            
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {/* Tipo de descuento */}
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Tipo de descuento</label>
                                    <select
                                        value={presupuesto.tipoDescuento}
                                        onChange={(e) => handleDescuentoChange(e.target.value, presupuesto.valorDescuento)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="ninguno">Sin descuento</option>
                                        <option value="porcentaje">Porcentaje (%)</option>
                                        <option value="monto">Monto fijo ($)</option>
                                    </select>
                                </div>

                                {/* Valor del descuento */}
                                {presupuesto.tipoDescuento !== 'ninguno' && (
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            {presupuesto.tipoDescuento === 'porcentaje' ? 'Porcentaje (%)' : 'Monto ($)'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={presupuesto.valorDescuento}
                                                onChange={(e) => handleDescuentoChange(presupuesto.tipoDescuento, e.target.value)}
                                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md"
                                                placeholder="0"
                                                min="0"
                                                max={presupuesto.tipoDescuento === 'porcentaje' ? '100' : undefined}
                                                step={presupuesto.tipoDescuento === 'porcentaje' ? '1' : '0.01'}
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                {presupuesto.tipoDescuento === 'porcentaje' ? 
                                                    <Percent size={16} className="text-gray-400" /> : 
                                                    <DollarSign size={16} className="text-gray-400" />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Mostrar monto del descuento */}
                                {presupuesto.tipoDescuento !== 'ninguno' && presupuesto.montoDescuento > 0 && (
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">Descuento aplicado</label>
                                        <div className="px-3 py-2 font-medium text-red-700 border border-red-200 rounded-md bg-red-50">
                                            -{formatMoney(presupuesto.montoDescuento)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Totales mejorados */}
                        <div className="w-full mt-6 ml-auto md:w-80">
                            <div className="space-y-2">
                                <div className="flex justify-between py-2 text-sm border-t border-gray-200">
                                    <span className="text-gray-700">Subtotal:</span>
                                    <span className="font-medium">{formatMoney(presupuesto.subtotal)}</span>
                                </div>
                                
                                {presupuesto.montoDescuento > 0 && (
                                    <div className="flex justify-between py-2 text-sm text-red-600">
                                        <span>
                                            Descuento {presupuesto.tipoDescuento === 'porcentaje' ? 
                                                `(${presupuesto.valorDescuento}%)` : 
                                                '(monto fijo)'
                                            }:
                                        </span>
                                        <span className="font-medium">-{formatMoney(presupuesto.montoDescuento)}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between py-3 text-lg font-bold border-t border-b border-gray-800 text-primary">
                                    <span>TOTAL:</span>
                                    <span>{formatMoney(presupuesto.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notas adicionales */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="mb-4 text-lg font-semibold text-gray-700">Notas Adicionales</h3>
                        <textarea
                            value={presupuesto.notas}
                            onChange={(e) => setPresupuesto({ ...presupuesto, notas: e.target.value })}
                            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Información adicional, términos y condiciones, etc."
                        ></textarea>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => router.push('/admin/presupuestos')}
                            className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleGuardarPresupuesto}
                            disabled={guardando}
                            className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
                        >
                            <Save size={18} className="mr-2" />
                            {guardando ? 'Guardando...' : 'Guardar Presupuesto'}
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
                            <h3 className="text-lg font-semibold text-gray-800">Descripción del servicio</h3>
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
                                placeholder="Describe detalladamente el servicio o producto..."
                                autoFocus
                                style={{ minHeight: '200px' }}
                            />
                            
                            {/* Contador de caracteres */}
                            <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                                <span>{modalDescripcion.value.length} caracteres</span>
                                <span className="text-xs text-gray-400">Tip: Usa viñetas para mejor legibilidad</span>
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
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}