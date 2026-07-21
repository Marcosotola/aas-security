'use client';
import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(false);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        // Estado inicial
        setIsOffline(!navigator.onLine);

        const handleOffline = () => {
            setIsOffline(true);
            setShowReconnected(false);
        };

        const handleOnline = () => {
            setIsOffline(false);
            setShowReconnected(true);
            // Ocultar el mensaje de "reconectado" después de 3 segundos
            setTimeout(() => setShowReconnected(false), 3000);
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    if (!isOffline && !showReconnected) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '999px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                fontFamily: 'inherit',
                fontSize: '13px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                animation: 'slideDown 0.3s ease',
                background: isOffline ? '#1f2937' : '#16a34a',
                color: '#fff',
            }}
        >
            <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
            {isOffline ? (
                <>
                    <WifiOff size={15} />
                    Sin conexión – los cambios se sincronizarán al reconectarse
                </>
            ) : (
                <>
                    <Wifi size={15} />
                    Conexión restaurada ✓
                </>
            )}
        </div>
    );
}
