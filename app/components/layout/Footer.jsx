import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="text-white bg-primary">
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Company Info */}
          <div>
            <h3 className="mb-4 text-xl font-bold font-montserrat">AAS SECURITY</h3>
            <p className="mb-4">Servicios técnicos profesionales en Automatismo, Electricidad, Climatización y Seguridad.</p>
            <div className="flex items-center mb-2">
              <Phone size={16} className="mr-2" />
              <span>(351) 681 0777</span>
            </div>
            <div className="flex items-center mb-2">
              <Mail size={16} className="mr-2" />
              <span> sincorpserviciosintegrales@gmail.com</span>
            </div>
            <div className="flex items-start mb-2">
              <MapPin size={16} className="mt-1 mr-2" />
              <span>Av. Luciano Torrent 4800, 5000 - Cordoba, Argentina</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-xl font-bold font-montserrat">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-gray-300">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/servicios" className="hover:text-gray-300">
                  Servicios
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-gray-300">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-gray-300">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-xl font-bold font-montserrat">Servicios</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/servicios/automatismo" className="hover:text-gray-300">
                  Automatismo
                </Link>
              </li>
              <li>
                <Link href="/servicios/electricidad" className="hover:text-gray-300">
                  Electricidad
                </Link>
              </li>
              <li>
                <Link href="/servicios/climatizacion" className="hover:text-gray-300">
                  Climatización
                </Link>
              </li>
              <li>
                <Link href="/servicios/seguridad" className="hover:text-gray-300">
                  Seguridad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 mt-8 text-center border-t border-blue-800">
          <p>&copy; {new Date().getFullYear()} AAS Security. Todos los derechos reservados.</p>
          <Link 
          href='/admin'
          className='px-6 py-6 font-bold '>De: Martin Sotola</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;