// app/components/cliente/ListaDocumentos.jsx
'use client';

import { TIPOS_DOC, formatMoney } from '../../lib/documentosCliente';
import { BadgeSede, CeldaEstado, AccionesDocumento } from './DocumentoBadges';

// Grilla de tarjetas o tabla de documentos ya normalizados y filtrados.
// Compartido entre el buscador de Inicio (app/cuenta/page.js) y el hub
// completo (app/cuenta/documentos/page.js) para no duplicar este markup.
export default function ListaDocumentos({ documentos, vista }) {
  if (vista === 'cards') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documentos.map((doc) => {
          const Icono = TIPOS_DOC[doc.tipo].icono;
          return (
            <div key={`${doc.tipo}-${doc.id}`} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                  <Icono size={12} /> {TIPOS_DOC[doc.tipo].label}
                </span>
                <span className="text-xs text-gray-500">{doc.fecha}</span>
              </div>
              <div className="mb-1 text-sm font-semibold text-gray-900">{doc.numero}</div>
              <div className="mb-2"><BadgeSede nombre={doc.sede} /></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {doc.monto !== undefined && doc.monto !== null && (
                    <span className="text-sm font-medium text-gray-900">{formatMoney(doc.monto)}</span>
                  )}
                  <CeldaEstado doc={doc} />
                </div>
                <AccionesDocumento doc={doc} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Tipo</th>
            <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Número</th>
            <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
            <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Sede</th>
            <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Estado</th>
            <th className="px-4 py-2 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Monto</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documentos.map((doc) => {
            const Icono = TIPOS_DOC[doc.tipo].icono;
            return (
              <tr key={`${doc.tipo}-${doc.id}`}>
                <td className="px-4 py-2 text-sm whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                    <Icono size={12} /> {TIPOS_DOC[doc.tipo].label}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{doc.numero}</td>
                <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">{doc.fecha}</td>
                <td className="px-4 py-2 text-sm whitespace-nowrap"><BadgeSede nombre={doc.sede} /></td>
                <td className="px-4 py-2 text-sm whitespace-nowrap"><CeldaEstado doc={doc} /></td>
                <td className="px-4 py-2 text-sm font-medium text-right text-gray-900 whitespace-nowrap">
                  {doc.monto !== undefined && doc.monto !== null ? formatMoney(doc.monto) : '-'}
                </td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <AccionesDocumento doc={doc} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
