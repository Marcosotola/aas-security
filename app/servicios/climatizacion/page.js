import Link from 'next/link';
import { Thermometer, ArrowLeft, Check } from 'lucide-react';

export default function ServicioClimatizacion() {
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
            <Thermometer size={32} className="mr-3" />
            <h1 className="text-3xl font-montserrat font-bold">Climatización</h1>
          </div>
          <p className="text-xl max-w-2xl">
            Soluciones de climatización para ambientes industriales, comerciales y residenciales,
            garantizando confort y eficiencia energética.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">
              Soluciones integrales de climatización
            </h2>
            <p className="text-gray-600 mb-6">
              En SINCORP ofrecemos servicios completos de climatización, diseñados para 
              proporcionar el máximo confort y eficiencia energética en cualquier tipo de 
              ambiente. Trabajamos con las mejores marcas del mercado y nuestros técnicos 
              están constantemente actualizados en las últimas tecnologías del sector.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Instalación de sistemas de aire acondicionado
            </h3>
            <p className="text-gray-600 mb-6">
              Realizamos instalaciones profesionales de sistemas de aire acondicionado 
              para todo tipo de espacios. Desde equipos split y multi-split para pequeñas 
              oficinas, hasta sistemas centralizados para grandes superficies comerciales 
              e industriales. Cada instalación es planificada cuidadosamente para garantizar 
              un funcionamiento óptimo y eficiente.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Mantenimiento preventivo y correctivo
            </h3>
            <p className="text-gray-600 mb-6">
              Ofrecemos planes de mantenimiento preventivo que alargan la vida útil de sus 
              equipos y garantizan su funcionamiento eficiente. También proporcionamos servicios 
              de reparación rápida y efectiva cuando surge cualquier tipo de avería, minimizando 
              el tiempo de inactividad y las molestias.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Sistemas de ventilación industrial
            </h3>
            <p className="text-gray-600 mb-6">
              Diseñamos e implementamos sistemas de ventilación industrial que aseguran la 
              calidad del aire y cumplen con las normativas de seguridad y salud laboral. 
              Estos sistemas permiten la renovación constante del aire, la extracción de 
              contaminantes y el control de temperatura y humedad en espacios industriales.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Soluciones de climatización eficientes
            </h3>
            <p className="text-gray-600 mb-6">
              Apostamos por soluciones de climatización que combinan confort con eficiencia 
              energética. Trabajamos con tecnologías Inverter, sistemas de recuperación de 
              calor, zonificación de espacios y automatización de las instalaciones para 
              reducir el consumo energético sin sacrificar el confort.
            </p>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-montserrat font-bold mb-4 text-primary">
                Beneficios de nuestros servicios
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Confort térmico en cualquier época del año</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Reducción en el consumo energético</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Mayor vida útil de los equipos</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Mejor calidad del aire interior</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Cumplimiento de normativas ambientales</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Instalaciones realizadas por técnicos certificados</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Respuesta rápida en mantenimientos correctivos</span>
                </li>
              </ul>

              <div className="mt-8 bg-primary/10 p-6 rounded-lg">
                <h3 className="text-lg font-montserrat font-bold mb-3 text-primary">
                  ¿Interesado en nuestros servicios?
                </h3>
                <p className="text-gray-600 mb-4">
                  Solicite un presupuesto sin compromiso y le asesoraremos sobre la mejor solución para su caso.
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
