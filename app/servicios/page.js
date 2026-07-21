import Link from 'next/link';
import { Settings, Zap, Thermometer, Shield, ArrowRight } from 'lucide-react';

export default function Servicios() {
  return (
    <div>
      <div className="bg-primary text-white py-22">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-montserrat font-bold mb-4">Nuestros Servicios</h1>
          <p className="text-xl max-w-2xl">
            Ofrecemos soluciones técnicas profesionales adaptadas a las necesidades de cada cliente.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Automatismo */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary/10 p-6 flex justify-center">
              <Settings size={64} className="text-primary" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-montserrat font-bold mb-4 text-primary">Automatismo</h2>
              <p className="text-gray-600 mb-6">
                Sistemas de control automático para procesos industriales y domésticos. 
                Optimizamos la eficiencia y seguridad de sus instalaciones con soluciones 
                de automatización personalizadas.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Instalación de sistemas de control industrial</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Automatización de procesos productivos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Programación de PLC y sistemas SCADA</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Domótica y sistemas inteligentes</span>
                </li>
              </ul>
              <Link 
                href="/servicios/automatismo" 
                className="inline-flex items-center text-primary font-medium hover:underline"
              >
                Más información
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>

          {/* Electricidad */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary/10 p-6 flex justify-center">
              <Zap size={64} className="text-primary" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-montserrat font-bold mb-4 text-primary">Electricidad</h2>
              <p className="text-gray-600 mb-6">
                Instalaciones eléctricas profesionales, mantenimiento preventivo
                y correctivo. Cumplimos con todas las normativas de seguridad
                vigentes para garantizar instalaciones confiables.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Instalaciones eléctricas industriales y comerciales</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Mantenimiento preventivo y correctivo</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Tableros eléctricos y centros de control</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Sistemas de iluminación eficiente</span>
                </li>
              </ul>
              <Link 
                href="/servicios/electricidad" 
                className="inline-flex items-center text-primary font-medium hover:underline"
              >
                Más información
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>

          {/* Climatización */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary/10 p-6 flex justify-center">
              <Thermometer size={64} className="text-primary" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-montserrat font-bold mb-4 text-primary">Climatización</h2>
              <p className="text-gray-600 mb-6">
                Soluciones de climatización para ambientes industriales y comerciales.
                Instalación, mantenimiento y reparación de equipos de aire acondicionado
                y sistemas de ventilación.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Instalación de sistemas de aire acondicionado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Mantenimiento preventivo y correctivo</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Sistemas de ventilación industrial</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Soluciones de climatización eficientes</span>
                </li>
              </ul>
              <Link 
                href="/servicios/climatizacion" 
                className="inline-flex items-center text-primary font-medium hover:underline"
              >
                Más información
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>

          {/* Seguridad - NUEVO */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary/10 p-6 flex justify-center">
              <Shield size={64} className="text-primary" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-montserrat font-bold mb-4 text-primary">Seguridad</h2>
              <p className="text-gray-600 mb-6">
                Instalación de sistemas de seguridad y vigilancia para hogares, comercios 
                e industrias. Proteja sus instalaciones con soluciones profesionales 
                adaptadas a sus necesidades.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Alarmas contra robo e intrusión</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Cámaras de vigilancia y CCTV</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Controles de acceso</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Monitoreo remoto y sistemas integrados</span>
                </li>
              </ul>
              <Link 
                href="/servicios/seguridad" 
                className="inline-flex items-center text-primary font-medium hover:underline"
              >
                Más información
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">
            ¿Necesita un servicio personalizado?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Contáctenos para hablar sobre sus necesidades específicas.
            Ofrecemos soluciones a medida para cada cliente.
          </p>
          <Link 
            href="/contacto" 
            className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary-light transition-colors"
          >
            Solicitar presupuesto
          </Link>
        </div>
      </div>
    </div>
  );
}