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
import { db } from './firebase';

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

// Obtener todos los usuarios (uso interno del panel admin)
export const obtenerUsuarios = async () => {
  try {
    if (!db) throw new Error('Firebase no está configurado');
    const q = query(usuariosCollection, orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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