import Link from 'next/link';
import { Zap, ArrowLeft, Check } from 'lucide-react';

export default function ServicioElectricidad() {
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
            <Zap size={32} className="mr-3" />
            <h1 className="text-3xl font-montserrat font-bold">Electricidad</h1>
          </div>
          <p className="text-xl max-w-2xl">
            Instalaciones eléctricas profesionales, mantenimiento preventivo y correctivo
            para todo tipo de edificaciones e industrias.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">
              Servicios eléctricos profesionales
            </h2>
            <p className="text-gray-600 mb-6">
              En SINCORP brindamos servicios eléctricos de alta calidad para empresas, 
              industrias y comercios. Nuestro equipo de profesionales certificados 
              garantiza instalaciones seguras y eficientes, cumpliendo con todas las 
              normativas vigentes y utilizando materiales de primera calidad.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Instalaciones eléctricas industriales y comerciales
            </h3>
            <p className="text-gray-600 mb-6">
              Diseñamos e implementamos instalaciones eléctricas completas para entornos 
              industriales y comerciales, desde la acometida principal hasta la distribución 
              final. Nuestros sistemas están diseñados para soportar las demandas específicas 
              de cada sector, garantizando seguridad, eficiencia y capacidad de expansión futura.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Mantenimiento preventivo y correctivo
            </h3>
            <p className="text-gray-600 mb-6">
              Ofrecemos programas de mantenimiento preventivo para detectar y solucionar 
              posibles problemas antes de que afecten su operación. También respondemos 
              rápidamente a emergencias eléctricas, proporcionando soluciones efectivas 
              para minimizar tiempos de inactividad y prevenir daños mayores.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Tableros eléctricos y centros de control
            </h3>
            <p className="text-gray-600 mb-6">
              Diseñamos, fabricamos e instalamos tableros eléctricos a medida, desde 
              pequeños tableros de distribución hasta complejos centros de control de 
              motores (CCM). Cada tablero cumple con los más altos estándares de calidad 
              y seguridad, incluyendo protecciones adecuadas y sistemas de monitoreo.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Sistemas de iluminación eficiente
            </h3>
            <p className="text-gray-600 mb-6">
              Implementamos soluciones de iluminación eficientes que reducen el consumo 
              energético sin sacrificar la calidad lumínica. Nuestros sistemas incluyen 
              tecnología LED, controles automáticos, sensores de presencia y aprovechamiento 
              de luz natural, adaptados a las necesidades específicas de cada espacio.
            </p>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-montserrat font-bold mb-4 text-primary">
                Ventajas de nuestros servicios eléctricos
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Instalaciones seguras que cumplen normativas</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Reducción del consumo energético</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Prevención de fallas y cortes inesperados</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Materiales y componentes de alta calidad</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Personal técnico certificado</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Respuesta rápida en emergencias</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Asesoramiento técnico especializado</span>
                </li>
              </ul>

              <div className="mt-8 bg-primary/10 p-6 rounded-lg">
                <h3 className="text-lg font-montserrat font-bold mb-3 text-primary">
                  ¿Necesita un servicio eléctrico?
                </h3>
                <p className="text-gray-600 mb-4">
                  Contáctenos para obtener un presupuesto personalizado según sus necesidades.
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