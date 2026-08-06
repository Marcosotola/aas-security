// app/cuenta/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Home, Edit, PlusCircle, Trash2, Eye, Download, MapPin } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  obtenerUsuarioPorId,
  actualizarUsuario,
  obtenerPresupuestosPorCliente,
  obtenerRemitosPorCliente,
  obtenerRecibosPorCliente,
  obtenerOrdenesTrabajoPorCliente
} from '../lib/firestore';
import PresupuestoPDF from '../components/pdf/PresupuestoPDF';
import RemitoPDF from '../components/pdf/RemitoPDF';
import ReciboPDF from '../components/pdf/ReciboPDF';
import VerDescargarPDF from '../components/pdf/VerDescargarPDF';
import DescargarOrdenTrabajoPDF from '../components/pdf/DescargarOrdenTrabajoPDF';
import { formatearFecha } from '../lib/fecha';

const formatMoney = (amount) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (amount === undefined || amount === null || isNaN(num)) return '$0,00';
  const formatted = num.toFixed(2).replace('.', ',');
  const parts = formatted.split(',');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return '$' + parts.join(',');
};

const formatFecha = (doc) => {
  if (doc.fechaCreacion?.toDate) return doc.fechaCreacion.toDate().toLocaleDateString('es-AR');
  if (doc.fecha) return formatearFecha(doc.fecha);
  return '-';
};

const SEDE_VACIA = { nombre: '', direccion: '' };

