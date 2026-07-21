import Link from 'next/link';
import { Check, Award, Clock, PenTool } from 'lucide-react';

export default function Nosotros() {
  return (
    <div>
      <div className="bg-primary text-white py-22">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-montserrat font-bold mb-4">Sobre AAS Security</h1>
          <p className="text-xl max-w-2xl">
            Somos especialistas en detección y extinción de incendios, matafuegos y seguridad para consorcios, ofreciendo soluciones confiables para proteger personas, instalaciones y activos.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">
              Nuestra propuesta
            </h2>
            <p className="text-gray-600 mb-4">
              AAS Security nace con un propósito claro: brindar soluciones de protección contra incendios y seguridad de alto nivel para hogares, comercios, industrias y consorcios, con tecnología confiable y atención cercana.
            </p>
            <p className="text-gray-600 mb-4">
              Trabajamos con sistemas de detección y extinción de incendios, matafuegos, mantenimiento para consorcios, alarmas, cámaras, control de acceso y monitoreo remoto, garantizando una respuesta efectiva desde la instalación hasta el mantenimiento.
            </p>
            <p className="text-gray-600">
              Cada proyecto se adapta al entorno del cliente para ofrecer una solución segura, funcional y escalable.
            </p>

            <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary mt-12">
              Nuestros valores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Award className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Excelencia</h3>
                  <p className="text-gray-600">Trabajamos con rigor técnico y calidad en cada proyecto.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Check className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Confianza</h3>
                  <p className="text-gray-600">Diseñamos soluciones que generan tranquilidad y control.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <PenTool className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Profesionalismo</h3>
                  <p className="text-gray-600">Aplicamos estándares altos en cada etapa del servicio.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Clock className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Respuesta</h3>
                  <p className="text-gray-600">Atendemos de forma ágil las necesidades de seguridad de nuestros clientes.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">
              ¿Por qué elegir AAS Security?
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start bg-gray-50 p-4 rounded-lg">
                <Check size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Soluciones integrales</h3>
                  <p className="text-gray-600">Integramos incendio, matafuegos, consorcios, alarmas, cámaras, acceso y monitoreo en un enfoque completo.</p>
                </div>
              </li>
              <li className="flex items-start bg-gray-50 p-4 rounded-lg">
                <Check size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Diseño a medida</h3>
                  <p className="text-gray-600">Adaptamos cada instalación a las características del inmueble y al nivel de protección requerido.</p>
                </div>
              </li>
              <li className="flex items-start bg-gray-50 p-4 rounded-lg">
                <Check size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Instalación y mantenimiento</h3>
                  <p className="text-gray-600">Brindamos soporte técnico continuo para que los sistemas funcionen de manera confiable a largo plazo.</p>
                </div>
              </li>
              <li className="flex items-start bg-gray-50 p-4 rounded-lg">
                <Check size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Atención personalizada</h3>
                  <p className="text-gray-600">Acompañamos a cada cliente desde la evaluación inicial hasta la puesta en marcha y el seguimiento.</p>
                </div>
              </li>
            </ul>

            <div className="mt-8 bg-primary/10 p-6 rounded-lg">
              <h3 className="text-lg font-montserrat font-bold mb-3 text-primary">
                ¿Querés una solución de seguridad a medida?
              </h3>
              <p className="text-gray-600 mb-4">
                Contanos tu necesidad y te ayudamos a encontrar la mejor forma de proteger tu espacio.
              </p>
              <Link 
                href="/contacto" 
                className="w-full block text-center bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-light transition-colors"
              >
                Contactar ahora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}