import Link from 'next/link';
import { Building2, ArrowLeft, Check } from 'lucide-react';

export default function ServicioConsorcios() {
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
            <Building2 size={32} className="mr-3" />
            <h1 className="text-3xl font-montserrat font-bold">Consorcios</h1>
          </div>
          <p className="text-xl max-w-2xl">
            Soluciones de seguridad y protección contra incendios pensadas para edificios,
            administradores y consorcios, con un solo proveedor para todo el mantenimiento.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">
              Un aliado técnico para administradores y consejos de propietarios
            </h2>
            <p className="text-gray-600 mb-6">
              Los edificios de propiedad horizontal tienen obligaciones específicas en materia de
              incendio y seguridad de las áreas comunes. En AAS Security trabajamos junto a
              administradores y consejos de propietarios para cumplir con la normativa vigente y
              mantener protegidos los espacios comunes durante todo el año.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Matafuegos y protección contra incendios en áreas comunes
            </h3>
            <p className="text-gray-600 mb-6">
              Instalamos, recargamos e inspeccionamos los matafuegos de palieres, cocheras, salas
              de máquinas y SUM, y mantenemos al día los sistemas de detección y alarma de incendio
              del edificio, con certificados listos para presentar ante bomberos o el seguro.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Planes de evacuación y señalización
            </h3>
            <p className="text-gray-600 mb-6">
              Elaboramos el plan de evacuación del edificio, coordinamos simulacros con los
              vecinos y colocamos la señalización de emergencia y salidas requerida por la
              normativa municipal.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Cámaras y control de accesos del edificio
            </h3>
            <p className="text-gray-600 mb-6">
              Sumamos videovigilancia de accesos, cocheras y SUM, y sistemas de control de acceso
              peatonal y vehicular (porteros eléctricos, tags e intercomunicadores) para reforzar
              la seguridad de todos los propietarios.
            </p>

            <h3 className="text-xl font-montserrat font-bold mb-4 text-primary mt-8">
              Contrato de mantenimiento anual
            </h3>
            <p className="text-gray-600 mb-6">
              Ofrecemos un contrato de mantenimiento anual que incluye visitas programadas,
              recambio de baterías y agentes extintores, y un canal directo para emergencias,
              simplificando la gestión del administrador y evitando gastos imprevistos.
            </p>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-montserrat font-bold mb-4 text-primary">
                Beneficios para el consorcio
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Cumplimiento normativo permanente</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Un solo proveedor para incendio y seguridad</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Certificados listos para bomberos y seguros</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Planes de mantenimiento con costo previsible</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Atención directa al administrador</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-success mr-2 mt-1 flex-shrink-0" />
                  <span>Mayor seguridad para todos los propietarios</span>
                </li>
              </ul>

              <div className="mt-8 bg-primary/10 p-6 rounded-lg">
                <h3 className="text-lg font-montserrat font-bold mb-3 text-primary">
                  ¿Administra un consorcio o edificio?
                </h3>
                <p className="text-gray-600 mb-4">
                  Le proponemos un plan de mantenimiento a medida para las áreas comunes.
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
