// app/page.js
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Flame, FireExtinguisher, Building2, Shield, Camera, Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

      <section className="relative text-white py-16 md:py-20">
        {/* Fondo para móvil: recorte pensado para pantallas verticales */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat md:hidden"
          style={{ backgroundImage: "url('/images/image-mobile.png')" }}
        ></div>
        {/* Fondo para escritorio: foto horizontal original */}
        <div
          className="absolute inset-0 z-0 hidden bg-cover bg-center bg-no-repeat md:block"
          style={{ backgroundImage: "url('/images/image.png')" }}
        ></div>

        <div className="container mx-auto px-4 relative z-20 pt-4">
          <div className="max-w-3xl backdrop-blur-sm bg-black/35 p-6 md:p-8 rounded-lg">
            <h1 className="text-3xl md:text-5xl font-montserrat font-bold mb-4 text-white">
              Especialistas en protección contra incendios y seguridad integral
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white">
              En AAS Security diseñamos, instalamos y mantenemos sistemas de detección y extinción
              de incendios, matafuegos y soluciones para consorcios, además de alarmas, cámaras y
              control de acceso, para hogares, comercios e industrias.
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center bg-primary text-white px-4 md:px-6 py-2 md:py-3 rounded-md font-medium hover:bg-primary-light transition-colors"
            >
              Solicitar presupuesto
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-montserrat font-bold text-center mb-2 text-primary">
            Nuestra especialidad: protección contra incendios
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10 md:mb-12">
            Y también resolvemos el resto de la seguridad de su propiedad, todo con un mismo
            equipo técnico.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Link href="/servicios/incendios" className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src="/pages/dispositivos-deteccion-incendios.jpeg"
                  alt="Detección y extinción de incendios"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute bottom-3 left-3 bg-white/90 p-2 rounded-full shadow">
                  <Flame size={22} className="text-primary" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-montserrat font-bold mb-3 group-hover:text-primary transition-colors">Detección y extinción de incendios</h3>
                <p className="text-gray-600 mb-4">
                  Centrales y detectores de humo, calor y llama, extinción por agentes limpios y
                  gases nobles, sprinklers, alarma y audio evacuación.
                </p>
              </div>
            </Link>

            <Link href="/servicios/matafuegos" className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src="/pages/matafuegos.jpeg"
                  alt="Matafuegos"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute bottom-3 left-3 bg-white/90 p-2 rounded-full shadow">
                  <FireExtinguisher size={22} className="text-primary" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-montserrat font-bold mb-3 group-hover:text-primary transition-colors">Matafuegos</h3>
                <p className="text-gray-600 mb-4">
                  Venta, recarga, inspección y control de vencimientos, con certificación IRAM 3542
                  y aviso automático cuando se acerca la fecha de renovación.
                </p>
              </div>
            </Link>

            <Link href="/servicios/consorcios" className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src="/pages/edificio-consorcio.png"
                  alt="Consorcios"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute bottom-3 left-3 bg-white/90 p-2 rounded-full shadow">
                  <Building2 size={22} className="text-primary" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-montserrat font-bold mb-3 group-hover:text-primary transition-colors">Consorcios</h3>
                <p className="text-gray-600 mb-4">
                  Mantenimiento de matafuegos y detección en áreas comunes, planes de evacuación y
                  contrato anual pensado para administradores.
                </p>
              </div>
            </Link>

            <Link href="/servicios/seguridad" className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src="/pages/alarma-intrusion.jpeg"
                  alt="Alarmas y prevención"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute bottom-3 left-3 bg-white/90 p-2 rounded-full shadow">
                  <Shield size={22} className="text-primary" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-montserrat font-bold mb-3 group-hover:text-primary transition-colors">Alarmas y prevención</h3>
                <p className="text-gray-600 mb-4">
                  Sistemas de alarma de intrusión para detectar accesos no autorizados y activar
                  respuestas rápidas ante cualquier evento.
                </p>
              </div>
            </Link>

            <Link href="/servicios/seguridad" className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src="/pages/camara-domo.jpeg"
                  alt="Cámaras y monitoreo"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute bottom-3 left-3 bg-white/90 p-2 rounded-full shadow">
                  <Camera size={22} className="text-primary" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-montserrat font-bold mb-3 group-hover:text-primary transition-colors">Cámaras y monitoreo</h3>
                <p className="text-gray-600 mb-4">
                  Videovigilancia profesional con visualización en tiempo real, grabación y control
                  remoto desde cualquier lugar.
                </p>
              </div>
            </Link>

            <Link href="/servicios/seguridad" className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src="/pages/control-acceso.jpeg"
                  alt="Control de acceso"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute bottom-3 left-3 bg-white/90 p-2 rounded-full shadow">
                  <Lock size={22} className="text-primary" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-montserrat font-bold mb-3 group-hover:text-primary transition-colors">Control de acceso</h3>
                <p className="text-gray-600 mb-4">
                  Soluciones para restringir y registrar entradas, con mayor control, trazabilidad y
                  seguridad operativa.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-montserrat font-bold text-center mb-10 md:mb-12 text-primary">
            ¿Por qué elegir AAS Security?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Flame className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-montserrat font-bold mb-3">Foco en incendios</h3>
              <p className="text-gray-600">
                Somos especialistas en detección, extinción y matafuegos, con criterio técnico y
                pleno cumplimiento normativo ante bomberos y seguros.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-montserrat font-bold mb-3">Respuesta rápida</h3>
              <p className="text-gray-600">
                Atendemos solicitudes y urgencias con agilidad para minimizar riesgos y garantizar
                continuidad operativa.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-montserrat font-bold mb-3">Un solo proveedor</h3>
              <p className="text-gray-600">
                Incendio, matafuegos, consorcios y seguridad electrónica en un mismo contrato de
                mantenimiento, sin coordinar múltiples empresas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-montserrat font-bold mb-4 md:mb-6">
            ¿Necesita proteger su propiedad o su consorcio?
          </h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
            Solicite una consulta técnica y le ayudamos a definir la mejor solución de incendio y
            seguridad para su caso.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contacto"
              className="bg-white text-primary px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Solicitar presupuesto
            </Link>
            <a
              href="tel:+5493513112962"
              className="border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white/10 transition-colors"
            >
              Llamar ahora
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
