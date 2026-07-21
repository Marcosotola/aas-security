// lib/firestore.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Colecciones
const presupuestosCollection = collection(db, 'presupuestos');
const estadosCollection = collection(db, 'estados');
const remitosCollection = collection(db, 'remitos');

// ========== FUNCIONES PARA PRESUPUESTOS ==========

// Crear un nuevo presupuesto
export const crearPresupuesto = async (presupuestoData) => {
  try {
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