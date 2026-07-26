// app/admin/finanzas/page.js
'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Home, PlusCircle, TrendingUp, TrendingDown, Wallet, Edit, Trash, X, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import {
  obtenerRecibos,
  obtenerMovimientos,
  crearMovimiento,
  actualizarMovimiento,
  eliminarMovimiento,
  obtenerClientes
} from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';
import ClienteSelector from '../../components/ClienteSelector';

const formatMoney = (amount) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!num || isNaN(num)) return '$0,00';
  const formatted = num.toFixed(2).replace('.', ',');
  const parts = formatted.split(',');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return '$' + parts.join(',');
};

const CATEGORIAS_GASTO = [
  'Insumos y materiales', 'Sueldos', 'Alquiler', 'Servicios (luz, agua, internet)',
  'Impuestos', 'Transporte y combustible', 'Mantenimiento de herramientas/vehículos', 'Otro'
];
const CATEGORIAS_INGRESO = ['Venta directa', 'Servicio adicional', 'Otro ingreso'];

const MOVIMIENTO_VACIO = {
  tipo: 'gasto',
  descripcion: '',
  categoria: '',
  monto: '',
  fecha: new Date().toISOString().split('T')[0],
  clienteId: null,
  clienteNombre: '',
  sedeId: null,
  sedeNombre: ''
};

// Presets de rango de fechas para no tener que tipear siempre desde/hasta
const hoy = () => new Date().toISOString().split('T')[0];
const primerDiaMes = (offsetMeses = 0) => {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMeses, 1);
  return d.toISOString().split('T')[0];
};
const ultimoDiaMes = (offsetMeses = 0) => {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMeses + 1, 0);
  return d.toISOString().split('T')[0];
};

