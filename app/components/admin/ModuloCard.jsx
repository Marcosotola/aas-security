'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { FilePlus, MessageCircle, ChevronDown } from 'lucide-react';
import PortalDropdown from '../PortalDropdown';

// Tarjeta de módulo reutilizada tanto en el panel principal (/admin/dashboard)
// como en el hub de Documentos (/admin/documentos), para que ambos luzcan
// exactamente igual. Soporta tres variantes de acción rápida:
// - "Nuevo" simple (rutas.nuevo): navega directo a crear uno nuevo.
// - "nuevoDropdown" + "nuevoAccesos": el botón "Nuevo" despliega una lista de
//   accesos directos a crear cada tipo (usado por la tarjeta "Documentos" del
//   panel principal, que agrupa Presupuestos/Remitos/Recibos/Estados/Informes).
// - "sinNuevo": solo un botón de acceso (Consultas, Suscripción, Planillas).
export default function ModuloCard({ modulo }) {
  const [nuevoMenuAbierto, setNuevoMenuAbierto] = useState(false);
  const nuevoBtnRef = useRef(null);
  const Icono = modulo.icono;
  const activo = modulo.activo && !modulo.proximamente;

  return (
    <div className="relative h-full">
      <Link
        href={activo ? modulo.rutas.historial : '#'}
        className={`relative block h-full ${activo ? 'cursor-pointer' : 'opacity-75 cursor-default'}`}
      >
        {modulo.proximamente && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/50">
            <span className="px-3 py-1 text-xs font-semibold text-white bg-yellow-500 rounded-full">
              Próximamente
            </span>
          </div>
        )}

        {/* Tarjeta de módulo: mismo diseño en mobile y escritorio */}
        <div
          className={`flex flex-col overflow-hidden rounded-xl shadow-sm transition-all h-full ${activo ? 'hover:shadow-md hover:-translate-y-0.5' : ''}`}
          style={{ transition: 'box-shadow 0.2s, transform 0.2s' }}
        >
          <div className={`p-4 md:p-6 ${modulo.activo ? modulo.color : 'bg-gray-300'} text-white h-full flex flex-col`}>
            <div className="flex items-start justify-between mb-2 md:mb-4">
              <div className="relative p-2.5 rounded-xl bg-white/20 shadow-inner">
                <Icono size={26} className="md:w-10 md:h-10" />
                {modulo.badge > 0 && (
                  <span className="absolute flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -right-2">
                    {modulo.badge}
                  </span>
                )}
              </div>
              {modulo.total !== undefined && modulo.total !== null && (
                <div className="text-right">
                  <p className="text-xl font-bold leading-none md:text-2xl">{modulo.total}</p>
                  <p className="text-[10px] opacity-80 uppercase font-semibold mt-1">Total</p>
                </div>
              )}
            </div>

            <h4 className="text-base font-bold leading-tight md:text-lg">{modulo.titulo}</h4>
            <p className="mt-1 text-sm opacity-90 line-clamp-2">{modulo.descripcion}</p>

            {modulo.activo && modulo.nuevoDropdown && (
              <div className="flex items-center justify-center mt-auto pt-3 md:pt-4 border-t border-white/10">
                <span
                  ref={nuevoBtnRef}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setNuevoMenuAbierto((o) => !o); }}
                  className="flex items-center text-sm md:text-lg font-bold hover:underline bg-white/20 px-4 py-2 rounded-xl transition-all hover:bg-white/30 hover:scale-105 active:scale-95"
                >
                  <FilePlus size={24} className="mr-2 md:w-7 md:h-7" />
                  <span>Nuevo</span>
                  <ChevronDown size={16} className="ml-1" />
                </span>
              </div>
            )}
            {modulo.activo && !modulo.nuevoDropdown && !modulo.sinNuevo && (
              <div className="flex items-center justify-center mt-auto pt-3 md:pt-4 border-t border-white/10">
                <span
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = modulo.rutas.nuevo; }}
                  className="flex items-center text-sm md:text-lg font-bold hover:underline bg-white/20 px-4 py-2 rounded-xl transition-all hover:bg-white/30 hover:scale-105 active:scale-95"
                >
                  <FilePlus size={24} className="mr-2 md:w-7 md:h-7" />
                  <span>Nuevo</span>
                </span>
              </div>
            )}
            {modulo.activo && modulo.sinNuevo && (
              <div className="flex items-center justify-center mt-auto pt-3 md:pt-4 border-t border-white/10">
                <span className="flex items-center text-sm md:text-lg font-bold bg-white/20 px-4 py-2 rounded-xl">
                  {(() => {
                    const IconoAcceso = modulo.iconoAcceso || MessageCircle;
                    return <IconoAcceso size={24} className="mr-2 md:w-7 md:h-7" />;
                  })()}
                  <span>{modulo.textoAcceso || 'Ver consultas'}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {modulo.nuevoDropdown && (
        <PortalDropdown
          open={nuevoMenuAbierto}
          anchorRef={nuevoBtnRef}
          onClose={() => setNuevoMenuAbierto(false)}
          width={220}
          align="right"
        >
          {modulo.nuevoAccesos.map((acceso) => {
            const IconoAcceso = acceso.icono;
            return (
              <Link
                key={acceso.href}
                href={acceso.href}
                onClick={() => setNuevoMenuAbierto(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <IconoAcceso size={15} />
                {acceso.label}
              </Link>
            );
          })}
        </PortalDropdown>
      )}
    </div>
  );
}
