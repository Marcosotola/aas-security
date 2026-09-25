// app/cuenta/sedes/page.js
'use client';

import Link from 'next/link';
import { MapPin, Building2 } from 'lucide-react';
import { useCliente } from '../../lib/useClienteAuth';
import { TIPOS_DOC, etiquetaSedeEmpresa } from '../../lib/documentosCliente';

// Sedes que el cliente puede ver, agrupadas por empresa, con los tipos de
// documento habilitados en cada una. Son de solo lectura: las empresas, sus
// sedes y los accesos los gestiona AAS desde el panel.
export default function SedesPage() {
  const { empresas } = useCliente();
  const variasEmpresas = empresas.length > 1;

  return (
    <div className="container px-4 py-8 mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-montserrat text-primary">Mis Sedes</h2>
        <p className="text-sm text-gray-500">
          Las sedes a las que tenés acceso y qué documentos podés ver en cada una. Tocá una sede para ver sus documentos.
        </p>
      </div>

      {empresas.length === 0 && (
        <div className="p-6 text-sm text-gray-500 bg-white rounded-lg shadow-md">
          Tu cuenta todavía no tiene empresas habilitadas. AAS te va a dar acceso a la brevedad.
        </div>
      )}

      {empresas.map((empresa) => (
        <div key={empresa.id} className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-700">
            <Building2 size={18} className="text-primary" /> {empresa.nombre}
            <span className="text-sm font-normal text-gray-400">({empresa.sedes.length})</span>
          </h3>

          {empresa.sedes.length === 0 ? (
            <p className="text-sm text-gray-400">Sin sedes habilitadas.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {empresa.sedes.map((sede) => {
                // Mismo texto de sede que muestran los documentos, para que
                // el filtro de /cuenta/documentos la encuentre.
                const etiqueta = variasEmpresas ? etiquetaSedeEmpresa(empresa.nombre, sede.nombre) : sede.nombre;
                return (
                  <Link
                    key={sede.id}
                    href={`/cuenta/documentos?sede=${encodeURIComponent(etiqueta)}`}
                    title={`Ver documentos de ${sede.nombre}`}
                    className="block p-4 transition-colors border border-gray-200 rounded-lg bg-gray-50 hover:border-primary/40 group"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="mt-0.5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate group-hover:text-primary group-hover:underline">{sede.nombre}</div>
                        {sede.direccion && <div className="text-xs text-gray-500 truncate">{sede.direccion}</div>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {Object.keys(TIPOS_DOC).filter((t) => sede.tipos.includes(t)).map((tipo) => {
                        const Icono = TIPOS_DOC[tipo].icono;
                        return (
                          <span key={tipo} className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] text-gray-600 bg-white border border-gray-200 rounded-full">
                            <Icono size={10} /> {TIPOS_DOC[tipo].label}
                          </span>
                        );
                      })}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
