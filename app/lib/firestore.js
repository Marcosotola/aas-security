// lib/firestore.js
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { esSuperAdmin } from './superAdmin';

const getCollection = (name) => {
  if (!db) {
    throw new Error('Firebase no está configurado. Define NEXT_PUBLIC_FIREBASE_* para usar Firestore.');
  }
  return collection(db, name);
};

// Colecciones
const presupuestosCollection = db ? collection(db, 'presupuestos') : null;
const estadosCollection = db ? collection(db, 'estados') : null;
const remitosCollection = db ? collection(db, 'remitos') : null;
const consultasCollection = db ? collection(db, 'consultas') : null;
const listaPreciosCollection = db ? collection(db, 'listaPrecios') : null;
const usuariosCollection = db ? collection(db, 'usuarios') : null;
const ordenesTrabajoCollection = db ? collection(db, 'ordenesTrabajo') : null;
const plantillasCollection = db ? collection(db, 'plantillas') : null;
const facturasCollection = db ? collection(db, 'facturas') : null;
const certificadosCollection = db ? collection(db, 'certificados') : null;

// ========== FUNCIONES PARA PRESUPUESTOS ==========

// Crear un nuevo presupuesto
export const crearPresupuesto = async (presupuestoData) => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const docRef = await addDoc(presupuestosCollection, {
      ...presupuestoData,
      fechaCreacion: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error('Error al crear presupuesto:', error);
    throw error;
  }
};

// Obtener todos los presupuestos
export const obtenerPresupuestos = async () => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const q = query(presupuestosCollection, orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener presupuestos:', error);
    throw error;
  }
};

