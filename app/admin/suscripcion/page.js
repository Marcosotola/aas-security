// app/admin/suscripcion/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, CreditCard, ShieldCheck, ShieldAlert, Save, ExternalLink, Power } from 'lucide-react';
import { obtenerConfigSuscripcion, actualizarConfigSuscripcion } from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';

const formatMoney = (amount) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!num || isNaN(num)) return '$0,00';
  const formatted = num.toFixed(2).replace('.', ',');
  const parts = formatted.split(',');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return '$' + parts.join(',');
};

export default function Suscripcion() {
  const { usuario, loading: loadingAuth } = useStaffAuth(['Admin']);
  const [loadingData, setLoadingData] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState({ monto: '', fechaVencimiento: '' });

  const loading = loadingAuth || loadingData;
  const esSuperAdmin = usuario?.esSuperAdmin;

  useEffect(() => {
    if (!usuario) return;
    obtenerConfigSuscripcion()
      .then((data) => {
        setConfig(data);
        setForm({
          monto: data.monto || '',
          fechaVencimiento: data.fechaVencimiento || ''
        });
      })
      .catch((error) => console.error('Error al cargar la suscripción:', error))
      .finally(() => setLoadingData(false));
  }, [usuario]);

  const hoy = new Date().toISOString().split('T')[0];
  const vencida = Boolean(config?.fechaVencimiento && config.fechaVencimiento < hoy);
  const appHabilitada = config?.appHabilitada !== false;
  const bloqueada = config ? (!appHabilitada || vencida) : false;

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await actualizarConfigSuscripcion({
        monto: parseFloat(form.monto) || 0,
        fechaVencimiento: form.fechaVencimiento || null
      });
      const actualizado = await obtenerConfigSuscripcion();
      setConfig(actualizado);
      alert('Suscripción actualizada.');
    } catch (error) {
      console.error('Error al guardar la suscripción:', error);
      alert('No se pudo guardar. Inténtalo de nuevo más tarde.');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleHabilitada = async () => {
    const nuevoValor = !appHabilitada;
    const confirmacion = nuevoValor
      ? '¿Habilitar la app? El sitio público vuelve a estar disponible.'
      : '¿Deshabilitar la app? El sitio público se bloquea al instante para todos los visitantes, sin importar si la suscripción está al día.';
    if (!confirm(confirmacion)) return;

    setCambiandoEstado(true);
    try {
      await actualizarConfigSuscripcion({ appHabilitada: nuevoValor });
      const actualizado = await obtenerConfigSuscripcion();
      setConfig(actualizado);
    } catch (error) {
      console.error('Error al cambiar el estado de la app:', error);
      alert('No se pudo cambiar el estado. Inténtalo de nuevo más tarde.');
    } finally {
      setCambiandoEstado(false);
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
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
            <Home size={16} className="mr-1" /> Panel
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">Suscripción</span>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">Suscripción de la app</h2>

        <div className="max-w-lg space-y-6">
          {/* Estado actual, visible para todos */}
          <div className={`p-5 rounded-lg shadow-md flex items-start gap-3 ${bloqueada ? 'bg-red-50' : 'bg-white'}`}>
            {bloqueada ? (
              <ShieldAlert size={24} className="mt-0.5 text-danger shrink-0" />
            ) : (
              <ShieldCheck size={24} className="mt-0.5 text-success shrink-0" />
            )}
            <div>
              <p className={`font-semibold ${bloqueada ? 'text-danger' : 'text-success'}`}>
                {bloqueada ? 'Sitio bloqueado' : 'Sitio activo'}
              </p>
              <p className="text-sm text-gray-600">
                Monto: {formatMoney(config?.monto)} · Vencimiento: {config?.fechaVencimiento || 'sin definir'}
              </p>
              {vencida && !esSuperAdmin && (
                <p className="mt-2 text-sm text-danger">
                  La suscripción está vencida. Al entrar al panel te vamos a redirigir a MercadoPago para regularizar el pago.
                </p>
              )}
            </div>
          </div>

          {/* Interruptor manual: solo SuperAdmin, con efecto inmediato */}
          {esSuperAdmin && (
            <div className="p-5 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-gray-700">
                    <Power size={18} /> Estado de la app
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Interruptor manual, independiente del vencimiento. Sirve para bloquear el sitio por cualquier
                    otro motivo, aunque la suscripción esté al día.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleHabilitada}
                  disabled={cambiandoEstado}
                  role="switch"
                  aria-checked={appHabilitada}
                  className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                    appHabilitada ? 'bg-success' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                      appHabilitada ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className={`mt-3 text-sm font-medium ${appHabilitada ? 'text-success' : 'text-danger'}`}>
                {cambiandoEstado ? 'Actualizando...' : appHabilitada ? 'Habilitada' : 'Deshabilitada'}
              </p>
            </div>
          )}

          {/* Edición de monto y vencimiento: solo SuperAdmin */}
          {esSuperAdmin ? (
            <form onSubmit={handleGuardar} className="p-6 space-y-4 bg-white rounded-lg shadow-md">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                <CreditCard size={18} /> Configurar suscripción
              </h3>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Monto mensual (ARS)</label>
                <input
                  type="number"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha de vencimiento / renovación</label>
                <input
                  type="date"
                  value={form.fechaVencimiento}
                  onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-400">
                  MercadoPago la actualiza sola con cada pago aprobado. Solo deberías tocarla a mano para una
                  corrección puntual.
                </p>
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-light disabled:opacity-50"
              >
                <Save size={18} />
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>

              <div className="pt-4 space-y-2 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700">Cobro recurrente con MercadoPago</p>
                <p className="text-xs text-gray-400">
                  Totalmente automático: cuando el admin entra al panel con la suscripción vencida, el sistema
                  lo redirige directo a MercadoPago para autorizar el débito mensual. A partir de ahí,
                  MercadoPago avisa cada pago solo y esta fecha se actualiza sola. No hay nada que generar ni compartir a mano.
                </p>

                {config?.mercadoPago?.initPoint && (
                  <div className="p-3 text-sm break-all rounded-md bg-gray-50">
                    <p className="mb-1 text-xs text-gray-500">
                      Último link generado · estado: <span className="font-medium">{config.mercadoPago.estado}</span>
                    </p>
                    <a
                      href={config.mercadoPago.initPoint}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {config.mercadoPago.initPoint} <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-500">
              Solo el proveedor de la app puede modificar estos datos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
