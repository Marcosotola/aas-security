import Link from 'next/link';
import Image from 'next/image';
import { Flame, ArrowLeft, Check } from 'lucide-react';

export default function ServicioIncendios() {
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
            <Flame size={32} className="mr-3" />
            <h1 className="text-3xl font-montserrat font-bold">Detección y extinción de incendios</h1>
          </div>
          <p className="text-xl max-w-2xl">
            Diseño, instalación y mantenimiento de sistemas contra incendio para proteger vidas,
            bienes e instalaciones, cumpliendo con la normativa vigente.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">
              Protección integral contra incendios
            </h2>
            <p className="text-gray-600 mb-6">
              Es nuestra principal especialidad. En AAS Security proyectamos e instalamos sistemas
              de detección y extinción de incendios para hogares, comercios, industrias, edificios
              y consorcios, con equipamiento certificado y personal técnico capacitado en normativa
              de bomberos y seguridad e higiene.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Sistemas de detección
            </h3>
            <p className="text-gray-600 mb-6">
              Instalamos centrales de incendio direccionables y convencionales, detectores de humo,
              de calor y de llama, y pulsadores manuales de alarma. Cada proyecto se diseña según
              el tipo de riesgo y la superficie a proteger, garantizando una detección temprana que
              permite actuar antes de que el foco se propague.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="relative h-48 overflow-hidden rounded-lg">
                <Image src="/pages/detector-humo.jpeg" alt="Detector de humo" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
              </div>
              <div className="relative h-48 overflow-hidden rounded-lg">
                <Image src="/pages/dispositivos-deteccion-incendios.jpeg" alt="Dispositivos de detección de incendios" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
              </div>
            </div>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Sistemas de extinción
            </h3>
            <p className="text-gray-600 mb-6">
              Implementamos extinción por agentes limpios y gases nobles para salas de servidores,
              tableros eléctricos y áreas críticas, además de rociadores automáticos (sprinklers) y
              redes de incendio para plantas industriales y edificios de gran superficie.
            </p>
            <div className="relative h-64 w-full overflow-hidden rounded-lg mb-6">
              <Image src="/pages/baterias-co2-extincion.jpeg" alt="Baterías de CO2 para extinción" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" />
            </div>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Alarma y evacuación
            </h3>
            <p className="text-gray-600 mb-6">
              Integramos sirenas, balizas lumínicas y audio evacuación para alertar de forma
              inmediata a todos los ocupantes, junto con señalización de vías de escape y salidas
              de emergencia conforme a normativa municipal y provincial.
            </p>
            <div className="relative h-64 w-full overflow-hidden rounded-lg mb-6">
              <Image src="/pages/circuito-deteccion-incendios.jpeg" alt="Circuito de detección de incendios" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" />
            </div>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Inspección, mantenimiento y certificación
            </h3>
            <p className="text-gray-600 mb-6">
              Realizamos mantenimiento preventivo y correctivo de todos los sistemas instalados, con
              informes técnicos y certificados que respaldan la habilitación del inmueble ante
              bomberos, aseguradoras y organismos de control.
            </p>
            <div className="relative h-64 w-full overflow-hidden rounded-lg mb-6">
              <Image src="/pages/paneles-incendio.jpeg" alt="Paneles de incendio" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-montserrat font-bold mb-4 text-primary">
                Por qué es clave contar con estos sistemas
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Detección temprana que reduce daños materiales</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Protección de vidas y evacuación segura</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Cumplimiento normativo ante bomberos y seguros</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Certificaciones y documentación técnica al día</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Mantenimiento programado y soporte permanente</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Diseño a medida según el nivel de riesgo</span>
                </li>
              </ul>

              <div className="mt-8 bg-primary/10 p-6 rounded-lg">
                <h3 className="text-lg font-montserrat font-bold mb-3 text-primary">
                  ¿Su inmueble está protegido contra incendios?
                </h3>
                <p className="text-gray-600 mb-4">
                  Solicite una inspección técnica y le proponemos el sistema adecuado para su caso.
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
