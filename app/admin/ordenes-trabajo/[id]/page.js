'use client';

import { useState, useEffect, use, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, ArrowLeft, Edit, Download, Trash } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { eliminarOrdenTrabajo } from '../../../lib/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';
import DescargarOrdenTrabajoPDF from '../../../components/pdf/DescargarOrdenTrabajoPDF';
import { formatearFecha } from '../../../lib/fecha';

const ESTADO_LABEL = { OK: 'OK', NOK: 'N OK', NA: 'N/A' };
const ESTADO_CLASE = { OK: 'bg-success text-white', NOK: 'bg-danger text-white', NA: 'bg-gray-400 text-white' };
const SEVERIDAD_CLASE = { LEVE: 'bg-warning text-white', MODERADA: 'bg-orange-600 text-white', CRITICA: 'bg-danger text-white' };

export default function VerOrdenTrabajo({ params }) {
  const { id } = use(params);

  const router = useRouter();
  const { user, loading: loadingAuth } = useStaffAuth(['Admin', 'Tecnico']);
  const [loadingData, setLoadingData] = useState(true);
  const [orden, setOrden] = useState(null);
  const loading = loadingAuth || loadingData;

  useEffect(() => {
    if (!id || !user) return;

    (async () => {
      try {
        const ordenDoc = doc(db, 'ordenesTrabajo', id);
        const ordenSnapshot = await getDoc(ordenDoc);

        if (ordenSnapshot.exists()) {
          setOrden({ id: ordenSnapshot.id, ...ordenSnapshot.data() });
        } else {
          alert('Orden de trabajo no encontrada.');
          router.push('/admin/ordenes-trabajo');
        }
        setLoadingData(false);
      } catch (error) {
        console.error('Error al cargar la orden de trabajo:', error);
        alert(
          error.code === 'permission-denied'
            ? 'No tenés permiso para ver esta orden de trabajo (no fue creada por vos).'
            : 'Error al cargar los datos de la orden de trabajo.'
        );
        router.push('/admin/ordenes-trabajo');
      }
    })();
  }, [id, user, router]);

  const handleEliminar = async () => {
    if (confirm('¿Está seguro de que desea eliminar esta orden de trabajo? También se borrarán sus fotos.')) {
      try {
        await eliminarOrdenTrabajo(id);
        alert('Orden de trabajo eliminada exitosamente.');
        router.push('/admin/ordenes-trabajo');
      } catch (error) {
        console.error('Error al eliminar la orden de trabajo:', error);
        alert('Error al eliminar la orden de trabajo.');
      }
    }
  };

  if (loading || !orden) {
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
      {/* Navegación y controles */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
                <Home size={16} className="mr-1" /> Panel
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <Link href="/admin/ordenes-trabajo" className="flex items-center mr-4 text-primary hover:underline">
                Órdenes de Trabajo
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="text-gray-700">Detalles</span>
            </div>

            <div className="flex space-x-2">
              <Link
                href="/admin/ordenes-trabajo"
                className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-2" /> Volver
              </Link>
              <Link
                href={`/admin/ordenes-trabajo/editar/${id}`}
                className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-secondary hover:bg-blue-600"
              >
                <Edit size={18} className="mr-2" /> Editar
              </Link>
              <button
                onClick={handleEliminar}
                className="flex items-center px-4 py-2 text-white transition-colors bg-red-500 rounded-md hover:bg-red-600"
              >
                <Trash size={18} className="mr-2" /> Eliminar
              </button>
              <DescargarOrdenTrabajoPDF
                orden={orden}
                className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
              >
                <span className="flex items-center"><Download size={18} className="mr-2" /> Descargar PDF</span>
              </DescargarOrdenTrabajoPDF>
            </div>
          </div>
        </div>
      </div>

      {/* Vista previa */}
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto bg-white shadow-lg">
          {/* Encabezado estilo PDF */}
          <div className="flex items-center justify-between px-8 py-6 border-b-2 border-blue-800">
            <div>
              <div className="text-2xl font-bold">
                <span className="text-blue-800">AAS</span>
                <span className="text-blue-500"> Security</span>
              </div>
              <div className="text-xs text-gray-600">Seguridad integral</div>
            </div>
            <div className="text-xs text-right text-gray-700">
              <div>Email: contacto@aassecurity.com.ar</div>
              <div>Teléfono: (351) 311 2962</div>
              <div>Web: www.aassecurity.com.ar</div>
            </div>
          </div>

          <div className="px-8 py-4">
            <h1 className="text-xl font-bold text-center text-blue-800">ORDEN DE TRABAJO</h1>
          </div>

          {/* Información en dos columnas */}
          <div className="flex px-8 py-4 space-x-6">
            <div className="flex-1 p-4 rounded bg-gray-50">
              <h3 className="p-2 mb-3 text-sm font-bold text-blue-800 bg-gray-100 rounded">Detalles</h3>
              <div className="space-y-2 text-xs">
                <div className="flex">
                  <span className="w-20 font-bold">Número:</span>
                  <span className="flex-1">{orden.numero || ''}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-bold">Fecha:</span>
                  <span className="flex-1">{formatearFecha(orden.fecha)}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 rounded bg-gray-50">
              <h3 className="p-2 mb-3 text-sm font-bold text-blue-800 bg-gray-100 rounded">Cliente</h3>
              <div className="space-y-2 text-xs">
                <div className="flex">
                  <span className="w-20 font-bold">Nombre:</span>
                  <span className="flex-1">{orden.cliente?.nombre || ''}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-bold">Empresa:</span>
                  <span className="flex-1">{orden.cliente?.empresa || ''}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-bold">Dirección:</span>
                  <span className="flex-1">{orden.cliente?.direccion || ''}</span>
                </div>
                {orden.cliente?.sedeNombre && (
                  <div className="flex">
                    <span className="w-20 font-bold">Sede:</span>
                    <span className="flex-1">{orden.cliente.sedeNombre}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Descripción del trabajo */}
          <div className="px-8 py-4">
            <h3 className="p-2 mb-3 text-sm font-bold text-blue-800 bg-gray-100 rounded">Descripción del Trabajo Realizado</h3>
            <div className="p-4 text-xs whitespace-pre-line rounded bg-gray-50">
              {orden.descripcionTrabajo || ''}
            </div>
          </div>

          {/* Observaciones */}
          {orden.observaciones && (
            <div className="px-8 py-4">
              <h3 className="p-2 mb-3 text-sm font-bold text-blue-800 bg-gray-100 rounded">Observaciones</h3>
              <div className="p-4 text-xs whitespace-pre-line rounded bg-gray-50">
                {orden.observaciones}
              </div>
            </div>
          )}

          {/* Firmas */}
          <div className="flex justify-around px-8 py-12 mt-4">
            <div className="flex flex-col items-center w-2/5">
              {orden.firmaTecnico && (
                <div className="flex items-center justify-center w-40 h-16 mb-2 border border-gray-200 rounded bg-gray-50">
                  <img src={orden.firmaTecnico} alt="Firma del técnico" className="object-contain max-w-full max-h-full" />
                </div>
              )}
              <div className="w-full pt-2 border-t border-gray-800">
                <div className="text-xs text-center">Firma del técnico</div>
                <div className="mt-1 text-xs font-bold text-center">{orden.aclaracionFirmaTecnico || 'Sin aclaración'}</div>
              </div>
            </div>
            <div className="flex flex-col items-center w-2/5">
              {orden.firmaCliente && (
                <div className="flex items-center justify-center w-40 h-16 mb-2 border border-gray-200 rounded bg-gray-50">
                  <img src={orden.firmaCliente} alt="Conformidad del cliente" className="object-contain max-w-full max-h-full" />
                </div>
              )}
              <div className="w-full pt-2 border-t border-gray-800">
                <div className="text-xs text-center">Conformidad del cliente</div>
                <div className="mt-1 text-xs font-bold text-center">{orden.aclaracionFirmaCliente || 'Sin aclaración'}</div>
              </div>
            </div>
          </div>

          {/* Planillas de inspección adjuntas */}
          {orden.planillasAdjuntas?.length > 0 && (
            <div className="px-8 py-4">
              <h3 className="p-2 mb-3 text-sm font-bold text-blue-800 bg-gray-100 rounded">
                Se adjunta la siguiente inspección
              </h3>
              <div className="space-y-4">
                {orden.planillasAdjuntas.map((planilla, i) => (
                  <div key={i} className="overflow-hidden border border-gray-200 rounded">
                    <div className="px-3 py-2 bg-gray-50">
                      <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">{planilla.grupo}</p>
                      <p className="text-sm font-bold text-gray-800">{planilla.titulo}</p>
                    </div>
                    {planilla.tipo === 'tabular' ? (
                      <div className="p-3">
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-[10px] border-collapse">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-2 py-1.5 font-semibold text-left border border-gray-200">Nº</th>
                                {(planilla.camposTexto || []).map((campo) => (
                                  <th key={campo} className="px-2 py-1.5 font-semibold text-left border border-gray-200 whitespace-nowrap">{campo}</th>
                                ))}
                                {planilla.columnas.map((col) => (
                                  <th key={col} className="px-2 py-1.5 font-semibold text-center border border-gray-200 whitespace-nowrap">{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(planilla.unidades || []).map((unidad, k) => (
                                <tr key={k} className={k % 2 === 1 ? 'bg-gray-50' : ''}>
                                  <td className="px-2 py-1 font-medium border border-gray-200">{unidad.numero}</td>
                                  {(planilla.camposTexto || []).map((campo) => (
                                    <td key={campo} className="px-2 py-1 border border-gray-200">{unidad.campos?.[campo] || '-'}</td>
                                  ))}
                                  {planilla.columnas.map((col) => {
                                    const valor = unidad.valores?.[col];
                                    return (
                                      <td key={col} className="px-2 py-1 text-center border border-gray-200">
                                        {valor ? (
                                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${ESTADO_CLASE[valor]}`}>
                                            {ESTADO_LABEL[valor]}
                                          </span>
                                        ) : '-'}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {(planilla.unidades || []).some((u) => u.observacion) && (
                          <div className="pt-3 mt-3 space-y-1 text-xs border-t border-gray-100">
                            {planilla.unidades.filter((u) => u.observacion).map((u, k) => (
                              <p key={k}>
                                <span className="font-semibold text-gray-700">
                                  {planilla.nombreUnidad} {u.numero}{u.severidad ? ` — ${u.severidad}` : ''}:
                                </span>{' '}
                                <span className="text-gray-500">{u.observacion}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                    <div className="divide-y divide-gray-100">
                      {planilla.items.map((item, j) => (
                        <Fragment key={j}>
                          {item.subtitulo && (
                            <div className="px-3 py-1.5 text-[10px] font-bold tracking-wide text-gray-500 uppercase bg-gray-100">
                              {item.subtitulo}
                            </div>
                          )}
                          <div className="flex flex-wrap items-start gap-2 px-3 py-2 text-xs">
                            <span className="flex-1 min-w-[160px]">{j + 1}. {item.descripcion}</span>
                            {item.estado && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${ESTADO_CLASE[item.estado]}`}>
                                {ESTADO_LABEL[item.estado]}
                              </span>
                            )}
                            {item.severidad && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${SEVERIDAD_CLASE[item.severidad]}`}>
                                {item.severidad}
                              </span>
                            )}
                            {item.observacion && (
                              <span className="w-full text-gray-500">{item.observacion}</span>
                            )}
                          </div>
                        </Fragment>
                      ))}
                    </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fotos (última sección) */}
          {orden.fotos?.length > 0 && (
            <div className="px-8 py-4">
              <h3 className="p-2 mb-3 text-sm font-bold text-blue-800 bg-gray-100 rounded">Fotos</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {orden.fotos.map((foto) => (
                  <a key={foto.path} href={foto.url} target="_blank" rel="noopener noreferrer">
                    <img src={foto.url} alt="Foto del trabajo" className="object-cover w-full border border-gray-200 rounded aspect-square" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Pie de página */}
          <div className="px-8 py-4 text-xs text-center text-gray-600 border-t border-blue-800">
            <div>AAS Security - CUIT: 20-24471842-7</div>
            <div>Ceferino Namuncura 5400, 5000 - Córdoba - Tel: (351) 311 2962 - www.aassecurity.com.ar</div>
          </div>
        </div>
      </div>
    </div>
  );
}
