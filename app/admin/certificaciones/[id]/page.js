'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, ArrowLeft, Edit, Download, Eye, Trash, Link2 } from 'lucide-react';
import { obtenerCertificacionPorId, eliminarCertificacion } from '../../../lib/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';
import DescargarCertificacionPDF from '../../../components/pdf/DescargarCertificacionPDF';
import { formatearFecha } from '../../../lib/fecha';
import { esHtmlEnriquecido } from '../../../lib/richText';

const Dato = ({ etiqueta, children }) => (
  <div>
    <span className="block text-xs font-medium text-gray-500">{etiqueta}</span>
    <span className="text-sm text-gray-900">{children || '-'}</span>
  </div>
);

export default function VerCertificacion({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: loadingAuth, puede } = useStaffAuth({ modulo: 'certificacion', accion: 'ver' });
  const [cert, setCert] = useState(null);

  useEffect(() => {
    if (!id || !user) return;
    obtenerCertificacionPorId(id)
      .then(setCert)
      .catch((error) => {
        console.error('Error al cargar la certificación:', error);
        alert(error.code === 'permission-denied' ? 'No tenés permiso para ver esta certificación.' : 'Error al cargar la certificación.');
        router.push('/admin/certificaciones');
      });
  }, [id, user, router]);

  const handleEliminar = async () => {
    if (!confirm('¿Eliminar esta certificación? También se borran sus fotos propias (las de las OT vinculadas no).')) return;
    try {
      await eliminarCertificacion(id);
      router.push('/admin/certificaciones');
    } catch (error) {
      console.error('Error al eliminar la certificación:', error);
      alert('Error al eliminar la certificación.');
    }
  };

  if (loadingAuth || !cert) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  const gestionar = puede('certificacion', 'gestionar', cert);
  const c = cert.certificador;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
              <Home size={16} className="mr-1" /> Panel
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link href="/admin/certificaciones" className="mr-4 text-primary hover:underline">Certificaciones</Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">N° {cert.numero}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/certificaciones" className="flex items-center px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
              <ArrowLeft size={18} className="mr-2" /> Volver
            </Link>
            {gestionar && (
              <Link href={`/admin/certificaciones/editar/${id}`} className="flex items-center px-4 py-2 text-white rounded-md bg-secondary hover:bg-blue-600">
                <Edit size={18} className="mr-2" /> Editar
              </Link>
            )}
            {gestionar && (
              <button onClick={handleEliminar} className="flex items-center px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600">
                <Trash size={18} className="mr-2" /> Eliminar
              </button>
            )}
            <DescargarCertificacionPDF certificacion={cert} modo="ver" className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <span className="flex items-center"><Eye size={18} className="mr-2" /> Ver PDF</span>
            </DescargarCertificacionPDF>
            <DescargarCertificacionPDF certificacion={cert} className="flex items-center px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-light">
              <span className="flex items-center"><Download size={18} className="mr-2" /> Descargar PDF</span>
            </DescargarCertificacionPDF>
          </div>
        </div>

        <h2 className="mb-1 text-2xl font-bold font-montserrat text-primary">Certificado N° {cert.numero}</h2>
        <p className="mb-6 font-medium text-red-700">{cert.sistemaCertificado}</p>

        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Dato etiqueta="Fecha de inspección">{formatearFecha(cert.fechaInspeccion)}</Dato>
              <Dato etiqueta="Vencimiento">{formatearFecha(cert.fechaVencimiento)}</Dato>
              <Dato etiqueta="Rubro">{cert.rubro}</Dato>
              <Dato etiqueta="Rev. planos">{cert.revPlanos}</Dato>
              <Dato etiqueta="Cliente">{cert.cliente?.nombre}{cert.cliente?.sedeNombre ? ` · ${cert.cliente.sedeNombre}` : ''}</Dato>
              <Dato etiqueta="Razón social">{cert.cliente?.razonSocial}</Dato>
              <Dato etiqueta="CUIT">{cert.cliente?.cuit}</Dato>
              <Dato etiqueta="Domicilio">{cert.cliente?.direccion}</Dato>
              <Dato etiqueta="N° de expediente">{cert.expediente}</Dato>
              <Dato etiqueta="Responsable certificado">
                {c ? `${[c.titulo, c.nombre].filter(Boolean).join(' ')}${c.matricula ? ` - MP ${c.matricula}` : ''}` : null}
              </Dato>
            </div>
          </div>

          {cert.memoria && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="mb-3 text-lg font-semibold text-gray-700">Memoria descriptiva</h3>
              {esHtmlEnriquecido(cert.memoria) ? (
                <div className="text-sm rich-text-view" dangerouslySetInnerHTML={{ __html: cert.memoria }} />
              ) : (
                <p className="text-sm whitespace-pre-line">{cert.memoria}</p>
              )}
            </div>
          )}

          {cert.vinculados?.length > 0 && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="mb-3 text-lg font-semibold text-gray-700">Inspecciones vinculadas (anexo del PDF)</h3>
              <ul className="space-y-2">
                {cert.vinculados.map((v) => (
                  <li key={`${v.tipo}-${v.id}`} className="flex items-center gap-2 text-sm">
                    <Link2 size={16} className="text-primary" />
                    <Link
                      href={`/admin/${v.tipo === 'mantenimiento' ? 'mantenimiento-preventivo' : 'ordenes-trabajo'}/${v.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {v.tipo === 'mantenimiento' ? 'Mantenimiento' : 'OT'} {v.numero}
                    </Link>
                    <span className="text-gray-500">{formatearFecha(v.fecha)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cert.fotos?.length > 0 && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="mb-3 text-lg font-semibold text-gray-700">Registro fotográfico</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {cert.fotos.map((foto) => (
                  <a key={foto.url} href={foto.url} target="_blank" rel="noopener noreferrer">
                    <img src={foto.url} alt="Foto" className="object-cover w-full border border-gray-200 rounded aspect-square" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-3 text-lg font-semibold text-gray-700">Firmas</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs text-gray-500">Profesional interviniente</p>
                {c?.firmaSello ? <img src={c.firmaSello} alt="Firma y sello" className="object-contain h-28" /> : <p className="text-sm text-amber-600">Sin firma y sello.</p>}
              </div>
              <div>
                <p className="mb-2 text-xs text-gray-500">Propietario / responsable del inmueble</p>
                {cert.firmaResponsable ? (
                  <>
                    <img src={cert.firmaResponsable} alt="Firma del responsable" className="object-contain h-28" />
                    <p className="text-sm">{cert.aclaracionResponsable}</p>
                  </>
                ) : <p className="text-sm text-gray-400">Sin firmar.</p>}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Creado por {cert.usuarioCreador || '-'}
            {cert.fechaCreacion?.toDate ? ` el ${cert.fechaCreacion.toDate().toLocaleString('es-AR')}` : ''}.
          </p>
        </div>
      </div>
    </div>
  );
}
