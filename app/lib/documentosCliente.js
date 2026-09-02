// app/lib/documentosCliente.js
// Normaliza los 7 tipos de documento del cliente (que llegan con formas
// distintas desde Firestore, ver useClienteAuth.js) a una forma común para
// poder listarlos juntos en un solo hub buscable (app/cuenta/documentos).
import { FileText, FileCheck, Receipt, Banknote, Award, DollarSign, ClipboardList, File } from 'lucide-react';

export const TIPOS_DOC = {
  presupuesto: { label: 'Presupuesto', icono: FileText },
  remito: { label: 'Remito', icono: FileCheck },
  recibo: { label: 'Recibo', icono: Receipt },
  factura: { label: 'Factura', icono: Banknote },
  certificado: { label: 'Certificado', icono: Award },
  estado: { label: 'Estado de cuenta', icono: DollarSign },
  orden: { label: 'Orden de trabajo', icono: ClipboardList },
  informe: { label: 'Informe', icono: File }
};

// La sede queda anidada en `cliente.sedeNombre` para los documentos armados
// con el generador interno (presupuesto/remito/estado/orden/informe) y como
// `sedeNombre` directo para los basados en archivo subido (recibo/factura/
// certificado) — misma dualidad que ya existe en la ficha de admin
// (app/admin/usuarios/[id]/page.js).
export const SEDE_ANIDADA = new Set(['presupuesto', 'remito', 'estado', 'orden', 'informe']);

export const formatMoney = (amount) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (amount === undefined || amount === null || isNaN(num)) return '$0,00';
  const formatted = num.toFixed(2).replace('.', ',');
  const parts = formatted.split(',');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return '$' + parts.join(',');
};

export const formatFecha = (doc) => {
  if (doc.fechaCreacion?.toDate) return doc.fechaCreacion.toDate().toLocaleDateString('es-AR');
  if (doc.fecha) {
    const [year, month, day] = doc.fecha.split('-').map(Number);
    if (year && month && day) return new Date(year, month - 1, day).toLocaleDateString('es-AR');
  }
  return '-';
};

export const fechaOrdenDe = (doc) => {
  if (doc.fechaCreacion?.toDate) return doc.fechaCreacion.toDate();
  if (doc.fecha) {
    const [year, month, day] = doc.fecha.split('-').map(Number);
    if (year && month && day) return new Date(year, month - 1, day);
  }
  return new Date(0);
};

const normalizarUno = (tipo, doc) => {
  const numero = doc.numero || doc.nombre || '-';
  const sede = SEDE_ANIDADA.has(tipo) ? doc.cliente?.sedeNombre : doc.sedeNombre;
  return {
    id: doc.id,
    tipo,
    numero,
    fecha: formatFecha(doc),
    fechaOrden: fechaOrdenDe(doc),
    sede,
    monto: doc.total ?? doc.monto,
    estado: doc.estado,
    archivos: doc.archivos,
    // Texto sobre el que busca filtrarDocumentos(): además del número suma
    // sede, concepto (recibos) y descripción (certificados), para que "buscar
    // cualquier cosa" no dependa de saber el número exacto de memoria.
    texto: [numero, sede, doc.concepto, doc.descripcion].filter(Boolean).join(' ').toLowerCase(),
    raw: doc
  };
};

// `documentos` es el objeto { presupuestos, remitos, recibos, facturas,
// certificados, estados, ordenesTrabajo } que expone useCliente(). Devuelve
// un único array ordenado por fecha descendente.
export function normalizarDocumentos(documentos) {
  const todos = [
    ...documentos.presupuestos.map((d) => normalizarUno('presupuesto', d)),
    ...documentos.remitos.map((d) => normalizarUno('remito', d)),
    ...documentos.recibos.map((d) => normalizarUno('recibo', d)),
    ...documentos.facturas.map((d) => normalizarUno('factura', d)),
    ...documentos.certificados.map((d) => normalizarUno('certificado', d)),
    ...documentos.estados.map((d) => normalizarUno('estado', d)),
    ...documentos.ordenesTrabajo.map((d) => normalizarUno('orden', d))
  ];
  return todos.sort((a, b) => b.fechaOrden - a.fechaOrden);
}

const inicioDia = (fechaString) => {
  const [year, month, day] = fechaString.split('-').map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
};

const finDia = (fechaString) => {
  const [year, month, day] = fechaString.split('-').map(Number);
  return year && month && day ? new Date(year, month - 1, day, 23, 59, 59, 999) : null;
};

// Buscador general (Inicio y hub de documentos): texto libre (número, sede,
// concepto, descripción) + sede exacta + rango de fechas, todo combinable.
export function filtrarDocumentos(todos, { busqueda = '', sede = 'todas', desde = '', hasta = '' } = {}) {
  const q = busqueda.trim().toLowerCase();
  const desdeFecha = desde ? inicioDia(desde) : null;
  const hastaFecha = hasta ? finDia(hasta) : null;

  return todos.filter((d) => {
    if (sede !== 'todas' && d.sede !== sede) return false;
    if (desdeFecha && d.fechaOrden < desdeFecha) return false;
    if (hastaFecha && d.fechaOrden > hastaFecha) return false;
    if (q && !d.texto.includes(q)) return false;
    return true;
  });
}
