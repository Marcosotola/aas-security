// app/components/cliente/AvisoFacturasVencidas.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Download } from 'lucide-react';
import { facturaVencida, ordenarFacturas } from '../ui/EstadoFactura';
import { etiquetaSedeEmpresa, formatMoney } from '../../lib/documentosCliente';
import { formatearFecha } from '../../lib/fecha';
import { accionIconoClase, ACCION_ICONO_TAMANO } from '../admin/accionIcono';

const CLAVE_VISTO = 'avisoFacturasVencidas';

// Aviso al entrar al portal si alguna factura que puede ver (por sus accesos
// empresa → sede → tipo, ya resueltos en useClienteAuth) está vencida sin
// pagar. Se muestra una vez por sesión del navegador; si en la misma sesión
// se suma otra vencida, vuelve a aparecer. Solo para clientes: el personal
// de AAS ve las vencidas marcadas en el listado de /admin/facturas.
export default function AvisoFacturasVencidas({ facturas }) {
  const vencidas = useMemo(() => facturas.filter(facturaVencida).sort(ordenarFacturas), [facturas]);
  const firma = vencidas.map((f) => f.id).sort().join(',');
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (!firma) return;
    let visto = null;
    try { visto = sessionStorage.getItem(CLAVE_VISTO); } catch {}
    if (visto !== firma) setAbierto(true);
  }, [firma]);

  const cerrar = () => {
    try { sessionStorage.setItem(CLAVE_VISTO, firma); } catch {}
    setAbierto(false);
  };

  if (!abierto || vencidas.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/50 sm:items-center sm:p-4">
      <div className="flex flex-col w-full max-w-lg max-h-[90vh] p-6 bg-white shadow-xl rounded-t-2xl sm:rounded-2xl">
        <div className="flex flex-col items-center mb-4 text-center">
          <div className="flex items-center justify-center mb-3 bg-red-100 rounded-full w-14 h-14">
            <AlertTriangle size={28} className="text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">
            {vencidas.length === 1 ? 'Tenés una factura vencida' : `Tenés ${vencidas.length} facturas vencidas`}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Llegó la fecha de vencimiento y todavía figura{vencidas.length === 1 ? '' : 'n'} pendiente{vencidas.length === 1 ? '' : 's'} de pago.
          </p>
        </div>

        <ul className="mb-5 overflow-y-auto border border-gray-200 divide-y divide-gray-200 rounded-lg">
          {vencidas.map((f) => {
            const sede = f.sedeActual || f.sedeNombre;
            return (
              <li key={f.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{f.numero}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {f.empresaNombre ? etiquetaSedeEmpresa(f.empresaNombre, sede) : sede}
                  </div>
                  <div className="text-xs font-medium text-red-600">Venció el {formatearFecha(f.vencimiento)}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-medium text-gray-900">{formatMoney(f.monto)}</span>
                  {(f.archivos || []).slice(0, 1).map((archivo) => (
                    <a
                      key={archivo.path || archivo.url}
                      href={archivo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Descargar factura"
                      className={accionIconoClase('primary')}
                    >
                      <Download size={ACCION_ICONO_TAMANO} />
                    </a>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Link
            href="/cuenta/documentos?tipo=factura"
            onClick={cerrar}
            className="flex-1 px-4 py-2 text-center text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
          >
            Ver facturas
          </Link>
          <button
            type="button"
            onClick={cerrar}
            className="flex-1 px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
