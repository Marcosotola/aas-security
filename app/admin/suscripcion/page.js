// app/admin/suscripcion/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, CreditCard, ShieldCheck, ShieldAlert, Save, ExternalLink, Link2 } from 'lucide-react';
import { obtenerConfigSuscripcion, actualizarConfigSuscripcion } from '../../lib/firestore';
import { useStaffAuth } from '../../lib/useStaffAuth';
import { auth } from '../../lib/firebase';

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
  const [generandoLink, setGenerandoLink] = useState(false);
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState({ monto: '', fechaVencimiento: '', appHabilitada: true });

  const loading = loadingAuth || loadingData;
  const esSuperAdmin = usuario?.esSuperAdmin;

  useEffect(() => {
    if (!usuario) return;
    obtenerConfigSuscripcion()
      .then((data) => {
        setConfig(data);
        setForm({
          monto: data.monto || '',
          fechaVencimiento: data.fechaVencimiento || '',
          appHabilitada: data.appHabilitada !== false
        });
      })
      .catch((error) => console.error('Error al cargar la suscripción:', error))
      .finally(() => setLoadingData(false));
  }, [usuario]);

  const hoy = new Date().toISOString().split('T')[0];
  const vencida = Boolean(config?.fechaVencimiento && config.fechaVencimiento < hoy);
  const bloqueada = config ? (config.appHabilitada === false || vencida) : false;

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await actualizarConfigSuscripcion({
        monto: parseFloat(form.monto) || 0,
        fechaVencimiento: form.fechaVencimiento || null,
        appHabilitada: form.appHabilitada
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

  const handleGenerarLink = async () => {
    setGenerandoLink(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/mercadopago/crear-suscripcion', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error desconocido');

      const actualizado = await obtenerConfigSuscripcion();
      setConfig(actualizado);
    } catch (error) {
      console.error('Error al generar el link de MercadoPago:', error);
      alert(error.message || 'No se pudo generar el link de pago.');
    } finally {
      setGenerandoLink(false);
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
                  La suscripción está vencida. Regularizá el pago para reactivar el sitio.
                  {config?.mercadoPago?.initPoint && (
                    <a
                      href={config.mercadoPago.initPoint}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 ml-2 font-medium underline"
                    >
                      Pagar ahora <ExternalLink size={14} />
                    </a>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Edición: solo SuperAdmin */}
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
                  Cuando esta fecha ya pasó, el sitio público se bloquea automáticamente.
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.appHabilitada}
                  onChange={(e) => setForm({ ...form, appHabilitada: e.target.checked })}
                  className="w-4 h-4"
                />
                App habilitada (interruptor manual, independiente del vencimiento)
              </label>

              <button
                type="submit"
                disabled={guardando}
                className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-light disabled:opacity-50"
              >
                <Save size={18} />
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>

              <div className="pt-4 space-y-3 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700">Cobro recurrente con MercadoPago</p>
                <button
                  type="button"
                  onClick={handleGenerarLink}
                  disabled={generandoLink}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-md text-primary border-primary hover:bg-primary/5 disabled:opacity-50"
                >
                  <Link2 size={16} />
                  {generandoLink ? 'Generando...' : config?.mercadoPago?.initPoint ? 'Regenerar link de pago' : 'Generar link de pago'}
                </button>

                {config?.mercadoPago?.initPoint && (
                  <div className="p-3 text-sm break-all rounded-md bg-gray-50">
                    <p className="mb-1 text-xs text-gray-500">
                      Estado: <span className="font-medium">{config.mercadoPago.estado}</span>
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

                <p className="text-xs text-gray-400">
                  Compartí este link con el admin para que autorice el débito mensual. Una vez autorizado,
                  MercadoPago va a avisar automáticamente cada pago y la fecha de vencimiento se va a actualizar sola.
                </p>
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
