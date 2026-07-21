// components/layout/Header.js
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Briefcase, Users, MessageSquare, ChevronDown } from 'lucide-react';
import Image from 'next/image';


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Efecto para detectar el scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  return (
    <header className={` fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-1' : 'bg-transparent py-1'}`}>
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative mr-2">
              <div className="absolute inset-0 transition-transform transform rotate-45 rounded-full bg-primary group-hover:rotate-90"></div>
              <div className="absolute inset-0 transition-transform transform scale-75 -rotate-45 rounded-full bg-secondary group-hover:-rotate-90"></div>
              {/*               <span className="relative z-10 flex items-center justify-center w-10 h-10 text-3xl font-bold text-white font-montserrat">
                S
              </span> */}
            </div>
            <div className='flex'>
              <div className='mr-1'>
                <Image src={'/logo/logo.png'} alt="Logo" width={45} height={45}
                className='bg-white rounded-sm'></Image>
              </div>
              <div>
                <span className="text-4xl font-bold font-montserrat ">
                  <span className={`${scrolled ? 'text-primary' : 'text-white'}`}>AAS</span>
                  <span className={`${scrolled ? 'text-secondary' : 'text-white'}`}> Security</span>
                </span>
                <span className={`block text-xs ${scrolled ? 'text-gray-600' : 'text-gray-300'} font-montserrat`}>SERVICIOS INTEGRALES</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="items-center hidden space-x-1 md:flex">
            <Link
              href="/"
              className={`group relative px-3 py-2 rounded-md transition-all duration-200 ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-white'}`}
            >
              <span className="flex items-center">
                <Home size={16} className="mr-1 transition-transform group-hover:scale-110" />
                <span>Inicio</span>
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <div className="relative group">
              <button
                onClick={() => toggleDropdown('servicios')}
                className={`group relative px-3 py-2 rounded-md transition-all duration-200 flex items-center ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-white'}`}
              >
                <Briefcase size={16} className="mr-1 transition-transform group-hover:scale-110" />
                <span>Servicios</span>
                <ChevronDown size={14} className={`ml-1 transition-transform duration-300 ${activeDropdown === 'servicios' ? 'rotate-180' : ''}`} />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </button>

              {/* Dropdown */}
              <div className={`absolute top-full left-0 w-56 mt-1 bg-white shadow-lg rounded-md overflow-hidden transition-all duration-300 ${activeDropdown === 'servicios' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                <Link href="/servicios/automatismo" className="block px-4 py-2 text-gray-700 transition-colors hover:bg-primary hover:text-white">
                  Automatismo
                </Link>
                <Link href="/servicios/electricidad" className="block px-4 py-2 text-gray-700 transition-colors hover:bg-primary hover:text-white">
                  Electricidad
                </Link>
                <Link href="/servicios/climatizacion" className="block px-4 py-2 text-gray-700 transition-colors hover:bg-primary hover:text-white">
                  Climatización
                </Link>
                <Link href="/servicios/seguridad" className="block px-4 py-2 text-gray-700 transition-colors hover:bg-primary hover:text-white">
                  Seguridad
                </Link>
                <Link href="/servicios" className="block px-4 py-2 font-medium transition-colors text-primary hover:bg-primary hover:text-white">
                  Ver todos
                </Link>
              </div>
            </div>

            <Link
              href="/nosotros"
              className={`group relative px-3 py-2 rounded-md transition-all duration-200 ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-white'}`}
            >
              <span className="flex items-center">
                <Users size={16} className="mr-1 transition-transform group-hover:scale-110" />
                <span>Nosotros</span>
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link
              href="/contacto"
              className={`bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-md transition-colors flex items-center ml-2 ${scrolled ? 'shadow-md' : ''}`}
            >
              <MessageSquare size={16} className="mr-1" />
              <span>Contacto</span>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 rounded-md ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 py-3 bg-white shadow-lg rounded-lg max-h-[70vh] overflow-y-auto">
            <Link
              href="/"
              className="flex items-center px-4 py-3 text-gray-700 transition-colors rounded-md hover:bg-primary hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home size={18} className="mr-2" />
              <span>Inicio</span>
            </Link>

            <div className="px-4 py-3">
              <button
                onClick={() => toggleDropdown('mobileServicios')}
                className="flex items-center w-full text-left text-gray-700 hover:text-primary"
              >
                <Briefcase size={18} className="mr-2" />
                <span>Servicios</span>
                <ChevronDown size={16} className={`ml-auto transition-transform duration-300 ${activeDropdown === 'mobileServicios' ? 'rotate-180' : ''}`} />
              </button>

              {activeDropdown === 'mobileServicios' && (
                <div className="pl-4 mt-2 ml-6 space-y-2 border-l-2 border-primary">
                  <Link
                    href="/servicios/automatismo"
                    className="block py-2 text-gray-700 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Automatismo
                  </Link>
                  <Link
                    href="/servicios/electricidad"
                    className="block py-2 text-gray-700 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Electricidad
                  </Link>
                  <Link
                    href="/servicios/climatizacion"
                    className="block py-2 text-gray-700 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Climatización
                  </Link>
                  <Link
                    href="/servicios/seguridad"
                    className="block py-2 text-gray-700 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Seguridad
                  </Link>
                  <Link
                    href="/servicios"
                    className="block py-2 font-medium text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ver todos los servicios
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/nosotros"
              className="flex items-center px-4 py-3 text-gray-700 transition-colors rounded-md hover:bg-primary hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <Users size={18} className="mr-2" />
              <span>Nosotros</span>
            </Link>

            <Link
              href="/contacto"
              className="flex items-center px-4 py-3 mx-4 mt-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
              onClick={() => setIsMenuOpen(false)}
            >
              <MessageSquare size={18} className="mr-2" />
              <span>Contacto</span>
            </Link>
          </nav>
        )}
      </div>

      {/* Barra de progreso en la parte superior */}
      <div className={`h-0.5 bg-gradient-to-r from-primary via-secondary to-info transform transition-transform duration-500 ${scrolled ? 'scale-x-100' : 'scale-x-0'}`}></div>
      <hr className='border-t border-white' />
    </header>
  );
};

export default Header;