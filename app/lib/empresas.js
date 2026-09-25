// app/lib/empresas.js
// Utilidades de Empresas/Sedes compartidas por el panel (/admin/empresas) y,
// más adelante, el selector de empresa al emitir documentos y el portal.

// Sufijos societarios que no distinguen una empresa de otra al comparar
// nombres ("A&A S.A." y "A y A" son la misma).
const SUFIJOS_SOCIETARIOS = ['sa', 'srl', 'sas', 'sca', 'sh', 'sociedad anonima'];

// Nombre comparable: sin mayúsculas, acentos, puntuación ni sufijo
// societario, y con "&" y "y" unificados.
export function normalizarNombreEmpresa(nombre = '') {
  let n = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' y ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  for (const sufijo of SUFIJOS_SOCIETARIOS) {
    if (n.endsWith(` ${sufijo}`)) n = n.slice(0, -sufijo.length - 1);
  }
  // Tras sacar puntuación, "S.A." queda como "s a": se contempla también.
  n = n.replace(/ s a$| s r l$| s a s$/, '');
  return n.replace(/ /g, '');
}

export const normalizarCuit = (cuit = '') => cuit.replace(/\D/g, '');

// Empresas ya cargadas que parecen ser la misma que `datos` (mismo nombre
// normalizado o mismo CUIT), para avisar antes de crear un duplicado.
export function buscarEmpresasSimilares(empresas, datos, excluirId = null) {
  const nombre = normalizarNombreEmpresa(datos.nombre);
  const cuit = normalizarCuit(datos.cuit);
  return empresas.filter((e) => e.id !== excluirId && (
    (nombre && normalizarNombreEmpresa(e.nombre) === nombre)
    || (cuit && normalizarCuit(e.cuit) === cuit)
  ));
}

export const nuevaSedeId = () => (typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`);

// Una sede sin `activa` explícito cuenta como activa (sedes migradas).
export const esSedeActiva = (sede) => sede.activa !== false;

export const sedesActivas = (empresa) => (empresa?.sedes || []).filter(esSedeActiva);
