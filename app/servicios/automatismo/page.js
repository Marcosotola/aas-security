import Link from 'next/link';
import { Settings, ArrowLeft, Check } from 'lucide-react';

export default function ServicioAutomatismo() {
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
            <Settings size={32} className="mr-3" />
            <h1 className="text-3xl font-montserrat font-bold">Automatismo</h1>
          </div>
          <p className="text-xl max-w-2xl">
            Sistemas de control automático para procesos industriales y domésticos. 
            Optimizamos la eficiencia y seguridad de sus instalaciones.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">
              Nuestras soluciones de automatización
            </h2>
            <p className="text-gray-600 mb-6">
              En SINCORP ofrecemos servicios integrales de automatización industrial y 
              doméstica, diseñados para mejorar la eficiencia, reducir costos operativos 
              y aumentar la seguridad de sus procesos. Nuestro equipo técnico altamente 
              capacitado trabaja con las últimas tecnologías para implementar soluciones 
              a medida según las necesidades específicas de cada cliente.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Sistemas de control industrial
            </h3>
            <p className="text-gray-600 mb-6">
              Implementamos sistemas de control para procesos industriales que permiten 
              supervisar y gestionar la producción de manera eficiente y segura. 
              Trabajamos con las principales marcas del mercado y adaptamos cada solución 
              a las necesidades específicas de su industria.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Automatización de procesos productivos
            </h3>
            <p className="text-gray-600 mb-6">
              Automatizamos líneas de producción completas o procesos específicos, 
              mejorando la productividad y reduciendo errores humanos. Nuestras soluciones 
              incluyen sistemas de transporte, dosificación, empaque y paletizado, entre otros.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Programación de PLC y sistemas SCADA
            </h3>
            <p className="text-gray-600 mb-6">
              Desarrollamos programación para controladores lógicos programables (PLC) y 
              sistemas de supervisión, control y adquisición de datos (SCADA), que permiten 
              monitorear y controlar sus procesos en tiempo real y desde cualquier ubicación.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Domótica y sistemas inteligentes
            </h3>
            <p className="text-gray-600 mb-6">
              Implementamos soluciones de automatización para edificios comerciales y 
              residenciales, incluyendo control de iluminación, climatización, accesos 
              y seguridad, todo integrado en sistemas fáciles de usar que mejoran 
              la eficiencia energética y el confort.
            </p>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-montserrat font-bold mb-4 text-primary">
                Beneficios de nuestros sistemas
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Mayor eficiencia en los procesos productivos</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Reducción de costos operativos</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Disminución de errores humanos</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Mayor control y trazabilidad</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Integración con sistemas existentes</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Interfaces intuitivas y fáciles de usar</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Soporte técnico especializado</span>
                </li>
              </ul>

              <div className="mt-8 bg-primary/10 p-6 rounded-lg">
                <h3 className="text-lg font-montserrat font-bold mb-3 text-primary">
                  ¿Interesado en nuestros servicios?
                </h3>
                <p className="text-gray-600 mb-4">
                  Solicite un presupuesto sin compromiso y un asesor se pondrá en contacto con usted.
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