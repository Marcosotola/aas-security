// Service Worker AAS Security PWA - con soporte offline
const CACHE_NAME = 'aas-security-v3';
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/logo/logo.png',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

// ─── INSTALL ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// ─── ACTIVATE ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// ─── FETCH ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Solo manejar requests del mismo origen
    if (!request.url.startsWith(self.location.origin)) return;

    // Assets estáticos y páginas → Cache-first (funciona offline)
    const isStatic =
        request.destination === 'image' ||
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'font' ||
        request.url.includes('/_next/static/');

    if (isStatic) {
        event.respondWith(
            caches.match(request).then((cached) => {
                return cached || fetch(request).then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // APIs y Firebase → network-first, sin cache
    if (
        request.url.includes('/api/') ||
        request.url.includes('firestore') ||
        request.url.includes('googleapis')
    ) {
        return;
    }

    // Rutas /admin y respuestas de la pantalla de mantenimiento → nunca
    // cachear: /admin siempre necesita datos frescos (sesión, suscripción) y
    // una respuesta marcada x-mantenimiento no debe quedar servible offline
    // una vez que el sitio se vuelve a habilitar.
    const esAdmin = new URL(request.url).pathname.startsWith('/admin');

    // Páginas de navegación → network-first con fallback a cache
    event.respondWith(
        fetch(request)
            .then((response) => {
                const esMantenimiento = response.headers.get('x-mantenimiento') === '1';
                if (response.ok && !esAdmin && !esMantenimiento) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                } else if (esMantenimiento) {
                    caches.open(CACHE_NAME).then((cache) => cache.delete(request));
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});

// ─── BACKGROUND SYNC ────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
    if (event.tag === 'aas-security-offline-queue') {
        event.waitUntil(procesarColaOffline());
    }
});

async function procesarColaOffline() {
    // Abrir la base de datos IndexedDB
    const db = await abrirDB();
    const pendientes = await obtenerPendientes(db);

    for (const item of pendientes) {
        try {
            const response = await fetch(item.url, {
                method: item.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.body),
            });

            if (response.ok) {
                await eliminarPendiente(db, item.id);
                // Notificar al cliente
                const clients = await self.clients.matchAll();
                clients.forEach((client) =>
                    client.postMessage({ type: 'SYNC_COMPLETE', id: item.id })
                );
            }
        } catch (err) {
            console.log('[SW] Error al sincronizar pendiente:', err);
        }
    }
}

// ─── INDEXEDDB HELPERS ──────────────────────────────────────────────────────
function abrirDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('aas-security-offline', 1);
        req.onupgradeneeded = (e) => {
            e.target.result.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
    });
}

function obtenerPendientes(db) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('queue', 'readonly');
        const req = tx.objectStore('queue').getAll();
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
    });
}

function eliminarPendiente(db, id) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('queue', 'readwrite');
        const req = tx.objectStore('queue').delete(id);
        req.onsuccess = () => resolve();
        req.onerror = (e) => reject(e.target.error);
    });
}
