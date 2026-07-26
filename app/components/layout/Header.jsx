// components/layout/Header.js
"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Briefcase, Users, MessageSquare, ChevronDown, User } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const dropdownRef = useRef(null);

  // Sesión del cliente (portal /cuenta), independiente del login del panel admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

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

  // Cerrar el dropdown de servicios al hacer click fuera de él
  useEffect(() => {
    if (activeDropdown !== 'servicios') return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  return (
    <header className={` fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-1' : 'bg-black/30 backdrop-blur-md py-1'}`}>
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-4xl font-bold font-montserrat">
              <span className={`${scrolled ? 'text-primary' : 'text-white'}`}>AAS</span>
              <span className={`${scrolled ? 'text-secondary' : 'text-white'}`}> Security</span>
            </span>
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

            <div className="relative group" ref={dropdownRef}>
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
              <div className={`absolute top-full left-0 w-64 mt-1 bg-white shadow-lg rounded-md overflow-hidden transition-all duration-300 ${activeDropdown === 'servicios' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                <Link href="/servicios/incendios" className="block px-4 py-2 text-gray-700 transition-colors hover:bg-primary hover:text-white">
                  Detección y extinción de incendios
                </Link>
                <Link href="/servicios/matafuegos" className="block px-4 py-2 text-gray-700 transition-colors hover:bg-primary hover:text-white">
                  Matafuegos
                </Link>
                <Link href="/servicios/consorcios" className="block px-4 py-2 text-gray-700 transition-colors hover:bg-primary hover:text-white">
                  Consorcios
                </Link>
                <Link href="/servicios/seguridad" className="block px-4 py-2 text-gray-700 transition-colors hover:bg-primary hover:text-white">
                  Alarmas y cámaras
                </Link>
                <Link href="/servicios/seguridad#control-de-acceso" className="block px-4 py-2 text-gray-700 transition-colors hover:bg-primary hover:text-white">
                  Control de acceso
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

            <Link
              href={currentUser ? '/cuenta' : '/login'}
              className={`group relative px-3 py-2 rounded-md transition-all duration-200 ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-white'}`}
              title={currentUser ? 'Mi Cuenta' : 'Ingresar / Registrarme'}
            >
              <span className="flex items-center">
                <User size={16} className="mr-1 transition-transform group-hover:scale-110" />
                <span>{currentUser ? 'Mi Cuenta' : 'Ingresar'}</span>
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
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
                    href="/servicios/incendios"
                    className="block py-2 text-gray-700 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Detección y extinción de incendios
                  </Link>
                  <Link
                    href="/servicios/matafuegos"
                    className="block py-2 text-gray-700 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Matafuegos
                  </Link>
                  <Link
                    href="/servicios/consorcios"
                    className="block py-2 text-gray-700 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Consorcios
                  </Link>
                  <Link
                    href="/servicios/seguridad"
                    className="block py-2 text-gray-700 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Alarmas y cámaras
                  </Link>
                  <Link
                    href="/servicios/seguridad#control-de-acceso"
                    className="block py-2 text-gray-700 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Control de acceso
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

            <Link
              href={currentUser ? '/cuenta' : '/login'}
              className="flex items-center px-4 py-3 text-gray-700 transition-colors rounded-md hover:bg-primary hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <User size={18} className="mr-2" />
              <span>{currentUser ? 'Mi Cuenta' : 'Ingresar / Registrarme'}</span>
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