// Obtener un presupuesto por ID
export const obtenerPresupuestoPorId = async (id) => {
  try {
    const docRef = doc(db, 'presupuestos', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Presupuesto no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener presupuesto:', error);
    throw error;
  }
};

// Actualizar un presupuesto
export const actualizarPresupuesto = async (id, datosActualizados) => {
  try {
    const docRef = doc(db, 'presupuestos', id);
    await updateDoc(docRef, {
      ...datosActualizados,
      fechaActualizacion: serverTimestamp()
    });
    return { id };
  } catch (error) {
    console.error('Error al actualizar presupuesto:', error);
    throw error;
  }
};

// Eliminar un presupuesto
export const eliminarPresupuesto = async (id) => {
  try {
    const docRef = doc(db, 'presupuestos', id);
    await deleteDoc(docRef);
    return { id };
  } catch (error) {
    console.error('Error al eliminar presupuesto:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA ESTADOS DE CUENTA ==========

// Crear un nuevo estado
export const crearEstado = async (estadoData) => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const docRef = await addDoc(estadosCollection, {
      ...estadoData,
      fechaCreacion: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error('Error al crear estado:', error);
    throw error;
  }
};

// Obtener todos los estados
export const obtenerEstados = async () => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const q = query(estadosCollection, orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener estados:', error);
    throw error;
  }
};

// Obtener un estado por ID
export const obtenerEstadoPorId = async (id) => {
  try {
    const docRef = doc(db, 'estados', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Estado no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener estado:', error);
    throw error;
  }
};

// Actualizar un estado
export const actualizarEstado = async (id, datosActualizados) => {
  try {
    const docRef = doc(db, 'estados', id);
    await updateDoc(docRef, {
      ...datosActualizados,
      fechaActualizacion: serverTimestamp()
    });
    return { id };
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    throw error;
  }
};

// Eliminar un estado
export const eliminarEstado = async (id) => {
  try {
    const docRef = doc(db, 'estados', id);
    await deleteDoc(docRef);
    return { id };
  } catch (error) {
    console.error('Error al eliminar estado:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA REMITOS ==========

// Crear un nuevo remito
export const crearRemito = async (remitoData) => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const docRef = await addDoc(remitosCollection, {
      ...remitoData,
      fechaCreacion: serverTimestamp()
    });
    console.log("Remito creado con ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear remito: ", error);
    throw error;
  }
};

// Obtener todos los remitos
export const obtenerRemitos = async () => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const q = query(remitosCollection, orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener remitos:', error);
    throw error;
  }
};

// Obtener un remito por ID
export const obtenerRemitoPorId = async (id) => {
  try {
    const docRef = doc(db, 'remitos', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Remito no encontrado");
    }
  } catch (error) {
    console.error("Error al obtener remito:", error);
    throw error;
  }
};

// Actualizar un remito
export const actualizarRemito = async (id, remitoData) => {
  try {
    const docRef = doc(db, 'remitos', id);
    await updateDoc(docRef, {
      ...remitoData,
      fechaActualizacion: serverTimestamp()
    });
    console.log("Remito actualizado");
  } catch (error) {
    console.error("Error al actualizar remito:", error);
    throw error;
  }
};

// Eliminar un remito
export const eliminarRemito = async (id) => {
  try {
    const docRef = doc(db, 'remitos', id);
    await deleteDoc(docRef);
    return { id };
  } catch (error) {
    console.error('Error al eliminar remito:', error);
    throw error;
  }
};


// Función para crear un recibo
export const crearRecibo = async (reciboData) => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const docRef = await addDoc(collection(db, 'recibos'), {
      ...reciboData,
      fechaCreacion: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear recibo:', error);
    throw error;
  }
};

// Función para obtener todos los recibos
export const obtenerRecibos = async () => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const q = query(collection(db, 'recibos'), orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener recibos:', error);
    throw error;
  }
};

// Función para obtener un recibo por ID
export const obtenerReciboPorId = async (id) => {
  try {
    const docRef = doc(db, 'recibos', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Recibo no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener recibo:', error);
    throw error;
  }
};

// Función para actualizar un recibo
export const actualizarRecibo = async (id, reciboData) => {
  try {
    const docRef = doc(db, 'recibos', id);
    await updateDoc(docRef, {
      ...reciboData,
      fechaActualizacion: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar recibo:', error);
    throw error;
  }
};

// Función para eliminar un recibo
export const eliminarRecibo = async (id) => {
  try {
    await deleteDoc(doc(db, 'recibos', id));
  } catch (error) {
    console.error('Error al eliminar recibo:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA DOCUMENTOS (cartas, certificaciones, etc.) ==========

// Función para crear un documento
export const crearDocumento = async (documentoData) => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const docRef = await addDoc(collection(db, 'documentos'), {
      ...documentoData,
      fechaCreacion: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear documento:', error);
    throw error;
  }
};

// Función para obtener todos los documentos
export const obtenerDocumentos = async () => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const q = query(collection(db, 'documentos'), orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    throw error;
  }
};

// Función para obtener un documento por ID
export const obtenerDocumentoPorId = async (id) => {
  try {
    const docRef = doc(db, 'documentos', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Documento no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener documento:', error);
    throw error;
  }
};

// Función para actualizar un documento
export const actualizarDocumento = async (id, documentoData) => {
  try {
    const docRef = doc(db, 'documentos', id);
    await updateDoc(docRef, {
      ...documentoData,
      fechaActualizacion: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar documento:', error);
    throw error;
  }
};

// Función para eliminar un documento
export const eliminarDocumento = async (id) => {
  try {
    await deleteDoc(doc(db, 'documentos', id));
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA ÓRDENES DE TRABAJO (planillas) ==========
// A diferencia del resto de los documentos (que usan addDoc), acá el id se
// reserva antes de guardar: las fotos se suben a Storage bajo una carpeta
// con ese id, y necesitamos conocerlo antes de escribir el documento.

// Reserva un id de documento sin escribir nada todavía (para la carpeta de Storage)
export const generarIdOrdenTrabajo = () => doc(ordenesTrabajoCollection).id;

// Crea la orden de trabajo con un id ya reservado por generarIdOrdenTrabajo
export const crearOrdenTrabajo = async (id, otData) => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    await setDoc(doc(db, 'ordenesTrabajo', id), {
      ...otData,
      fechaCreacion: serverTimestamp()
    });
    return { id };
  } catch (error) {
    console.error('Error al crear la orden de trabajo:', error);
    throw error;
  }
};

// Obtener todas las órdenes de trabajo
export const obtenerOrdenesTrabajo = async () => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const q = query(ordenesTrabajoCollection, orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener las órdenes de trabajo:', error);
    throw error;
  }
};

// Obtener una orden de trabajo por ID
export const obtenerOrdenTrabajoPorId = async (id) => {
  try {
    const docRef = doc(db, 'ordenesTrabajo', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Orden de trabajo no encontrada');
    }
  } catch (error) {
    console.error('Error al obtener la orden de trabajo:', error);
    throw error;
  }
};

// Actualizar una orden de trabajo ya creada (edición desde
// ordenes-trabajo/editar/[id]). El array `fotos` que se pase reemplaza al
// anterior: las fotos que el usuario haya sacado del preview antes de
// guardar se borran de Storage aparte, con eliminarFotosStorage.
export const actualizarOrdenTrabajo = async (id, otData) => {
  try {
    const docRef = doc(db, 'ordenesTrabajo', id);
    await updateDoc(docRef, {
      ...otData,
      fechaActualizacion: serverTimestamp()
    });
    return { id };
  } catch (error) {
    console.error('Error al actualizar la orden de trabajo:', error);
    throw error;
  }
};

// Borra del Storage las fotos indicadas (array de { path }). Se usa tanto al
// eliminar una orden de trabajo completa como al sacar fotos puntuales en la
// edición. Silencioso ante fallos individuales (ej. la foto ya no existe).
export const eliminarFotosStorage = async (fotos) => {
  if (!fotos?.length) return;
  await Promise.all(
    fotos.map((foto) => deleteObject(ref(storage, foto.path)).catch(() => {}))
  );
};

// Eliminar una orden de trabajo, incluidas sus fotos en Storage
export const eliminarOrdenTrabajo = async (id) => {
  try {
    const ot = await obtenerOrdenTrabajoPorId(id).catch(() => null);
    await eliminarFotosStorage(ot?.fotos);
    await deleteDoc(doc(db, 'ordenesTrabajo', id));
    return { id };
  } catch (error) {
    console.error('Error al eliminar la orden de trabajo:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA PLANTILLAS (checklists de inspección para adjuntar a una OT) ==========

export const crearPlantilla = async (plantillaData) => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const docRef = await addDoc(plantillasCollection, {
      ...plantillaData,
      fechaCreacion: serverTimestamp()
    });
    return { id: docRef.id };
  } catch (error) {
    console.error('Error al crear la plantilla:', error);
    throw error;
  }
};

// Sin orderBy: el dataset es chico y se agrupa por grupo del lado del cliente
export const obtenerPlantillas = async () => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const querySnapshot = await getDocs(plantillasCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener las plantillas:', error);
    throw error;
  }
};

export const obtenerPlantillaPorId = async (id) => {
  try {
    const docRef = doc(db, 'plantillas', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Plantilla no encontrada');
    }
  } catch (error) {
    console.error('Error al obtener la plantilla:', error);
    throw error;
  }
};

export const actualizarPlantilla = async (id, datosActualizados) => {
  try {
    const docRef = doc(db, 'plantillas', id);
    await updateDoc(docRef, {
      ...datosActualizados,
      fechaActualizacion: serverTimestamp()
    });
    return { id };
  } catch (error) {
    console.error('Error al actualizar la plantilla:', error);
    throw error;
  }
};

export const eliminarPlantilla = async (id) => {
  try {
    await deleteDoc(doc(db, 'plantillas', id));
    return { id };
  } catch (error) {
    console.error('Error al eliminar la plantilla:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA FACTURAS (facturación: PDFs de facturas ya emitidas) ==========
// A diferencia de presupuestos/remitos/recibos (que generan su PDF al vuelo),
// acá se sube el PDF real de la factura a Storage, y puede haber más de uno
// por factura. Mismo patrón de reserva de id que Órdenes de Trabajo, para
// poder nombrar la carpeta de Storage antes de escribir el documento.

export const generarIdFactura = () => doc(facturasCollection).id;

export const crearFactura = async (id, facturaData) => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    await setDoc(doc(db, 'facturas', id), {
      ...facturaData,
      fechaCreacion: serverTimestamp()
    });
    return { id };
  } catch (error) {
    console.error('Error al crear la factura:', error);
    throw error;
  }
};

export const obtenerFacturas = async () => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const q = query(facturasCollection, orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener las facturas:', error);
    throw error;
  }
};

export const obtenerFacturaPorId = async (id) => {
  try {
    const docRef = doc(db, 'facturas', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Factura no encontrada');
    }
  } catch (error) {
    console.error('Error al obtener la factura:', error);
    throw error;
  }
};

export const actualizarFactura = async (id, facturaData) => {
  try {
    const docRef = doc(db, 'facturas', id);
    await updateDoc(docRef, {
      ...facturaData,
      fechaActualizacion: serverTimestamp()
    });
    return { id };
  } catch (error) {
    console.error('Error al actualizar la factura:', error);
    throw error;
  }
};

// Eliminar una factura, incluidos sus PDFs en Storage
export const eliminarFactura = async (id) => {
  try {
    const factura = await obtenerFacturaPorId(id).catch(() => null);
    await eliminarFotosStorage(factura?.archivos);
    await deleteDoc(doc(db, 'facturas', id));
    return { id };
  } catch (error) {
    console.error('Error al eliminar la factura:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA CERTIFICADOS (fotos o PDF por cliente y sede) ==========
// Mismo patrón que Facturas: se reserva el id antes de subir archivos, para
// poder nombrar la carpeta de Storage antes de escribir el documento. Sin
// estado pendiente/pagado ni monto: acá solo se archivan certificados
// (matafuegos, fumigación, etc.) asociados a un cliente y su sede.

export const generarIdCertificado = () => doc(certificadosCollection).id;

export const crearCertificado = async (id, certificadoData) => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    await setDoc(doc(db, 'certificados', id), {
      ...certificadoData,
      fechaCreacion: serverTimestamp()
    });
    return { id };
  } catch (error) {
    console.error('Error al crear el certificado:', error);
    throw error;
  }
};

export const obtenerCertificados = async () => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const q = query(certificadosCollection, orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener los certificados:', error);
    throw error;
  }
};

export const obtenerCertificadoPorId = async (id) => {
  try {
    const docRef = doc(db, 'certificados', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Certificado no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener el certificado:', error);
    throw error;
  }
};

export const actualizarCertificado = async (id, certificadoData) => {
  try {
    const docRef = doc(db, 'certificados', id);
    await updateDoc(docRef, {
      ...certificadoData,
      fechaActualizacion: serverTimestamp()
    });
    return { id };
  } catch (error) {
    console.error('Error al actualizar el certificado:', error);
    throw error;
  }
};

// Eliminar un certificado, incluidos sus archivos en Storage
export const eliminarCertificado = async (id) => {
  try {
    const certificado = await obtenerCertificadoPorId(id).catch(() => null);
    await eliminarFotosStorage(certificado?.archivos);
    await deleteDoc(doc(db, 'certificados', id));
    return { id };
  } catch (error) {
    console.error('Error al eliminar el certificado:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA MOVIMIENTOS (finanzas: ingresos y gastos manuales) ==========
// Los recibos ya representan el ingreso real cobrado a un cliente, así que no
// se duplican acá: esta colección es solo para gastos y para ingresos que no
// pasan por un recibo (ej. venta suelta, cobro en efectivo sin recibo emitido).

export const crearMovimiento = async (movimientoData) => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const docRef = await addDoc(collection(db, 'movimientos'), {
      ...movimientoData,
      fechaCreacion: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    throw error;
  }
};

export const obtenerMovimientos = async () => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const q = query(collection(db, 'movimientos'), orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    throw error;
  }
};

export const actualizarMovimiento = async (id, datosActualizados) => {
  try {
    const docRef = doc(db, 'movimientos', id);
    await updateDoc(docRef, datosActualizados);
  } catch (error) {
    console.error('Error al actualizar movimiento:', error);
    throw error;
  }
};

export const eliminarMovimiento = async (id) => {
  try {
    await deleteDoc(doc(db, 'movimientos', id));
  } catch (error) {
    console.error('Error al eliminar movimiento:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA CONSULTAS (formulario público de contacto) ==========

// Crear una nueva consulta (usado por el formulario público, sin autenticación)
export const crearConsulta = async (consultaData) => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const docRef = await addDoc(consultasCollection, {
      ...consultaData,
      leida: false,
      fechaCreacion: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error('Error al crear consulta:', error);
    throw error;
  }
};

// Obtener todas las consultas
export const obtenerConsultas = async () => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const q = query(consultasCollection, orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener consultas:', error);
    throw error;
  }
};

// Marcar una consulta como leída o no leída
export const marcarConsultaLeida = async (id, leida = true) => {
  try {
    const docRef = doc(db, 'consultas', id);
    await updateDoc(docRef, { leida });
    return { id };
  } catch (error) {
    console.error('Error al actualizar consulta:', error);
    throw error;
  }
};

// Eliminar una consulta
export const eliminarConsulta = async (id) => {
  try {
    const docRef = doc(db, 'consultas', id);
    await deleteDoc(docRef);
    return { id };
  } catch (error) {
    console.error('Error al eliminar consulta:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA LISTA DE PRECIOS (catálogo de items) ==========

// Crear un item del catálogo
export const crearItemPrecio = async (itemData) => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const docRef = await addDoc(listaPreciosCollection, {
      ...itemData,
      fechaCreacion: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error('Error al crear item de la lista de precios:', error);
    throw error;
  }
};

// Obtener todos los items del catálogo, ordenados alfabéticamente
export const obtenerListaPrecios = async () => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const q = query(listaPreciosCollection, orderBy('descripcion', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener la lista de precios:', error);
    throw error;
  }
};

// Actualizar un item del catálogo
export const actualizarItemPrecio = async (id, datosActualizados) => {
  try {
    const docRef = doc(db, 'listaPrecios', id);
    await updateDoc(docRef, {
      ...datosActualizados,
      fechaActualizacion: serverTimestamp()
    });
    return { id };
  } catch (error) {
    console.error('Error al actualizar item de la lista de precios:', error);
    throw error;
  }
};

// Eliminar un item del catálogo
export const eliminarItemPrecio = async (id) => {
  try {
    const docRef = doc(db, 'listaPrecios', id);
    await deleteDoc(docRef);
    return { id };
  } catch (error) {
    console.error('Error al eliminar item de la lista de precios:', error);
    throw error;
  }
};

// Contar las consultas no leídas (para el badge del panel admin)
export const contarConsultasNoLeidas = async () => {
  try {
    if (!db) return 0;
    const q = query(consultasCollection, where('leida', '==', false));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error al contar consultas no leídas:', error);
    return 0;
  }
};

// ========== FUNCIONES PARA USUARIOS (clientes, técnicos y admins) ==========
// El id del documento es siempre el UID de Firebase Auth del usuario.

// Crea el documento de usuario al registrarse. Rol fijo en 'Cliente':
// el auto-registro público nunca puede asignarse Admin ni Tecnico (eso lo
// hace un Admin después, desde /admin/usuarios).
// Acepta una instancia de Firestore opcional: cuando un Admin da de alta un
// usuario desde el panel, esta escritura se hace autenticado como el usuario
// recién creado (instancia secundaria), porque las reglas exigen
// request.auth.uid == uid para poder crear el documento.
export const crearUsuario = async (uid, datos, dbInstancia = db) => {
  try {
    if (!dbInstancia) throw new Error('Firebase no está configurado');
    const docRef = doc(dbInstancia, 'usuarios', uid);
    await setDoc(docRef, {
      ...datos,
      role: 'Cliente',
      sedes: datos.sedes || [],
      fechaCreacion: serverTimestamp()
    });
    return { id: uid };
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

// Auto-provisiona como Admin una cuenta de Firebase Auth creada manualmente
// antes de que existiera esta colección de roles (ver useStaffAuth.js).
// A diferencia de crearUsuario, acá el rol SÍ se pasa explícito: solo se usa
// para las cuentas históricas permitidas por firestore.rules.
export const crearUsuarioStaffHistorico = async (uid, email) => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const docRef = doc(db, 'usuarios', uid);
    await setDoc(docRef, {
      email,
      role: 'Admin',
      sedes: [],
      fechaCreacion: serverTimestamp()
    });
    return { id: uid };
  } catch (error) {
    console.error('Error al auto-provisionar cuenta histórica:', error);
    throw error;
  }
};

// Obtener el perfil de un usuario por su UID
export const obtenerUsuarioPorId = async (uid) => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const docRef = doc(db, 'usuarios', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

// Obtener todos los usuarios (uso interno del panel admin).
// El SuperAdmin nunca aparece acá: es una sola cuenta identificada por email
// (ver app/lib/superAdmin.js), invisible para el resto del staff.
export const obtenerUsuarios = async () => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const q = query(usuariosCollection, orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(u => !esSuperAdmin(u.email));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

// Obtener solo los usuarios con rol Cliente (para el selector de cliente + sede en documentos)
export const obtenerClientes = async () => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const q = query(usuariosCollection, where('role', '==', 'Cliente'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw error;
  }
};

// Actualizar datos de un usuario (perfil, sedes, o rol desde /admin/usuarios)
export const actualizarUsuario = async (uid, datosActualizados) => {
  try {
    const docRef = doc(db, 'usuarios', uid);
    await updateDoc(docRef, {
      ...datosActualizados,
      fechaActualizacion: serverTimestamp()
    });
    return { id: uid };
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

// Elimina el perfil de un usuario (solo Admin, ver firestore.rules).
// Nota: esto borra únicamente el documento de Firestore. La cuenta de
// Firebase Auth asociada no se elimina (no hay Admin SDK/Cloud Function en
// este proyecto para hacerlo desde el cliente), por lo que la persona
// conservaría sus credenciales de acceso aunque pierda el perfil/rol.
export const eliminarUsuario = async (uid) => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    await deleteDoc(doc(db, 'usuarios', uid));
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

// ========== DOCUMENTOS DE UN CLIENTE (portal /cuenta) ==========

const obtenerColeccionPorCliente = async (nombreColeccion, clienteId) => {
  if (!db) throw new Error('Firebase no está configurado');
  const q = query(collection(db, nombreColeccion), where('clienteId', '==', clienteId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const obtenerPresupuestosPorCliente = (clienteId) => obtenerColeccionPorCliente('presupuestos', clienteId);
export const obtenerRemitosPorCliente = (clienteId) => obtenerColeccionPorCliente('remitos', clienteId);
export const obtenerRecibosPorCliente = (clienteId) => obtenerColeccionPorCliente('recibos', clienteId);
export const obtenerOrdenesTrabajoPorCliente = (clienteId) => obtenerColeccionPorCliente('ordenesTrabajo', clienteId);
export const obtenerFacturasPorCliente = (clienteId) => obtenerColeccionPorCliente('facturas', clienteId);
export const obtenerCertificadosPorCliente = (clienteId) => obtenerColeccionPorCliente('certificados', clienteId);
export const obtenerEstadosPorCliente = (clienteId) => obtenerColeccionPorCliente('estados', clienteId);
export const obtenerDocumentosPorCliente = (clienteId) => obtenerColeccionPorCliente('documentos', clienteId);

// ========== SUSCRIPCIÓN DE LA APP (solo lectura para Admin, edición solo SuperAdmin) ==========
// Doc único config/suscripcion. Si no existe todavía, se devuelven valores
// por defecto que dejan la app habilitada (nunca bloquear por falta de dato).

const SUSCRIPCION_DEFAULT = {
  monto: 0,
  moneda: 'ARS',
  fechaVencimiento: null,
  appHabilitada: true,
  mercadoPago: null
};

export const obtenerConfigSuscripcion = async () => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const docSnap = await getDoc(doc(db, 'config', 'suscripcion'));
    if (!docSnap.exists()) return { ...SUSCRIPCION_DEFAULT };
    return { ...SUSCRIPCION_DEFAULT, ...docSnap.data() };
  } catch (error) {
    console.error('Error al obtener la configuración de suscripción:', error);
    throw error;
  }
};

export const actualizarConfigSuscripcion = async (datosActualizados) => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    await setDoc(doc(db, 'config', 'suscripcion'), {
      ...datosActualizados,
      actualizadoEn: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error al actualizar la configuración de suscripción:', error);
    throw error;
  }
};