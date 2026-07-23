// app/admin/lista-precios/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Search, PlusCircle, Edit, Trash, Tag, X } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import {
    obtenerListaPrecios,
    crearItemPrecio,
    actualizarItemPrecio,
    eliminarItemPrecio
} from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';

// Función para formatear montos con separador de miles (punto) y decimal (coma)
const formatMoney = (amount) => {
    if (amount === undefined || amount === null || amount === '') return '$0,00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '$0,00';
    const formatted = num.toFixed(2).replace('.', ',');
    const parts = formatted.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return '$' + parts.join(',');
};

const ITEM_VACIO = { descripcion: '', precioUnitario: '', unidad: '' };

export default function ListaPrecios() {
    const router = useRouter();
    const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
    const [loadingData, setLoadingData] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [items, setItems] = useState([]);
    const [filtro, setFiltro] = useState('');
    const loading = loadingAuth || loadingData;

    const [modal, setModal] = useState({ isOpen: false, id: null, data: ITEM_VACIO });

    useEffect(() => {
        if (!user) return;
        cargarItems().then(() => setLoadingData(false));
    }, [user]);

    const cargarItems = async () => {
        try {
            const data = await obtenerListaPrecios();
            setItems(data);
        } catch (error) {
            console.error('Error al cargar la lista de precios:', error);
            setItems([]);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/admin');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const abrirModalNuevo = () => {
        setModal({ isOpen: true, id: null, data: ITEM_VACIO });
    };

    const abrirModalEditar = (item) => {
        setModal({
            isOpen: true,
            id: item.id,
            data: {
                descripcion: item.descripcion || '',
                precioUnitario: item.precioUnitario ?? '',
                unidad: item.unidad || ''
            }
        });
    };

    const cerrarModal = () => {
        setModal({ isOpen: false, id: null, data: ITEM_VACIO });
    };

    const handleGuardarItem = async (e) => {
        e.preventDefault();
        if (!modal.data.descripcion.trim()) {
            alert('La descripción es obligatoria');
            return;
        }

        setGuardando(true);
        try {
            const itemData = {
                descripcion: modal.data.descripcion.trim(),
                precioUnitario: parseFloat(modal.data.precioUnitario) || 0,
                unidad: modal.data.unidad.trim()
            };

            if (modal.id) {
                await actualizarItemPrecio(modal.id, itemData);
            } else {
                await crearItemPrecio(itemData);
            }

            await cargarItems();
            cerrarModal();
        } catch (error) {
            console.error('Error al guardar item:', error);
            alert('Error al guardar el item. Inténtelo de nuevo más tarde.');
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminarItem = async (id) => {
        if (!confirm('¿Está seguro de que desea eliminar este item de la lista de precios?')) return;

        try {
            await eliminarItemPrecio(id);
            setItems(items.filter(i => i.id !== id));
        } catch (error) {
            console.error('Error al eliminar item:', error);
            alert('Error al eliminar el item. Inténtelo de nuevo más tarde.');
        }
    };

    const itemsFiltrados = items.filter((item) => {
        if (!filtro) return true;
        const termino = filtro.toLowerCase();
        return item.descripcion?.toLowerCase().includes(termino);
    });

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
                            <Home size={16} className="mr-1" /> Panel
                        </Link>
                        <span className="mx-2 text-gray-500">/</span>
                        <span className="text-gray-700">Lista de Precios</span>
                    </div>

                    <button
                        onClick={abrirModalNuevo}
                        className="flex items-center px-4 py-2 mb-4 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
                    >
                        <PlusCircle size={18} className="mr-2" /> Nuevo Item
                    </button>
                </div>

                <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
                    Lista de Precios
                </h2>
                <p className="mb-6 -mt-4 text-sm text-gray-500">
                    Este catálogo se usa como buscador rápido al cargar items en un presupuesto. También podés seguir cargando items manualmente sin usar el catálogo.
                </p>

                <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
                    <div className="relative flex items-center mb-6">
                        <Search size={18} className="absolute text-gray-400 left-3" />
                        <input
                            type="text"
                            placeholder="Buscar por descripción..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Descripción
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Unidad
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                                        Precio Unit.
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {itemsFiltrados.length > 0 ? (
                                    itemsFiltrados.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{item.descripcion}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{item.unidad || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-right text-gray-900 whitespace-nowrap">
                                                {formatMoney(item.precioUnitario)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                <div className="flex justify-end space-x-4">
                                                    <button
                                                        onClick={() => abrirModalEditar(item)}
                                                        title="Editar"
                                                        className="text-secondary hover:text-secondary-light"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEliminarItem(item.id)}
                                                        title="Eliminar"
                                                        className="text-red-500 cursor-pointer hover:text-red-700"
                                                    >
                                                        <Trash size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                            {items.length === 0
                                                ? 'Todavía no cargaste ningún item en la lista de precios'
                                                : 'No hay items que coincidan con su búsqueda'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal para crear/editar item */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="w-full max-w-md bg-white rounded-lg">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="flex items-center text-lg font-semibold text-gray-800">
                                <Tag size={18} className="mr-2 text-primary" />
                                {modal.id ? 'Editar Item' : 'Nuevo Item'}
                            </h3>
                            <button
                                onClick={cerrarModal}
                                className="p-1 text-gray-500 transition-colors hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleGuardarItem} className="p-4">
                            <div className="mb-4">
                                <label className="block mb-1 text-sm font-medium text-gray-700">Descripción</label>
                                <textarea
                                    value={modal.data.descripcion}
                                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, descripcion: e.target.value } })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md resize-y"
                                    placeholder="Ej: Mantenimiento de matafuego ABC 5kg"
                                    rows={3}
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Precio Unitario</label>
                                    <input
                                        type="number"
                                        value={modal.data.precioUnitario}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, precioUnitario: e.target.value } })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Unidad (opcional)</label>
                                    <input
                                        type="text"
                                        value={modal.data.unidad}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, unidad: e.target.value } })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Ej: unidad, mes, hora"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end mt-6 space-x-3">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardando}
                                    className="px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-light disabled:opacity-50"
                                >
                                    {guardando ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
