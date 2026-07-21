import Link from 'next/link';
import { Shield, ArrowLeft, Check } from 'lucide-react';

export default function ServicioSeguridad() {
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
            <Shield size={32} className="mr-3" />
            <h1 className="text-3xl font-montserrat font-bold">Seguridad</h1>
          </div>
          <p className="text-xl max-w-2xl">
            Sistemas de seguridad y vigilancia profesionales para proteger sus instalaciones,
            bienes y personas en todo momento.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">
              Soluciones integrales de seguridad
            </h2>
            <p className="text-gray-600 mb-6">
              En SINCORP ofrecemos sistemas de seguridad y vigilancia de alta tecnología, 
              diseñados para proporcionar protección efectiva a hogares, comercios e industrias. 
              Nuestras soluciones se adaptan a las necesidades específicas de cada cliente, 
              garantizando la máxima protección con las tecnologías más avanzadas del mercado.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Alarmas contra robo e intrusión
            </h3>
            <p className="text-gray-600 mb-6">
              Instalamos sistemas de alarma de última generación que detectan cualquier 
              intento de intrusión y alertan inmediatamente a los propietarios o al centro 
              de monitoreo. Trabajamos con detectores de movimiento, sensores para puertas 
              y ventanas, detectores de rotura de cristal y más, configurando cada sistema 
              según las necesidades específicas de seguridad.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Cámaras de vigilancia y CCTV
            </h3>
            <p className="text-gray-600 mb-6">
              Diseñamos e implementamos sistemas de videovigilancia con cámaras de alta 
              definición, que permiten monitorear en tiempo real y grabar las actividades 
              tanto del interior como del exterior de las instalaciones. Ofrecemos soluciones 
              IP, analógicas y sistemas híbridos, con opciones de almacenamiento local o en 
              la nube y acceso remoto desde dispositivos móviles.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Controles de acceso
            </h3>
            <p className="text-gray-600 mb-6">
              Nuestros sistemas de control de acceso permiten gestionar quién, cuándo y dónde 
              puede acceder a determinadas áreas de sus instalaciones. Trabajamos con diversas 
              tecnologías como tarjetas de proximidad, códigos PIN, lectura biométrica y 
              soluciones por aplicación móvil, adaptándonos a las necesidades de seguridad 
              y comodidad de cada cliente.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Monitoreo remoto y sistemas integrados
            </h3>
            <p className="text-gray-600 mb-6">
              Ofrecemos soluciones de monitoreo remoto que permiten vigilar sus instalaciones 
              desde cualquier lugar a través de dispositivos móviles. Además, integramos 
              todos los sistemas de seguridad (alarmas, cámaras, controles de acceso) en 
              una única plataforma fácil de gestionar, proporcionando una solución completa 
              y coherente para todas sus necesidades de seguridad.
            </p>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-montserrat font-bold mb-4 text-primary">
                Ventajas de nuestros sistemas de seguridad
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Protección 24/7 de sus instalaciones</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Disuasión efectiva contra intrusos</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Respuesta rápida ante incidentes</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Evidencia visual en caso de siniestros</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Control total desde dispositivos móviles</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Integración con otros sistemas</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Soporte técnico especializado</span>
                </li>
              </ul>

              <div className="mt-8 bg-primary/10 p-6 rounded-lg">
                <h3 className="text-lg font-montserrat font-bold mb-3 text-primary">
                  ¿Necesita mejorar la seguridad de su hogar o negocio?
                </h3>
                <p className="text-gray-600 mb-4">
                  Contáctenos para una evaluación personalizada y un presupuesto sin compromiso.
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