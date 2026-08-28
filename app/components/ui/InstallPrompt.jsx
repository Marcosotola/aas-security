'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
    const pathname = usePathname();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Solo mostrar en Android (beforeinstallprompt solo lo dispara Chrome en Android)
        const isAndroid = /android/i.test(navigator.userAgent);
        if (!isAndroid) return;

        // No mostrar si ya fue descartado anteriormente
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) return;

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Pequeño delay para no aparecer inmediatamente al entrar
            setTimeout(() => setShowBanner(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowBanner(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    // En /admin ese lugar ya lo ocupa la barra inferior del panel (ver
    // AdminHeader.jsx); mismo criterio que WhatsAppBadge.
    if (!showBanner || pathname?.startsWith('/admin')) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                width: 'calc(100% - 32px)',
                maxWidth: '420px',
                background: 'linear-gradient(135deg, #1A5276 0%, #2E86C1 100%)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(26, 82, 118, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                animation: 'slideUp 0.4s ease',
            }}
        >
            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

            {/* Ícono */}
            <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '10px',
                padding: '8px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <img src="/logo/logo.png" alt="AAS Security" width={36} height={36} style={{ borderRadius: '6px' }} />
            </div>

            {/* Texto */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: 0 }}>
                    Instalá AAS Security
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>
                    Accedé rápido desde tu pantalla de inicio
                </p>
            </div>

            {/* Botón instalar */}
            <button
                onClick={handleInstall}
                style={{
                    background: '#fff',
                    color: '#1A5276',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                }}
            >
                <Download size={14} />
                Instalar
            </button>

            {/* Botón cerrar */}
            <button
                onClick={handleDismiss}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    padding: '4px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                }}
                aria-label="Cerrar"
            >
                <X size={18} />
            </button>
        </div>
    );
}
