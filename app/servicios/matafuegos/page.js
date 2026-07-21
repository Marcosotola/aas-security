import Link from 'next/link';
import { FireExtinguisher, ArrowLeft, Check } from 'lucide-react';

export default function ServicioMatafuegos() {
  return (
    <div>
      <div className="bg-primary text-white py-22">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-4">
            <Link href="/servicios" className="text-white/80 hover:text-white flex items-center">
              <ArrowLeft size={16} className="mr-1" /> Volver a servicios
            </Link>
          </div>
          <div className="flex items-center mb-4">
            <FireExtinguisher size={32} className="mr-3" />
            <h1 className="text-3xl font-montserrat font-bold">Matafuegos</h1>
          </div>
          <p className="text-xl max-w-2xl">
            Venta, recarga, inspección y mantenimiento de matafuegos con certificación vigente,
            para que su extintor esté listo cuando lo necesite.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">
              Todo lo que necesita en materia de matafuegos
            </h2>
            <p className="text-gray-600 mb-6">
              Un matafuegos vencido, mal ubicado o sin mantenimiento no cumple su función. En AAS
              Security nos ocupamos de todo el ciclo: venta, instalación, recarga, inspección y
              control de vencimientos, para hogares, comercios, empresas, industrias y consorcios.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Venta e instalación
            </h3>
            <p className="text-gray-600 mb-6">
              Asesoramos sobre el tipo y la cantidad de matafuegos según la actividad y la
              superficie a proteger: polvo químico ABC, dióxido de carbono (CO2), agua, espuma y
              agentes limpios. Instalamos soportes y señalización reglamentaria en cada punto.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Recarga y mantenimiento
            </h3>
            <p className="text-gray-600 mb-6">
              Realizamos la recarga y el mantenimiento periódico según la normativa IRAM 3542,
              incluyendo prueba hidráulica cuando corresponde, para garantizar que cada equipo
              funcione correctamente en caso de emergencia.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Inspección y control de vencimientos
            </h3>
            <p className="text-gray-600 mb-6">
              Llevamos un registro de todos los matafuegos instalados en su propiedad y le
              avisamos con anticipación cuando se acerca la fecha de recarga o vencimiento, para
              que nunca quede sin protección ni en falta ante una inspección.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Service a domicilio para empresas y consorcios
            </h3>
            <p className="text-gray-600 mb-6">
              Coordinamos visitas periódicas de mantenimiento en el lugar, minimizando la
              interrupción de la actividad diaria y entregando la documentación y certificados
              correspondientes tras cada intervención.
            </p>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-montserrat font-bold mb-4 text-primary">
                Ventajas de nuestro servicio
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Matafuegos siempre operativos y en fecha</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Certificación según norma IRAM 3542</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Aviso automático de vencimientos</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Asesoramiento sobre tipo y cantidad necesaria</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Service a domicilio sin interrumpir su actividad</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Documentación lista para inspecciones y seguros</span>
                </li>
              </ul>

              <div className="mt-8 bg-primary/10 p-6 rounded-lg">
                <h3 className="text-lg font-montserrat font-bold mb-3 text-primary">
                  ¿Sus matafuegos están vencidos o quiere instalar nuevos?
                </h3>
                <p className="text-gray-600 mb-4">
                  Contáctenos y coordinamos una visita para revisar su instalación actual.
                </p>
                <Link
                  href="/contacto"
                  className="w-full block text-center bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-light transition-colors"
                >
                  Solicitar presupuesto
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
