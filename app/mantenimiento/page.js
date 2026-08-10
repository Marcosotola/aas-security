// app/mantenimiento/page.js
import Link from 'next/link';
import { Wrench } from 'lucide-react';

export const metadata = {
  title: 'Sitio en mantenimiento | AAS Security',
};

export default function Mantenimiento() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="max-w-md text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10">
          <Wrench size={32} className="text-primary" />
        </div>
        <h1 className="mb-3 text-2xl font-bold font-montserrat text-primary">
          Sitio en mantenimiento
        </h1>
        <p className="text-gray-600">
          Estamos realizando tareas de mantenimiento. Volvé a intentarlo en un rato.
          Si necesitás contactarnos con urgencia, escribinos por WhatsApp.
        </p>
        <Link href="/admin" className="inline-block mt-6 text-sm text-primary hover:underline">
          Ingresar al panel de administración
        </Link>
      </div>
    </div>
  );
}
