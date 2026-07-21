import Link from 'next/link';
import { Check, Award, Clock, PenTool } from 'lucide-react';

export default function Nosotros() {
  return (
    <div>
      <div className="bg-primary text-white py-22">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-montserrat font-bold mb-4">Sobre Nosotros</h1>
          <p className="text-xl max-w-2xl">
            Somos un equipo de profesionales comprometidos con la excelencia
            en servicios técnicos para empresas e industrias.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">
              Nuestra Historia
            </h2>
            <p className="text-gray-600 mb-4">
              SINCORP nace en 2020 con el objetivo de brindar soluciones técnicas integrales
              a empresas de diversos sectores. Desde entonces, hemos crecido constantemente,
              ampliando nuestra gama de servicios y mejorando nuestras capacidades técnicas.
            </p>
            <p className="text-gray-600 mb-4">
              Fundada por un técnico especializado con más de 15 años de experiencia en el sector,
              nuestra empresa se ha consolidado como un referente en servicios de automatismo,
              electricidad y climatización, ofreciendo soluciones personalizadas y de alta calidad.
            </p>
            <p className="text-gray-600">
              Hoy, SINCORP trabaja con clientes de diversos tamaños, desde pequeñas empresas hasta
              grandes corporaciones, manteniendo siempre el mismo nivel de compromiso y profesionalismo
              en cada proyecto que emprendemos.
            </p>

            <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary mt-12">
              Nuestros Valores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Award className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Excelencia</h3>
                  <p className="text-gray-600">Buscamos la perfección en cada trabajo</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Check className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Compromiso</h3>
                  <p className="text-gray-600">Cumplimos con lo prometido</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <PenTool className="text-primary" size={20} />

                </div>
                <div>
                  <h3 className="font-bold">Profesionalismo</h3>
                  <p className="text-gray-600">Aplicamos los más altos estándares</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Clock className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Puntualidad</h3>
                  <p className="text-gray-600">Respetamos el tiempo de nuestros clientes</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">
              ¿Por qué elegirnos?
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start bg-gray-50 p-4 rounded-lg">
                <Check size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Experiencia comprobada</h3>
                  <p className="text-gray-600">
                    Más de 15 años de experiencia en el sector nos respaldan, 
                    habiendo trabajado con empresas de diversos tamaños y sectores.
                  </p>
                </div>
              </li>
              <li className="flex items-start bg-gray-50 p-4 rounded-lg">
                <Check size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Soluciones personalizadas</h3>
                  <p className="text-gray-600">
                    Entendemos que cada cliente tiene necesidades únicas, por eso 
                    adaptamos nuestros servicios a sus requerimientos específicos.
                  </p>
                </div>
              </li>
              <li className="flex items-start bg-gray-50 p-4 rounded-lg">
                <Check size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Servicio integral</h3>
                  <p className="text-gray-600">
                    Ofrecemos soluciones completas que abarcan desde el diseño hasta 
                    la implementación y mantenimiento de sistemas.
                  </p>
                </div>
              </li>
              <li className="flex items-start bg-gray-50 p-4 rounded-lg">
                <Check size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Atención al detalle</h3>
                  <p className="text-gray-600">
                    Cuidamos cada aspecto de nuestro trabajo, asegurando resultados 
                    impecables y duraderos en todos nuestros proyectos.
                  </p>
                </div>
              </li>
              <li className="flex items-start bg-gray-50 p-4 rounded-lg">
                <Check size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Soporte post-venta</h3>
                  <p className="text-gray-600">
                    No desaparecemos después de finalizar un proyecto. Estamos 
                    disponibles para brindar soporte técnico cuando lo necesite.
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-8 bg-primary/10 p-6 rounded-lg">
              <h3 className="text-lg font-montserrat font-bold mb-3 text-primary">
                ¿Listo para trabajar con nosotros?
              </h3>
              <p className="text-gray-600 mb-4">
                Póngase en contacto para discutir cómo podemos ayudarle con sus necesidades técnicas.
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