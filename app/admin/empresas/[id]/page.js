// app/admin/empresas/[id]/page.js
'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Home, Edit, MapPin, PlusCircle, Trash, Archive, ArchiveRestore, Building2, IdCard, Mail, Phone, ChevronDown, Users } from 'lucide-react';
import { obtenerEmpresaPorId, obtenerEmpresas, actualizarEmpresa, contarDocumentosDeEmpresa, obtenerUsuarios } from '../../../lib/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';
import { buscarEmpresasSimilares, nuevaSedeId, esSedeActiva } from '../../../lib/empresas';
import EmpresaForm from '../../../components/admin/EmpresaForm';
import DocumentosEmpresa from '../../../components/admin/DocumentosEmpresa';
import { accionIconoClase, ACCION_ICONO_TAMANO } from '../../../components/admin/accionIcono';

const SEDE_VACIA = { nombre: '', direccion: '' };

function FormSede({ inicial = SEDE_VACIA, onGuardar, onCancelar, guardando, textoGuardar = 'Guardar' }) {
  const [datos, setDatos] = useState(inicial);
  const valido = datos.nombre.trim() !== '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valido) return;
    onGuardar({ nombre: datos.nombre.trim(), direccion: datos.direccion.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="text"
        value={datos.nombre}
        onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
        placeholder="Nombre de la sede"
        autoFocus
        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
      />
      <input
        type="text"
        value={datos.direccion}
        onChange={(e) => setDatos({ ...datos, direccion: e.target.value })}
        placeholder="Dirección"
        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancelar} className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100">
          Cancelar
        </button>
        <button type="submit" disabled={guardando || !valido} className="px-3 py-2 text-sm text-white rounded-md bg-primary hover:bg-primary-light disabled:opacity-50">
          {guardando ? 'Guardando...' : textoGuardar}
        </button>
      </div>
    </form>
  );
}

