// app/lib/offlineQueue.js
// Helper para gestionar la cola de operaciones offline en IndexedDB

const DB_NAME = 'aas-security-offline';
const STORE_NAME = 'queue';
const DB_VERSION = 1;

function abrirDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            e.target.result.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Agrega una operación a la cola offline.
 * @param {{ url: string, method: string, body: object }} operacion
 */
export async function encolarOperacion(operacion) {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const req = tx.objectStore(STORE_NAME).add({
            ...operacion,
            timestamp: Date.now(),
        });
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Registra un Background Sync para procesar la cola cuando haya conexión.
 */
export async function registrarSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const reg = await navigator.serviceWorker.ready;
        await reg.sync.register('aas-security-offline-queue');
    }
}

/**
 * Devuelve true si el navegador está offline.
 */
export function estaOffline() {
    return typeof navigator !== 'undefined' && !navigator.onLine;
}
