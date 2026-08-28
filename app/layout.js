import './globals.css';
import ConditionalHeader from './components/layout/ConditionalHeader';
import ConditionalFooter from './components/layout/ConditionalFooter';
import WhatsAppBadge from './components/ui/WhatsAppBadge';
import RegisterSW from './components/ui/RegisterSW';
import InstallPrompt from './components/ui/InstallPrompt';
import OfflineIndicator from './components/ui/OfflineIndicator';

export const metadata = {
  title: 'AAS Security',
  description: 'Sistemas de detección y extinción de incendios, matafuegos y seguridad para consorcios: alarmas, cámaras, control de acceso y monitoreo remoto.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1A5276" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="flex flex-col min-h-screen">
        <ConditionalHeader />
        <main className="flex-grow">
          {children}
        </main>
        <ConditionalFooter />
        <WhatsAppBadge phoneNumber="+5493513112962" />
        <RegisterSW />
        <InstallPrompt />
        <OfflineIndicator />
      </body>
    </html>
  );
}