function Finanzas() {
  const { user, loading: loadingAuth } = useStaffAuth(['Admin']);
  const searchParams = useSearchParams();
  const [loadingData, setLoadingData] = useState(true);
  const [recibos, setRecibos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

  const [desde, setDesde] = useState(primerDiaMes());
  const [hasta, setHasta] = useState(ultimoDiaMes());

  const [modal, setModal] = useState({ isOpen: false, id: null, data: MOVIMIENTO_VACIO });

  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!user) return;
    cargarTodo();
  }, [user]);

  useEffect(() => {
    if (searchParams.get('nuevo') === '1') {
      abrirModalNuevo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const cargarTodo = async () => {
    try {
      const [rec, mov, cli] = await Promise.all([
        obtenerRecibos(),
        obtenerMovimientos(),
        obtenerClientes()
      ]);
      setRecibos(rec);
      setMovimientos(mov);
      setClientes(cli);
    } catch (error) {
      console.error('Error al cargar datos de finanzas:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const abrirModalNuevo = () => {
    setModal({ isOpen: true, id: null, data: MOVIMIENTO_VACIO });
  };

  const abrirModalEditar = (item) => {
    setModal({
      isOpen: true,
      id: item.id,
      data: {
        tipo: item.tipo,
        descripcion: item.descripcion || '',
        categoria: item.categoria || '',
        monto: item.monto ?? '',
        fecha: item.fecha || hoy(),
        clienteId: item.clienteId || null,
        clienteNombre: item.clienteNombre || '',
        sedeId: item.sedeId || null,
        sedeNombre: item.sedeNombre || ''
      }
    });
  };

  const cerrarModal = () => setModal({ isOpen: false, id: null, data: MOVIMIENTO_VACIO });

  const handleGuardarMovimiento = async (e) => {
    e.preventDefault();
    if (!modal.data.descripcion.trim() || !modal.data.monto) {
      alert('Completá la descripción y el monto.');
      return;
    }

    setGuardando(true);
    try {
      const data = {
        tipo: modal.data.tipo,
        descripcion: modal.data.descripcion.trim(),
        categoria: modal.data.categoria.trim(),
        monto: parseFloat(modal.data.monto) || 0,
        fecha: modal.data.fecha,
        clienteId: modal.data.clienteId || null,
        clienteNombre: modal.data.clienteNombre || '',
        sedeId: modal.data.sedeId || null,
        sedeNombre: modal.data.sedeNombre || ''
      };

      if (modal.id) {
        await actualizarMovimiento(modal.id, data);
      } else {
        await crearMovimiento({ ...data, usuarioCreador: user.email });
      }

      await cargarTodo();
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar el movimiento:', error);
      alert('Error al guardar el movimiento. Inténtelo de nuevo más tarde.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarMovimiento = async (id) => {
    if (!confirm('¿Eliminar este movimiento? Esta acción no se puede deshacer.')) return;
    setEliminandoId(id);
    try {
      await eliminarMovimiento(id);
      setMovimientos(movimientos.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error al eliminar el movimiento:', error);
      alert('Error al eliminar el movimiento.');
    } finally {
      setEliminandoId(null);
    }
  };

  // Unifica recibos (ingresos reales ya cobrados) y movimientos manuales
  // (ingresos sueltos y gastos) en una sola lista con la misma forma.
  const itemsCombinados = useMemo(() => {
    const deRecibos = recibos.map(r => ({
      id: r.id,
      tipo: 'ingreso',
      descripcion: r.concepto || 'Recibo',
      categoria: 'Cobro (recibo)',
      monto: parseFloat(r.monto) || 0,
      fecha: r.fecha || '',
      clienteId: r.clienteId || null,
      clienteNombre: r.recibiDe || 'Sin cliente asociado',
      sedeId: r.sedeId || null,
      sedeNombre: r.sedeNombre || (r.clienteId ? 'Principal' : ''),
      origen: 'recibo'
    }));

    const deMovimientos = movimientos.map(m => ({
      id: m.id,
      tipo: m.tipo,
      descripcion: m.descripcion,
      categoria: m.categoria,
      monto: parseFloat(m.monto) || 0,
      fecha: m.fecha || '',
      clienteId: m.clienteId || null,
      clienteNombre: m.clienteNombre || 'Sin cliente asociado',
      sedeId: m.sedeId || null,
      sedeNombre: m.sedeNombre || '',
      origen: 'manual'
    }));

    return [...deRecibos, ...deMovimientos].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  }, [recibos, movimientos]);

  const itemsFiltrados = useMemo(() => {
    return itemsCombinados.filter(item => {
      if (desde && item.fecha && item.fecha < desde) return false;
      if (hasta && item.fecha && item.fecha > hasta) return false;
      return true;
    });
  }, [itemsCombinados, desde, hasta]);

  const totales = useMemo(() => {
    const ingresos = itemsFiltrados.filter(i => i.tipo === 'ingreso').reduce((s, i) => s + i.monto, 0);
    const gastos = itemsFiltrados.filter(i => i.tipo === 'gasto').reduce((s, i) => s + i.monto, 0);
    return { ingresos, gastos, ganancia: ingresos - gastos };
  }, [itemsFiltrados]);

  const agrupadoPorClienteSede = useMemo(() => {
    const grupos = new Map();
    for (const item of itemsFiltrados) {
      const key = `${item.clienteId || 'sin-cliente'}::${item.sedeId || 'sin-sede'}`;
      if (!grupos.has(key)) {
        grupos.set(key, {
          clienteNombre: item.clienteNombre || 'Sin cliente asociado',
          sedeNombre: item.sedeNombre || '—',
          ingresos: 0,
          gastos: 0
        });
      }
      const grupo = grupos.get(key);
      if (item.tipo === 'ingreso') grupo.ingresos += item.monto;
      else grupo.gastos += item.monto;
    }
    return Array.from(grupos.values())
      .map(g => ({ ...g, ganancia: g.ingresos - g.gastos }))
      .sort((a, b) => b.ganancia - a.ganancia);
  }, [itemsFiltrados]);

  const aplicarPreset = (preset) => {
    if (preset === 'mes-actual') { setDesde(primerDiaMes()); setHasta(ultimoDiaMes()); }
    else if (preset === 'mes-pasado') { setDesde(primerDiaMes(-1)); setHasta(ultimoDiaMes(-1)); }
    else if (preset === 'ano-actual') { setDesde(`${new Date().getFullYear()}-01-01`); setHasta(`${new Date().getFullYear()}-12-31`); }
    else if (preset === 'todo') { setDesde(''); setHasta(''); }
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
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
              <Home size={16} className="mr-1" /> Panel
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Finanzas</span>
          </div>
          <button
            onClick={abrirModalNuevo}
            className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
          >
            <PlusCircle size={18} className="mr-2" /> Nuevo movimiento
          </button>
        </div>

        <h2 className="mb-2 text-2xl font-bold font-montserrat text-primary">Finanzas</h2>
        <p className="mb-6 text-sm text-gray-500">
          Los ingresos incluyen los recibos ya emitidos más los movimientos manuales que cargues acá. Los gastos son siempre manuales.
        </p>

        {/* Filtros de fecha */}
        <div className="flex flex-wrap items-end gap-3 p-4 mb-6 bg-white rounded-lg shadow-md">
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-500">Desde</label>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-500">Hasta</label>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'mes-actual', label: 'Este mes' },
              { id: 'mes-pasado', label: 'Mes pasado' },
              { id: 'ano-actual', label: 'Este año' },
              { id: 'todo', label: 'Todo' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => aplicarPreset(p.id)}
                className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-3">
          <div className="p-5 bg-white rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-1 text-gray-500">
              <TrendingUp size={16} className="text-success" /> Ingresos
            </div>
            <p className="text-2xl font-bold text-success">{formatMoney(totales.ingresos)}</p>
          </div>
          <div className="p-5 bg-white rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-1 text-gray-500">
              <TrendingDown size={16} className="text-danger" /> Gastos
            </div>
            <p className="text-2xl font-bold text-danger">{formatMoney(totales.gastos)}</p>
          </div>
          <div className="p-5 bg-white rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-1 text-gray-500">
              <Wallet size={16} className="text-primary" /> Ganancia neta
            </div>
            <p className={`text-2xl font-bold ${totales.ganancia >= 0 ? 'text-primary' : 'text-danger'}`}>
              {formatMoney(totales.ganancia)}
            </p>
          </div>
        </div>

        {/* Por cliente / sede */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Ganancia por cliente y sede</h3>
          {agrupadoPorClienteSede.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Sede</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Ingresos</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Gastos</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Ganancia</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agrupadoPorClienteSede.map((g, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">{g.clienteNombre}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">{g.sedeNombre}</td>
                      <td className="px-4 py-2 text-sm text-right text-success whitespace-nowrap">{formatMoney(g.ingresos)}</td>
                      <td className="px-4 py-2 text-sm text-right text-danger whitespace-nowrap">{formatMoney(g.gastos)}</td>
                      <td className={`px-4 py-2 text-sm text-right font-semibold whitespace-nowrap ${g.ganancia >= 0 ? 'text-primary' : 'text-danger'}`}>
                        {formatMoney(g.ganancia)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No hay movimientos en el rango seleccionado.</p>
          )}
        </div>

        {/* Listado de movimientos */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Movimientos</h3>
          {itemsFiltrados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Descripción</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Cliente / Sede</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Monto</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {itemsFiltrados.map((item) => (
                    <tr key={`${item.origen}-${item.id}`}>
                      <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">{item.fecha}</td>
                      <td className="px-4 py-2 text-sm whitespace-nowrap">
                        {item.tipo === 'ingreso' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                            <ArrowUpCircle size={12} /> Ingreso
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                            <ArrowDownCircle size={12} /> Gasto
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.origen === 'recibo' ? (
                          <Link href={`/admin/recibos/${item.id}`} className="hover:underline text-primary">
                            {item.descripcion}
                          </Link>
                        ) : (
                          item.descripcion
                        )}
                        {item.categoria && <div className="text-xs text-gray-400">{item.categoria}</div>}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                        {item.clienteNombre}{item.sedeNombre ? ` · ${item.sedeNombre}` : ''}
                      </td>
                      <td className={`px-4 py-2 text-sm text-right font-medium whitespace-nowrap ${item.tipo === 'ingreso' ? 'text-success' : 'text-danger'}`}>
                        {item.tipo === 'ingreso' ? '+' : '-'}{formatMoney(item.monto)}
                      </td>
                      <td className="px-4 py-2 text-sm text-right whitespace-nowrap">
                        {item.origen === 'manual' ? (
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => abrirModalEditar(item)} title="Editar" className="text-secondary hover:text-secondary-light">
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleEliminarMovimiento(item.id)}
                              disabled={eliminandoId === item.id}
                              title="Eliminar"
                              className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Recibo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No hay movimientos en el rango seleccionado.</p>
          )}
        </div>
      </div>

      {/* Modal nuevo/editar movimiento manual */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-6 overflow-y-auto bg-white rounded-lg max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {modal.id ? 'Editar movimiento' : 'Nuevo movimiento'}
              </h3>
              <button onClick={cerrarModal} className="text-gray-500 hover:text-gray-700">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleGuardarMovimiento} className="space-y-4">
              <div className="inline-flex p-1 bg-gray-100 rounded-md">
                <button
                  type="button"
                  onClick={() => setModal({ ...modal, data: { ...modal.data, tipo: 'gasto', categoria: '' } })}
                  className={`px-4 py-1.5 text-sm rounded-md transition-colors ${modal.data.tipo === 'gasto' ? 'bg-white shadow-sm text-danger font-semibold' : 'text-gray-600'}`}
                >
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setModal({ ...modal, data: { ...modal.data, tipo: 'ingreso', categoria: '' } })}
                  className={`px-4 py-1.5 text-sm rounded-md transition-colors ${modal.data.tipo === 'ingreso' ? 'bg-white shadow-sm text-success font-semibold' : 'text-gray-600'}`}
                >
                  Ingreso
                </button>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Descripción</label>
                <input
                  type="text"
                  value={modal.data.descripcion}
                  onChange={(e) => setModal({ ...modal, data: { ...modal.data, descripcion: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder={modal.data.tipo === 'gasto' ? 'Ej: Compra de matafuegos para stock' : 'Ej: Venta suelta de matafuego'}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Categoría</label>
                  <input
                    type="text"
                    list="categorias-movimiento"
                    value={modal.data.categoria}
                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, categoria: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Opcional"
                  />
                  <datalist id="categorias-movimiento">
                    {(modal.data.tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO).map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Monto</label>
                  <input
                    type="number"
                    value={modal.data.monto}
                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, monto: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={modal.data.fecha}
                  onChange={(e) => setModal({ ...modal, data: { ...modal.data, fecha: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Cliente / sede (opcional)</label>
                <ClienteSelector
                  clientes={clientes}
                  onSelect={({ clienteId, nombre, empresa, sedeId, sedeNombre }) => {
                    setModal({
                      ...modal,
                      data: {
                        ...modal.data,
                        clienteId,
                        clienteNombre: empresa ? `${nombre} - ${empresa}` : nombre,
                        sedeId,
                        sedeNombre
                      }
                    });
                  }}
                  placeholder="Buscar cliente registrado..."
                />
                {modal.data.clienteId ? (
                  <div className="flex items-center justify-between px-3 py-2 mt-1 text-sm border border-gray-200 rounded-md bg-gray-50">
                    <span>{modal.data.clienteNombre} · {modal.data.sedeNombre}</span>
                    <button
                      type="button"
                      onClick={() => setModal({ ...modal, data: { ...modal.data, clienteId: null, clienteNombre: '', sedeId: null, sedeNombre: '' } })}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">Sin asociar a ningún cliente ni sede.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={cerrarModal} className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100">
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

export default function FinanzasPage() {
  return (
    <Suspense fallback={null}>
      <Finanzas />
    </Suspense>
  );
}
