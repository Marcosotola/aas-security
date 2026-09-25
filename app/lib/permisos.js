// app/lib/permisos.js
// Permisos del personal (rol "Personal"): cada persona tiene un perfil con
// un nivel por módulo, copiado a su documento de usuario (`permisos`) para
// que firestore.rules lo lea de un solo lugar. El Admin puede todo.
//
// Niveles:
// - ninguno: no ve el módulo.
// - ver: ve todo, sin crear, editar ni borrar.
// - propios: ve, crea, edita y borra solo lo que creó (usuarioCreador).
// - todos: crea, edita y borra todo.
import { TIPOS_DOC } from './documentosCliente';

export const NIVELES = {
  ninguno: 'Sin acceso',
  ver: 'Ver',
  propios: 'Propios',
  todos: 'Todos'
};

// Módulos que no son documentos: "propios" no aplica.
const MODULOS_EXTRA = {
  finanzas: { label: 'Finanzas' },
  listaPrecios: { label: 'Lista de precios' },
  plantillas: { label: 'Plantillas de inspección' },
  consultas: { label: 'Consultas' },
  empresas: { label: 'Empresas' }
};

// Registro de módulos: la clave es la que usan `permisos` y las reglas.
// Un tipo de documento nuevo en TIPOS_DOC aparece solo acá.
export const MODULOS = {
  ...Object.fromEntries(Object.entries(TIPOS_DOC).map(([tipo, { label }]) => [
    tipo, { label, niveles: ['ninguno', 'ver', 'propios', 'todos'], documento: true }
  ])),
  ...Object.fromEntries(Object.entries(MODULOS_EXTRA).map(([clave, m]) => [
    clave, { ...m, niveles: ['ninguno', 'ver', 'todos'], documento: false }
  ]))
};

export const esAdmin = (usuario) => usuario?.role === 'Admin';

// Personal interno (panel): Admin, Personal y el rol Técnico anterior
// mientras dura la migración a perfiles.
export const esInterno = (usuario) => ['Admin', 'Personal', 'Tecnico'].includes(usuario?.role);

// Acceso del rol Técnico anterior (antes de migrar a perfiles): OT y
// Mantenimiento Preventivo propios, como funcionaba hasta ahora.
const NIVELES_TECNICO = { orden: 'propios', mantenimiento: 'propios' };

export function nivelDe(usuario, modulo) {
  if (esAdmin(usuario)) return 'todos';
  if (usuario?.role === 'Personal') return usuario.permisos?.[modulo] || 'ninguno';
  if (usuario?.role === 'Tecnico') return NIVELES_TECNICO[modulo] || 'ninguno';
  return 'ninguno';
}

// accion: 'ver' | 'crear' | 'gestionar' (editar/borrar todo). Con `doc`,
// 'gestionar' también vale para lo propio si el nivel es "propios".
export function puede(usuario, modulo, accion, doc = null) {
  const nivel = nivelDe(usuario, modulo);
  if (accion === 'ver') return nivel !== 'ninguno';
  if (accion === 'crear') return nivel === 'propios' || nivel === 'todos';
  if (accion === 'gestionar') {
    if (nivel === 'todos') return true;
    return nivel === 'propios' && Boolean(doc) && doc.usuarioCreador === usuario?.email;
  }
  return false;
}

// En listados: con "propios" solo se piden los documentos de esta persona.
export const soloPropios = (usuario, modulo) => nivelDe(usuario, modulo) === 'propios';

// Perfil sin ningún acceso, base para crear uno nuevo.
export const permisosVacios = () => Object.fromEntries(Object.keys(MODULOS).map((m) => [m, 'ninguno']));