export default function Cuenta() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [datosPerfil, setDatosPerfil] = useState(null);

  const [nuevaSede, setNuevaSede] = useState(SEDE_VACIA);
  const [guardandoSede, setGuardandoSede] = useState(false);

  const [presupuestos, setPresupuestos] = useState([]);
  const [remitos, setRemitos] = useState([]);
  const [recibos, setRecibos] = useState([]);
  const [ordenesTrabajo, setOrdenesTrabajo] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      try {
        const perfilData = await obtenerUsuarioPorId(currentUser.uid);

        if (!perfilData) {
          router.push('/registro/datos');
          return;
        }
        if (perfilData.role !== 'Cliente') {
          router.push('/admin/dashboard');
          return;
        }
        if (!perfilData.perfilCompleto) {
          router.push('/registro/datos');
          return;
        }

        setUser(currentUser);
        setPerfil(perfilData);
        setDatosPerfil(perfilData);

        const [mispresupuestos, misremitos, misrecibos, misordenesTrabajo] = await Promise.all([
          obtenerPresupuestosPorCliente(currentUser.uid),
          obtenerRemitosPorCliente(currentUser.uid),
          obtenerRecibosPorCliente(currentUser.uid),
          obtenerOrdenesTrabajoPorCliente(currentUser.uid)
        ]);
        setPresupuestos(mispresupuestos);
        setRemitos(misremitos);
        setRecibos(misrecibos);
        setOrdenesTrabajo(misordenesTrabajo);

        setLoading(false);
      } catch (error) {
        console.error('Error al cargar la cuenta:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    setGuardandoPerfil(true);
    try {
      await actualizarUsuario(user.uid, {
        nombre: datosPerfil.nombre,
        apellido: datosPerfil.apellido,
        empresa: datosPerfil.empresa,
        dniCuit: datosPerfil.dniCuit,
        direccion: datosPerfil.direccion,
        telefono: datosPerfil.telefono
      });
      setPerfil({ ...perfil, ...datosPerfil });
      setEditandoPerfil(false);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('No se pudieron guardar los cambios. Inténtalo de nuevo más tarde.');
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const handleAgregarSede = async (e) => {
    e.preventDefault();
    if (!nuevaSede.nombre.trim() || !nuevaSede.direccion.trim()) return;

    setGuardandoSede(true);
    try {
      const sedes = [...(perfil.sedes || []), { id: Date.now().toString(), ...nuevaSede }];
      await actualizarUsuario(user.uid, { sedes });
      setPerfil({ ...perfil, sedes });
      setNuevaSede(SEDE_VACIA);
    } catch (error) {
      console.error('Error al agregar la sede:', error);
      alert('No se pudo agregar la sede. Inténtalo de nuevo más tarde.');
    } finally {
      setGuardandoSede(false);
    }
  };

  const handleEliminarSede = async (id) => {
    if (!confirm('¿Eliminar esta sede?')) return;
    try {
      const sedes = (perfil.sedes || []).filter(s => s.id !== id);
      await actualizarUsuario(user.uid, { sedes });
      setPerfil({ ...perfil, sedes });
    } catch (error) {
      console.error('Error al eliminar la sede:', error);
      alert('No se pudo eliminar la sede. Inténtalo de nuevo más tarde.');
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
    <div className="min-h-screen pt-16 bg-gray-50">
      <header className="text-white shadow bg-primary">
        <div className="container flex items-center justify-between px-4 py-6 mx-auto">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold font-montserrat">
              AAS Security
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user?.email}</span>
            <Link href="/" className="flex items-center p-2 text-white rounded-md hover:bg-primary-light">
              <Home size={18} className="mr-2" /> Sitio
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center p-2 text-white rounded-md hover:bg-primary-light"
            >
              <LogOut size={18} className="mr-2" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8 mx-auto space-y-6">
        <h2 className="text-2xl font-bold font-montserrat text-primary">
          Hola, {perfil.nombre}
        </h2>

        {/* Mis datos */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Mis Datos</h3>
            {!editandoPerfil && (
              <button
                onClick={() => { setDatosPerfil(perfil); setEditandoPerfil(true); }}
                className="flex items-center text-sm text-primary hover:underline"
              >
                <Edit size={14} className="mr-1" /> Editar
              </button>
            )}
          </div>

          {editandoPerfil ? (
            <form onSubmit={handleGuardarPerfil} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Nombre</label>
                  <input type="text" value={datosPerfil.nombre || ''} onChange={(e) => setDatosPerfil({ ...datosPerfil, nombre: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Apellido</label>
                  <input type="text" value={datosPerfil.apellido || ''} onChange={(e) => setDatosPerfil({ ...datosPerfil, apellido: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Razón Social / Empresa</label>
                <input type="text" value={datosPerfil.empresa || ''} onChange={(e) => setDatosPerfil({ ...datosPerfil, empresa: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">DNI / CUIT</label>
                  <input type="text" value={datosPerfil.dniCuit || ''} onChange={(e) => setDatosPerfil({ ...datosPerfil, dniCuit: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Teléfono</label>
                  <input type="text" value={datosPerfil.telefono || ''} onChange={(e) => setDatosPerfil({ ...datosPerfil, telefono: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Dirección principal</label>
                <input type="text" value={datosPerfil.direccion || ''} onChange={(e) => setDatosPerfil({ ...datosPerfil, direccion: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setEditandoPerfil(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100">Cancelar</button>
                <button type="submit" disabled={guardandoPerfil} className="px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-light disabled:opacity-50">
                  {guardandoPerfil ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div><span className="font-medium text-gray-700">Nombre: </span>{perfil.nombre} {perfil.apellido}</div>
              <div><span className="font-medium text-gray-700">Empresa: </span>{perfil.empresa || '-'}</div>
              <div><span className="font-medium text-gray-700">DNI/CUIT: </span>{perfil.dniCuit}</div>
              <div><span className="font-medium text-gray-700">Teléfono: </span>{perfil.telefono}</div>
              <div className="sm:col-span-2"><span className="font-medium text-gray-700">Dirección: </span>{perfil.direccion}</div>
            </div>
          )}
        </div>

        {/* Mis sedes */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Mis Sedes</h3>
          <p className="mb-4 text-sm text-gray-500">
            Si tenés más de una ubicación (por ejemplo varios edificios de un consorcio), agregalas acá. Vamos a poder seleccionarlas al hacerte un presupuesto, remito o recibo.
          </p>

          <div className="mb-4 space-y-2">
            {(perfil.sedes || []).length === 0 && (
              <p className="text-sm text-gray-400">Todavía no cargaste ninguna sede.</p>
            )}
            {(perfil.sedes || []).map((sede) => (
              <div key={sede.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex items-start">
                  <MapPin size={16} className="mt-0.5 mr-2 text-primary shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{sede.nombre}</div>
                    <div className="text-xs text-gray-500">{sede.direccion}</div>
                  </div>
                </div>
                <button onClick={() => handleEliminarSede(sede.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAgregarSede} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr_auto]">
            <input
              type="text"
              value={nuevaSede.nombre}
              onChange={(e) => setNuevaSede({ ...nuevaSede, nombre: e.target.value })}
              placeholder="Nombre de la sede (ej: Edificio Torre Norte)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={nuevaSede.direccion}
              onChange={(e) => setNuevaSede({ ...nuevaSede, direccion: e.target.value })}
              placeholder="Dirección de la sede"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="submit"
              disabled={guardandoSede}
              className="flex items-center justify-center px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-light disabled:opacity-50"
            >
              <PlusCircle size={16} className="mr-1" /> Agregar
            </button>
          </form>
        </div>

        {/* Mis documentos */}
        <ListaDocumentos titulo="Mis Presupuestos" documentos={presupuestos} Documento={PresupuestoPDF} propName="presupuesto" />
        <ListaDocumentos titulo="Mis Remitos" documentos={remitos} Documento={RemitoPDF} propName="remito" />
        <ListaDocumentos titulo="Mis Recibos" documentos={recibos} Documento={ReciboPDF} propName="recibo" />
        <ListaOrdenesTrabajo ordenes={ordenesTrabajo} />
      </div>
    </div>
  );
}

function ListaDocumentos({ titulo, documentos, Documento, propName }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-700">{titulo}</h3>
      {documentos.length === 0 ? (
        <p className="text-sm text-gray-400">No hay documentos todavía.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Número</th>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Total</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documentos.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{d.numero}</td>
                  <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">{formatFecha(d)}</td>
                  <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">{d.estado || '-'}</td>
                  <td className="px-4 py-2 text-sm font-medium text-right text-gray-900 whitespace-nowrap">{formatMoney(d.total)}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <VerDescargarPDF documento={<Documento {...{ [propName]: d }} />} fileName={`${d.numero}.pdf`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ListaOrdenesTrabajo({ ordenes }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-700">Mis Órdenes de Trabajo</h3>
      {ordenes.length === 0 ? (
        <p className="text-sm text-gray-400">No hay documentos todavía.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Número</th>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Sede</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordenes.map((orden) => (
                <tr key={orden.id}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{orden.numero}</td>
                  <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">{formatFecha(orden)}</td>
                  <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">{orden.cliente?.sedeNombre || '-'}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <span className="inline-flex items-center space-x-3">
                      <DescargarOrdenTrabajoPDF orden={orden} modo="ver" className="text-gray-600 hover:text-primary" >
                        <Eye size={16} />
                      </DescargarOrdenTrabajoPDF>
                      <DescargarOrdenTrabajoPDF orden={orden} modo="descargar" className="text-primary hover:text-primary-light">
                        <Download size={16} />
                      </DescargarOrdenTrabajoPDF>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
