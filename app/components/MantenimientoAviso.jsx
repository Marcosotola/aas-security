// app/components/MantenimientoAviso.jsx
// Mensaje de "sitio en mantenimiento" para visitantes anónimos (ver
// app/mantenimiento/page.js) y para roles de staff sin permiso para pagar
// (Técnico u otro rol no-Admin, ver app/admin/layout.js). Sin enlaces al
// panel: no tiene sentido publicitar esa ruta a quien no puede regularizar
// el pago. El Admin entra por /admin como siempre y ve el modal de
// MercadoPago (ver AdminHeader); el SuperAdmin no pasa por acá.
import { Wrench } from 'lucide-react';

export default function MantenimientoAviso() {
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
      </div>
    </div>
  );
}
