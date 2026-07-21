

     // app/page.js
import Link from 'next/link';
import { ArrowRight, Settings, Zap, Thermometer, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

{/* Hero Section con imagen de fondo visible */}
<section className="relative text-white py-16 md:py-16">
  {/* Capa de imagen de fondo (visible completamente) */}
  <div 
    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
    style={{ 
      backgroundImage: "url('/images/image.png')" 
    }}
  ></div>
  
  {/* Sin overlay general - eliminamos esta capa */}
  
  {/* Contenido con fondo semitransparente */}
  <div className="container mx-auto px-4 relative z-20 pt-4">
    <div className="max-w-3xl backdrop-blur-sm bg-black/30 p-6 md:p-8 rounded-lg">
      <h1 className="text-3xl md:text-5xl font-montserrat font-bold mb-4 text-white">
        Servicios técnicos profesionales para su empresa
      </h1>
      <p className="text-lg md:text-xl mb-8 text-white">
        Soluciones integrales en automatismo, electricidad, climatización y seguridad con la máxima calidad y garantía.
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

     {/* Services Section */}
      <section className="py-10 md:py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-montserrat font-bold text-center mb-10 md:mb-12 text-primary">
            Nuestros Servicios
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Automatismo */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Settings size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-montserrat font-bold mb-3">Automatismo</h3>
              <p className="text-gray-600 mb-4">
                Sistemas de control automático para procesos industriales y domésticos,
                optimizando la eficiencia y seguridad de sus instalaciones.
              </p>
              <Link 
                href="/servicios/automatismo" 
                className="text-primary font-medium inline-flex items-center hover:underline"
              >
                Ver más <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            
            {/* Electricidad */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Zap size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-montserrat font-bold mb-3">Electricidad</h3>
              <p className="text-gray-600 mb-4">
                Instalaciones eléctricas profesionales, mantenimiento preventivo
                y correctivo, cumpliendo con todas las normativas de seguridad.
              </p>
              <Link 
                href="/servicios/electricidad" 
                className="text-primary font-medium inline-flex items-center hover:underline"
              >
                Ver más <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            
            {/* Climatización */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Thermometer size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-montserrat font-bold mb-3">Climatización</h3>
              <p className="text-gray-600 mb-4">
                Soluciones de climatización para ambientes industriales y comerciales,
                instalación, mantenimiento y reparación de equipos.
              </p>
              <Link 
                href="/servicios/climatizacion" 
                className="text-primary font-medium inline-flex items-center hover:underline"
              >
                Ver más <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            
            {/* Seguridad */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Shield size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-montserrat font-bold mb-3">Seguridad</h3>
              <p className="text-gray-600 mb-4">
                Sistemas de alarmas y cámaras de vigilancia para proteger
                sus instalaciones, con monitoreo remoto y soluciones a medida.
              </p>
              <Link 
                href="/servicios/seguridad" 
                className="text-primary font-medium inline-flex items-center hover:underline"
              >
                Ver más <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-montserrat font-bold text-center mb-10 md:mb-12 text-primary">
            ¿Por qué elegirnos?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-montserrat font-bold mb-3">Experiencia</h3>
              <p className="text-gray-600">
                Más de 15 años de experiencia en servicios técnicos para empresas e industrias,
                garantizando soluciones confiables y duraderas.
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
                Respondemos a sus solicitudes en menos de 24 horas y ofrecemos
                atención de emergencia para problemas críticos.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-montserrat font-bold mb-3">Presupuestos claros</h3>
              <p className="text-gray-600">
                Ofrecemos presupuestos detallados y transparentes, sin costos ocultos
                ni sorpresas a la hora de la facturación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-montserrat font-bold mb-4 md:mb-6">
            ¿Necesita un servicio técnico profesional?
          </h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
            Contáctenos hoy mismo para obtener un presupuesto sin compromiso.
            Respondemos en menos de 24 horas.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/contacto" 
              className="bg-white text-primary px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Solicitar presupuesto
            </Link>
            <a 
              href="tel:+5493516810777" 
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