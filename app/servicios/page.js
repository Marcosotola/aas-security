import Link from 'next/link';
import { Flame, FireExtinguisher, Building2, Shield, Camera, Lock, ArrowRight } from 'lucide-react';

export default function Servicios() {
  return (
    <div>
      <div className="bg-primary text-white py-22">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-montserrat font-bold mb-4">Servicios de AAS Security</h1>
          <p className="text-xl max-w-2xl">
            Especialistas en detección y extinción de incendios, matafuegos y seguridad para
            consorcios, hogares, comercios e industrias.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-montserrat font-bold mb-8 text-primary">
          Protección contra incendios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Link href="/servicios/incendios" className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow md:col-span-2">
            <div className="bg-primary/10 p-6 flex justify-center">
              <Flame size={64} className="text-primary" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-montserrat font-bold mb-4 text-primary">Detección y extinción de incendios</h2>
              <p className="text-gray-600 mb-6">
                Instalación y mantenimiento de centrales y detectores de humo, calor y llama,
                extinción por agentes limpios y gases nobles, sprinklers, alarma y audio evacuación.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Detección temprana de incendios</span></li>
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Señalización y evacuación</span></li>
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Instalación y mantenimiento especializado</span></li>
              </ul>
              <span className="inline-flex items-center text-primary font-medium">
                Ver más <ArrowRight size={16} className="ml-1" />
              </span>
            </div>
          </Link>

          <Link href="/servicios/matafuegos" className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-primary/10 p-6 flex justify-center">
              <FireExtinguisher size={64} className="text-primary" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-montserrat font-bold mb-4 text-primary">Matafuegos</h2>
              <p className="text-gray-600 mb-6">
                Venta, recarga e inspección de matafuegos con certificación IRAM 3542 y control
                automático de vencimientos.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Venta, recarga y prueba hidráulica</span></li>
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Control de vencimientos</span></li>
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Service a domicilio</span></li>
              </ul>
              <span className="inline-flex items-center text-primary font-medium">
                Ver más <ArrowRight size={16} className="ml-1" />
              </span>
            </div>
          </Link>

          <Link href="/servicios/consorcios" className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-primary/10 p-6 flex justify-center">
              <Building2 size={64} className="text-primary" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-montserrat font-bold mb-4 text-primary">Consorcios</h2>
              <p className="text-gray-600 mb-6">
                Mantenimiento de incendio y matafuegos en áreas comunes, planes de evacuación y
                contrato anual para administradores.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Matafuegos y detección en áreas comunes</span></li>
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Planes de evacuación y simulacros</span></li>
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Cámaras y control de accesos del edificio</span></li>
              </ul>
              <span className="inline-flex items-center text-primary font-medium">
                Ver más <ArrowRight size={16} className="ml-1" />
              </span>
            </div>
          </Link>
        </div>

        <h2 className="text-2xl font-montserrat font-bold mb-8 text-primary">
          Seguridad electrónica
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/servicios/seguridad" className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-primary/10 p-6 flex justify-center">
              <Shield size={64} className="text-primary" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-montserrat font-bold mb-4 text-primary">Alarmas y robos</h2>
              <p className="text-gray-600 mb-6">
                Implementamos sistemas de alarma para detectar intrusiones y activar respuestas
                inmediatas frente a cualquier intento de acceso no autorizado.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Detección de intrusión</span></li>
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Protección de puertas, ventanas y perímetros</span></li>
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Integración con monitoreo y alertas</span></li>
              </ul>
              <span className="inline-flex items-center text-primary font-medium">
                Ver más <ArrowRight size={16} className="ml-1" />
              </span>
            </div>
          </Link>

          <Link href="/servicios/seguridad" className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-primary/10 p-6 flex justify-center">
              <Camera size={64} className="text-primary" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-montserrat font-bold mb-4 text-primary">Cámaras y videovigilancia</h2>
              <p className="text-gray-600 mb-6">
                Diseñamos sistemas de vigilancia con cámaras de alta definición, grabación y
                acceso remoto para controlar cualquier espacio en tiempo real.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Cámaras IP y analógicas</span></li>
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Monitoreo remoto móvil</span></li>
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Grabación y almacenamiento</span></li>
              </ul>
              <span className="inline-flex items-center text-primary font-medium">
                Ver más <ArrowRight size={16} className="ml-1" />
              </span>
            </div>
          </Link>

          <Link href="/servicios/seguridad" className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-primary/10 p-6 flex justify-center">
              <Lock size={64} className="text-primary" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-montserrat font-bold mb-4 text-primary">Control de acceso</h2>
              <p className="text-gray-600 mb-6">
                Gestionamos quién entra y cuándo, con sistemas de tarjetas, claves y tecnologías
                de identificación para mayor control y trazabilidad.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Control de entradas y salidas</span></li>
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Restricción por áreas</span></li>
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Registros y auditoría</span></li>
              </ul>
              <span className="inline-flex items-center text-primary font-medium">
                Ver más <ArrowRight size={16} className="ml-1" />
              </span>
            </div>
          </Link>

          <Link href="/servicios/seguridad" className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-primary/10 p-6 flex justify-center">
              <Shield size={64} className="text-primary" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-montserrat font-bold mb-4 text-primary">Monitoreo remoto</h2>
              <p className="text-gray-600 mb-6">
                Ofrecemos supervisión continua desde plataformas o dispositivos móviles para
                mantener el control de la seguridad desde cualquier lugar.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Vigilancia 24/7</span></li>
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Alertas automáticas</span></li>
                <li className="flex items-start"><span className="text-primary mr-2">•</span><span>Acceso remoto y seguimiento</span></li>
              </ul>
              <span className="inline-flex items-center text-primary font-medium">
                Ver más <ArrowRight size={16} className="ml-1" />
              </span>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">
            ¿Necesita una solución de incendio o seguridad a medida?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Contáctenos para evaluar su inmueble y definir el sistema más adecuado para su
            necesidad.
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
