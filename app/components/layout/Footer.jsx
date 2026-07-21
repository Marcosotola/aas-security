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
            <p className="mb-4">Especialistas en detección y extinción de incendios, matafuegos y seguridad integral para consorcios, hogares, comercios e industrias.</p>
            <div className="flex items-center mb-2">
              <Phone size={16} className="mr-2" />
              <span>(351) 681 0777</span>
            </div>
            <div className="flex items-center mb-2">
              <Mail size={16} className="mr-2" />
              <span>contacto@aassecurity.com.ar</span>
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
                <Link href="/servicios/incendios" className="hover:text-gray-300">
                  Detección y extinción de incendios
                </Link>
              </li>
              <li>
                <Link href="/servicios/matafuegos" className="hover:text-gray-300">
                  Matafuegos
                </Link>
              </li>
              <li>
                <Link href="/servicios/consorcios" className="hover:text-gray-300">
                  Consorcios
                </Link>
              </li>
              <li>
                <Link href="/servicios/seguridad" className="hover:text-gray-300">
                  Alarmas y cámaras
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