function FichaEmpresa() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [usuariosConAcceso, setUsuariosConAcceso] = useState([]);
  const { loading: loadingAuth, puede } = useStaffAuth({ modulo: 'empresas', accion: 'ver' });
  const [empresa, setEmpresa] = useState(null);
  const [cargando, setCargando] = useState(true);
  // ?editar=1 (lápiz del listado de Empresas) abre directo en edición.
  const [editandoDatos, setEditandoDatos] = useState(() => searchParams.get('editar') === '1');
  const [guardandoDatos, setGuardandoDatos] = useState(false);

  const [agregandoSede, setAgregandoSede] = useState(false);
  const [editandoSedeId, setEditandoSedeId] = useState(null);
  const [guardandoSede, setGuardandoSede] = useState(false);
  const [procesandoSedeId, setProcesandoSedeId] = useState(null);
  const [verArchivadas, setVerArchivadas] = useState(false);

  useEffect(() => {
    if (loadingAuth) return;
    // Usuarios con algún acceso a esta empresa (pocos usuarios en total: se
    // filtra en memoria en vez de indexar cada empresa dentro de accesos).
    obtenerUsuarios()
      .then((usuarios) => setUsuariosConAcceso(usuarios.filter((u) => u.accesos?.[id])))
      .catch(() => setUsuariosConAcceso([]));
    obtenerEmpresaPorId(id)
      .then(setEmpresa)
      .catch(() => setEmpresa(null))
      .finally(() => setCargando(false));
  }, [loadingAuth, id]);

  const sedes = empresa?.sedes || [];
  const activas = sedes.filter(esSedeActiva);
  const archivadas = sedes.filter((s) => !esSedeActiva(s));

  const handleGuardarDatos = async (datos) => {
    const cambioIdentidad = datos.nombre !== empresa.nombre || datos.cuit !== (empresa.cuit || '');
    if (cambioIdentidad) {
      const similares = buscarEmpresasSimilares(await obtenerEmpresas().catch(() => []), datos, id);
      if (similares.length > 0) {
        const nombres = similares.map((e) => `• ${e.nombre}${e.cuit ? ` (CUIT ${e.cuit})` : ''}`).join('\n');
        if (!confirm(`Ya hay empresas que parecen ser la misma:\n${nombres}\n\n¿Guardar igual?`)) return;
      }
    }

    setGuardandoDatos(true);
    try {
      await actualizarEmpresa(id, datos);
      setEmpresa({ ...empresa, ...datos });
      setEditandoDatos(false);
    } catch (error) {
      alert('No se pudieron guardar los datos de la empresa.');
    } finally {
      setGuardandoDatos(false);
    }
  };

  // Guarda el array completo de sedes y actualiza el estado local.
  const guardarSedes = async (nuevasSedes) => {
    await actualizarEmpresa(id, { sedes: nuevasSedes });
    setEmpresa((actual) => ({ ...actual, sedes: nuevasSedes }));
  };

  const nombreRepetido = (nombre, excluirId = null) =>
    sedes.some((s) => s.id !== excluirId && s.nombre.trim().toLowerCase() === nombre.toLowerCase());

  const handleAgregarSede = async (datos) => {
    if (nombreRepetido(datos.nombre)) {
      alert(`Ya hay una sede llamada "${datos.nombre}" en esta empresa.`);
      return;
    }
    setGuardandoSede(true);
    try {
      await guardarSedes([...sedes, { id: nuevaSedeId(), ...datos, activa: true }]);
      setAgregandoSede(false);
    } catch (error) {
      alert('No se pudo agregar la sede.');
    } finally {
      setGuardandoSede(false);
    }
  };

  const handleEditarSede = async (sedeId, datos) => {
    if (nombreRepetido(datos.nombre, sedeId)) {
      alert(`Ya hay una sede llamada "${datos.nombre}" en esta empresa.`);
      return;
    }
    setGuardandoSede(true);
    try {
      await guardarSedes(sedes.map((s) => (s.id === sedeId ? { ...s, ...datos } : s)));
      setEditandoSedeId(null);
    } catch (error) {
      alert('No se pudo guardar la sede.');
    } finally {
      setGuardandoSede(false);
    }
  };

  // Una sede sin documentos se borra; con documentos se archiva, para que
  // esos documentos sigan apuntando a una sede que existe.
  const handleQuitarSede = async (sede) => {
    setProcesandoSedeId(sede.id);
    try {
      const cantidad = await contarDocumentosDeEmpresa(id, sede.id);
      if (cantidad > 0) {
        if (!confirm(`"${sede.nombre}" tiene ${cantidad} ${cantidad === 1 ? 'documento' : 'documentos'}, así que no se puede eliminar. ¿Archivarla? No se va a poder elegir para documentos nuevos, pero sus documentos se conservan.`)) return;
        await guardarSedes(sedes.map((s) => (s.id === sede.id ? { ...s, activa: false } : s)));
      } else {
        if (!confirm(`¿Eliminar la sede "${sede.nombre}"?`)) return;
        await guardarSedes(sedes.filter((s) => s.id !== sede.id));
      }
    } catch (error) {
      alert('No se pudo quitar la sede.');
    } finally {
      setProcesandoSedeId(null);
    }
  };

  const handleReactivarSede = async (sede) => {
    setProcesandoSedeId(sede.id);
    try {
      await guardarSedes(sedes.map((s) => (s.id === sede.id ? { ...s, activa: true } : s)));
    } catch (error) {
      alert('No se pudo reactivar la sede.');
    } finally {
      setProcesandoSedeId(null);
    }
  };

  if (loadingAuth || cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="container px-4 py-8 mx-auto text-center">
        <p className="mb-4 text-gray-600">No se encontró la empresa.</p>
        <Link href="/admin/empresas" className="text-primary hover:underline">Volver a Empresas</Link>
      </div>
    );
  }

  const DATOS = [
    { label: 'Razón social', valor: empresa.razonSocial, icono: Building2 },
    { label: 'CUIT', valor: empresa.cuit, icono: IdCard },
    { label: 'Email', valor: empresa.email, icono: Mail },
    { label: 'Teléfono', valor: empresa.telefono, icono: Phone }
  ];

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-wrap items-center mb-8">
        <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
          <Home size={16} className="mr-1" /> Panel
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <Link href="/admin/empresas" className="text-primary hover:underline">Empresas</Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-700">{empresa.nombre}</span>
      </div>

      {/* Datos de la empresa */}
      <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
        {editandoDatos ? (
          <>
            <h2 className="mb-4 text-xl font-bold font-montserrat text-primary">Editar empresa</h2>
            <EmpresaForm
              inicial={empresa}
              onGuardar={handleGuardarDatos}
              onCancelar={() => setEditandoDatos(false)}
              guardando={guardandoDatos}
            />
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold font-montserrat text-primary">{empresa.nombre}</h2>
              {puede('empresas', 'gestionar') && (
                <button
                  type="button"
                  onClick={() => setEditandoDatos(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 shrink-0"
                >
                  <Edit size={16} /> Editar
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {DATOS.map(({ label, valor, icono: Icono }) => (
                <div key={label}>
                  <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">{label}</p>
                  <p className="flex items-center gap-1 text-gray-800 break-all">
                    <Icono size={14} className="text-gray-400 shrink-0" />
                    {valor || '-'}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sedes */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Sedes ({activas.length})</h3>
          {!agregandoSede && (
            puede('empresas', 'gestionar') && (
              <button
                type="button"
                onClick={() => { setAgregandoSede(true); setEditandoSedeId(null); }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white rounded-md bg-primary hover:bg-primary-light"
              >
                <PlusCircle size={16} /> Agregar sede
              </button>
            )
          )}
        </div>

        {agregandoSede && (
          <div className="p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50">
            <FormSede
              onGuardar={handleAgregarSede}
              onCancelar={() => setAgregandoSede(false)}
              guardando={guardandoSede}
              textoGuardar="Agregar"
            />
          </div>
        )}

        {activas.length === 0 && !agregandoSede && (
          <p className="py-4 text-sm text-gray-500">
            Esta empresa todavía no tiene sedes. Agregá al menos una para poder emitirle documentos.
          </p>
        )}

        <div className="divide-y divide-gray-100">
          {activas.map((sede) => (
            <div key={sede.id} className="py-3">
              {editandoSedeId === sede.id ? (
                <FormSede
                  inicial={{ nombre: sede.nombre, direccion: sede.direccion || '' }}
                  onGuardar={(datos) => handleEditarSede(sede.id, datos)}
                  onCancelar={() => setEditandoSedeId(null)}
                  guardando={guardandoSede}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{sede.nombre}</div>
                    <div className="text-sm text-gray-500 truncate">{sede.direccion || 'Sin dirección'}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {puede('empresas', 'gestionar') && (
                      <button
                        type="button"
                        onClick={() => { setEditandoSedeId(sede.id); setAgregandoSede(false); }}
                        title="Editar"
                        className={accionIconoClase('secondary')}
                      >
                        <Edit size={ACCION_ICONO_TAMANO} />
                      </button>
                    )}
                    {puede('empresas', 'gestionar') && (
                      <button
                        type="button"
                        onClick={() => handleQuitarSede(sede)}
                        disabled={procesandoSedeId === sede.id}
                        title="Eliminar o archivar"
                        className={accionIconoClase('red')}
                      >
                        <Trash size={ACCION_ICONO_TAMANO} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {archivadas.length > 0 && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setVerArchivadas((v) => !v)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary"
            >
              <Archive size={14} />
              Sedes archivadas ({archivadas.length})
              <ChevronDown size={14} className={verArchivadas ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
            {verArchivadas && (
              <div className="mt-2 divide-y divide-gray-100">
                {archivadas.map((sede) => (
                  <div key={sede.id} className="flex items-center gap-3 py-3 opacity-70">
                    <MapPin size={18} className="text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 truncate">{sede.nombre}</div>
                      <div className="text-sm text-gray-500 truncate">{sede.direccion || 'Sin dirección'}</div>
                    </div>
                    {puede('empresas', 'gestionar') && (
                      <button
                        type="button"
                        onClick={() => handleReactivarSede(sede)}
                        disabled={procesandoSedeId === sede.id}
                        title="Reactivar"
                        className={accionIconoClase('green')}
                      >
                        <ArchiveRestore size={ACCION_ICONO_TAMANO} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Usuarios con acceso */}
      <div className="p-6 mt-6 bg-white rounded-lg shadow-md">
        <h3 className="flex items-center gap-2 mb-1 text-lg font-semibold text-gray-700">
          <Users size={18} className="text-primary" /> Usuarios con acceso ({usuariosConAcceso.length})
        </h3>
        <p className="mb-4 text-sm text-gray-500">Los accesos se asignan desde la ficha de cada usuario.</p>
        {usuariosConAcceso.length === 0 ? (
          <p className="text-sm text-gray-400">Ningún usuario tiene acceso a esta empresa todavía.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {usuariosConAcceso.map((u) => {
              const sedesUsuario = Object.keys(u.accesos[id] || {});
              const detalle = sedesUsuario.includes('*')
                ? 'todas las sedes'
                : `${sedesUsuario.length} ${sedesUsuario.length === 1 ? 'sede' : 'sedes'}`;
              return (
                <Link
                  key={u.id}
                  href={`/admin/usuarios/${u.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-800 border border-blue-200 rounded-full bg-blue-50 hover:bg-blue-100"
                >
                  {u.nombre ? `${u.nombre} ${u.apellido || ''}`.trim() : u.email}
                  <span className="text-xs text-blue-600">· {detalle}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Documentos */}
      <h3 className="mt-8 mb-4 text-xl font-bold text-gray-800">Documentos</h3>
      <DocumentosEmpresa empresa={empresa} sedeInicial={searchParams.get('sede') || 'todas'} />
    </div>
  );
}

export default function FichaEmpresaPage() {
  return (
    <Suspense fallback={null}>
      <FichaEmpresa />
    </Suspense>
  );
}
