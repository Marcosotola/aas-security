// app/admin/usuarios/[id]/page.js
'use client';

import { Suspense, useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Home, Edit, Mail, Phone, Building2, IdCard } from 'lucide-react';
import { obtenerUsuarioPorId, obtenerEmpresas, actualizarUsuario, obtenerPerfiles, asignarPerfil } from '../../../lib/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';
import AccesosUsuario from '../../../components/admin/AccesosUsuario';
import PerfilPersonal from '../../../components/admin/PerfilPersonal';

// Ficha de un usuario: sus datos y, según el rol, qué documentos ve en su
// portal (Cliente: accesos por empresa/sede/tipo) o qué puede hacer en el
// panel (Personal: perfil de permisos). Los documentos en sí se ven desde la
// ficha de cada empresa.
function FichaUsuario({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: loadingAuth } = useStaffAuth('admin');
  const [perfil, setPerfil] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    Promise.all([obtenerUsuarioPorId(id), obtenerEmpresas(), obtenerPerfiles()])
      .then(([perfilData, empresasData, perfilesData]) => {
        if (!perfilData) {
          alert('No se encontró el usuario.');
          router.push('/admin/usuarios');
          return;
        }
        setPerfil(perfilData);
        setEmpresas(empresasData);
        setPerfiles(perfilesData);
      })
      .catch((error) => console.error('Error al cargar el usuario:', error))
      .finally(() => setCargando(false));
  }, [user, id, router]);

  if (loadingAuth || cargando || !perfil) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  const nombreCompleto = perfil.nombre ? `${perfil.nombre} ${perfil.apellido || ''}`.trim() : perfil.email;
  const DATOS = [
    { label: 'Email', valor: perfil.email, icono: Mail },
    { label: 'Teléfono', valor: perfil.telefono, icono: Phone },
    { label: 'Empresa (declarada)', valor: perfil.empresa, icono: Building2 },
    { label: 'DNI / CUIT', valor: perfil.dniCuit, icono: IdCard }
  ];

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-wrap items-center mb-8">
        <Link href="/admin/dashboard" className="flex items-center mr-4 text-primary hover:underline">
          <Home size={16} className="mr-1" /> Panel
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <Link href="/admin/usuarios" className="mr-2 text-primary hover:underline">Usuarios</Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-700">{nombreCompleto}</span>
      </div>

      <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold font-montserrat text-primary">{nombreCompleto}</h2>
            <p className="text-sm text-gray-500">{perfil.role || 'Cliente'}</p>
          </div>
          <Link
            href={`/admin/usuarios/completar?uid=${id}`}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            <Edit size={16} /> Editar datos
          </Link>
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
      </div>

      {/* Personal (o Técnico anterior, o un cliente al que se lo está pasando
          a Personal desde el listado con ?perfil=1): su perfil de permisos. */}
      {(['Personal', 'Tecnico'].includes(perfil.role) || searchParams.get('perfil') === '1') && perfil.role !== 'Admin' && (
        <PerfilPersonal
          usuario={perfil}
          perfiles={perfiles}
          onAsignar={async (perfilElegido) => {
            await asignarPerfil(id, perfilElegido);
            setPerfil((prev) => ({ ...prev, role: 'Personal', perfilId: perfilElegido.id, permisos: perfilElegido.permisos }));
          }}
        />
      )}

      {(perfil.role || 'Cliente') === 'Cliente' ? (
        <AccesosUsuario
          accesosIniciales={perfil.accesos || {}}
          empresas={empresas}
          onGuardar={async (accesos) => {
            await actualizarUsuario(id, { accesos });
            setPerfil((prev) => ({ ...prev, accesos }));
          }}
        />
      ) : perfil.role === 'Admin' && (
        <p className="p-6 text-sm text-gray-500 bg-white rounded-lg shadow-md">
          Los Admin tienen acceso total al panel; los accesos por empresa son solo para clientes.
        </p>
      )}
    </div>
  );
}

export default function FichaUsuarioPage({ params }) {
  return (
    <Suspense fallback={null}>
      <FichaUsuario params={params} />
    </Suspense>
  );
}
