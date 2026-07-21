'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Save, Download, Eye, PlusCircle, Trash2, RefreshCw } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { crearRemito } from '../../../lib/firestore';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RemitoPDF from '../../../components/pdf/RemitoPDF';
import SignatureCanvas from 'react-signature-canvas';

export default function NuevoRemito() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [showCanvas, setShowCanvas] = useState(true);
    const sigCanvas = useRef({});

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

    const [remito, setRemito] = useState({
        numero: `R-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        fecha: new Date().toISOString().split('T')[0],
        items: [
            { id: 1, descripcion: '', cantidad: '', unidad: 'UN' }
        ],
        observaciones: '',
        firma: null,
        aclaracionFirma: '' // Nuevo campo
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

        return () => unsubscribe();
    }, [router]);

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
        setCliente({ ...cliente, [name]: value });
    };

    const handleItemChange = (id, field, value) => {
        const updatedItems = remito.items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        });

        setRemito({
            ...remito,
            items: updatedItems
        });
    };

    const addItem = () => {
        const newId = Math.max(...remito.items.map(item => item.id), 0) + 1;
        setRemito({
            ...remito,
            items: [
                ...remito.items,
                { id: newId, descripcion: '', cantidad: '', unidad: 'UN' }
            ]
        });
    };

    const removeItem = (id) => {
        if (remito.items.length === 1) return;

        const updatedItems = remito.items.filter(item => item.id !== id);
        setRemito({
            ...remito,
            items: updatedItems
        });
    };

    const clearSignature = () => {
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
        setRemito({ ...remito, firma: null });
        setShowCanvas(true);
    };

    const saveSignature = () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            try {
                const firmaData = sigCanvas.current.toDataURL('image/png');
                setRemito({ ...remito, firma: firmaData });
                setShowCanvas(false);
                alert('Firma guardada');
            } catch (error) {
                console.error('Error al guardar firma:', error);
                alert('Error al guardar la firma');
            }
        } else {
            alert('Por favor, firme antes de guardar');
        }
    };

    const handleGuardarRemito = async () => {
        setGuardando(true);
        try {
            const remitoData = {
                numero: remito.numero,
                fecha: remito.fecha,
                cliente: cliente,
                items: remito.items,
                observaciones: remito.observaciones,
                firma: remito.firma,
                aclaracionFirma: remito.aclaracionFirma, // Incluir la aclaración
                usuarioCreador: user.email
            };

            await crearRemito(remitoData);
            alert('Remito guardado exitosamente');
            router.push('/admin/remitos');
        } catch (error) {
            console.error('Error al guardar el remito:', error);
            alert('Error al guardar el remito. Inténtelo de nuevo más tarde.');
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
                            href="/admin/remitos"
                            className="flex items-center mr-4 text-primary hover:underline"
                        >
                            Remitos
                        </Link>
                        <span className="mx-2 text-gray-500">/</span>
                        <span className="text-gray-700">Nuevo Remito</span>
                    </div>

                    <div className="flex mb-4 space-x-2">
                        <button
                            onClick={handleGuardarRemito}
                            disabled={guardando}
                            className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
                        >
                            <Save size={18} className="mr-2" />
                            {guardando ? 'Guardando...' : 'Guardar'}
                        </button>
                        {remito.items[0].descripcion && (
                            <PDFDownloadLink
                                document={<RemitoPDF remito={{ ...remito, cliente, firma: remito.firma || null }} />}
                                fileName={`${remito.numero}.pdf`}
                                className={`bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center`}
                            >
                                {({ blob, url, loading, error }) =>
                                    loading ?
                                        <span><span className="inline-block w-4 h-4 mr-2 border-t-2 border-white rounded-full animate-spin"></span> Generando PDF...</span> :
                                        <span><Download size={18} className="mr-2" /> Descargar PDF</span>
                                }
                            </PDFDownloadLink>
                        )}
                    </div>
                </div>

                <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
                    Nuevo Remito
                </h2>

                <div className="grid grid-cols-1 gap-6">
                    {/* Información del remito */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Remito</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Número</label>
                                <input
                                    type="text"
                                    value={remito.numero}
                                    disabled
                                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha</label>
                                <input
                                    type="date"
                                    value={remito.fecha}
                                    onChange={(e) => setRemito({ ...remito, fecha: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
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

                    {/* Items del remito */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="mb-4 text-lg font-semibold text-gray-700">Detalle del Remito</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Descripción</th>
                                        <th className="w-24 px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Cantidad</th>
                                        <th className="w-24 px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Unidad</th>
                                        <th className="w-16 px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {remito.items.map((item) => (
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
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-md min-h-[60px] resize-y"
                                                        placeholder="Descripción del ítem"
                                                        rows={2}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={item.cantidad}
                                                    onChange={(e) => handleItemChange(item.id, 'cantidad', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <select
                                                    value={item.unidad}
                                                    onChange={(e) => handleItemChange(item.id, 'unidad', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                >
                                                    <option value="UN">UN</option>
                                                    <option value="KG">KG</option>
                                                    <option value="LT">LT</option>
                                                    <option value="MT">MT</option>
                                                    <option value="M2">M2</option>
                                                    <option value="M3">M3</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                    disabled={remito.items.length === 1}
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
                    </div>

                    {/* Firma Digital */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="mb-4 text-lg font-semibold text-gray-700">Firma de Recepción</h3>

                        {remito.firma && !showCanvas ? (
                            <div className="text-center">
                                <img
                                    src={remito.firma}
                                    alt="Firma"
                                    className="mx-auto mb-2 border border-gray-300 rounded"
                                    style={{ maxWidth: '300px', height: '150px', objectFit: 'contain' }}
                                />
                                <p className="mb-4 text-sm font-medium text-gray-700">{remito.aclaracionFirma || 'Sin aclaración'}</p>
                            </div>
                        ) : (
                            <div>
                                <div className="mb-4 overflow-hidden border-2 border-gray-300 rounded-md" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
                                    <SignatureCanvas
                                        ref={sigCanvas}
                                        canvasProps={{
                                            width: 500,
                                            height: 200,
                                            className: 'signature-canvas',
                                            style: { width: '100%', height: 'auto' }
                                        }}
                                        backgroundColor="#f9f9f9"
                                    />
                                </div>

                                {/* Campo de aclaración */}
                                <div className="mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Aclaración de firma
                                    </label>
                                    <input
                                        type="text"
                                        value={remito.aclaracionFirma}
                                        onChange={(e) => setRemito({ ...remito, aclaracionFirma: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Nombre y apellido"
                                    />
                                </div>

                                <div className="flex justify-center space-x-2">
                                    <button
                                        onClick={saveSignature}
                                        type="button"
                                        className="flex items-center px-4 py-2 text-white transition-colors bg-green-500 rounded-md hover:bg-green-600"
                                    >
                                        <Save size={18} className="mr-2" /> Guardar firma
                                    </button>
                                    <button
                                        onClick={() => {
                                            clearSignature();
                                            setRemito({ ...remito, aclaracionFirma: '' });
                                        }}
                                        type="button"
                                        className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        <RefreshCw size={18} className="mr-2" /> Limpiar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Observaciones */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="mb-4 text-lg font-semibold text-gray-700">Observaciones</h3>
                        <textarea
                            value={remito.observaciones}
                            onChange={(e) => setRemito({ ...remito, observaciones: e.target.value })}
                            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Observaciones adicionales..."
                        ></textarea>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => router.push('/admin/remitos')}
                            className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleGuardarRemito}
                            disabled={guardando}
                            className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
                        >
                            <Save size={18} className="mr-2" />
                            {guardando ? 'Guardando...' : 'Guardar Remito'}
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
                            <h3 className="text-lg font-semibold text-gray-800">Descripción del ítem</h3>
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
                                placeholder="Describe detalladamente el ítem del remito..."
                                autoFocus
                                style={{ minHeight: '200px' }}
                            />
                            
                            {/* Contador de caracteres */}
                            <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                                <span>{modalDescripcion.value.length} caracteres</span>
                                <span className="text-xs text-gray-400">Tip: Incluye detalles técnicos y especificaciones</span>
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