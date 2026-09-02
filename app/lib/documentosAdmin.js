// app/lib/documentosAdmin.js
// Variante de documentosCliente.js para el panel admin: normaliza los mismos
// 7 tipos de documento pero sin acotar por cliente (para el buscador que
// cruza documentos de todos los clientes a la vez), sumando el nombre,
// empresa y clienteId de cada uno.
import { formatFecha, fechaOrdenDe, SEDE_ANIDADA } from './documentosCliente';

// presupuesto/remito/estado/orden guardan el cliente denormalizado en
// `cliente.{nombre,empresa}`; factura/certificado lo guardan flat en
// `clienteNombre`; recibo no tiene un campo de nombre propio, así que se usa
// `recibiDe` (texto libre que carga el admin al crearlo) como mejor esfuerzo.
const clienteNombreDe = (doc) => doc.cliente?.nombre || doc.clienteNombre || doc.recibiDe || null;
const clienteEmpresaDe = (doc) => doc.cliente?.empresa || null;

const normalizarUno = (tipo, doc) => {
  // Los informes no tienen número correlativo, solo un título de texto libre
  // (ej. "CERTIFICACIÓN") — se usa como "número" para poder listarlos junto
  // al resto con la misma columna.
  const numero = doc.numero || doc.nombre || doc.titulo || '-';
  const sede = SEDE_ANIDADA.has(tipo) ? doc.cliente?.sedeNombre : doc.sedeNombre;
  const clienteNombre = clienteNombreDe(doc);
  const clienteEmpresa = clienteEmpresaDe(doc);
  return {
    id: doc.id,
    tipo,
    numero,
    fecha: formatFecha(doc),
    fechaOrden: fechaOrdenDe(doc),
    sede,
    clienteId: doc.clienteId || null,
    clienteNombre,
    clienteEmpresa,
    monto: doc.total ?? doc.monto,
    estado: doc.estado,
    archivos: doc.archivos,
    // Mismo criterio que documentosCliente.js: además del número suma sede,
    // cliente/empresa y concepto/descripción/contenido, para que la búsqueda
    // no dependa de saber el número exacto de memoria.
    texto: [numero, sede, clienteNombre, clienteEmpresa, doc.concepto, doc.descripcion, doc.contenido].filter(Boolean).join(' ').toLowerCase(),
    raw: doc
  };
};

// `colecciones` es { presupuestos, remitos, recibos, facturas, certificados,
// estados, ordenesTrabajo, documentos } ya sin acotar por cliente
// (obtenerPresupuestos(), obtenerRemitos(), ..., obtenerDocumentos() de
// firestore.js — `documentos` son los informes). Devuelve un único array
// ordenado por fecha descendente.
export function normalizarDocumentosAdmin(colecciones) {
  const todos = [
    ...colecciones.presupuestos.map((d) => normalizarUno('presupuesto', d)),
    ...colecciones.remitos.map((d) => normalizarUno('remito', d)),
    ...colecciones.recibos.map((d) => normalizarUno('recibo', d)),
    ...colecciones.facturas.map((d) => normalizarUno('factura', d)),
    ...colecciones.certificados.map((d) => normalizarUno('certificado', d)),
    ...colecciones.estados.map((d) => normalizarUno('estado', d)),
    ...colecciones.ordenesTrabajo.map((d) => normalizarUno('orden', d)),
    ...colecciones.documentos.map((d) => normalizarUno('informe', d))
  ];
  return todos.sort((a, b) => b.fechaOrden - a.fechaOrden);
}
