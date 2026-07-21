'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError(false);
  
    try {
      const response = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
  
      const result = await response.json();
  
      if (result.success) {
        setSubmitMessage('¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.');
        setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      setSubmitError(true);
      setSubmitMessage('Ocurrió un error al enviar el mensaje. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div>
      <div className="text-white bg-primary py-22">
        <div className="container px-4 mx-auto">
          <h1 className="mb-4 text-3xl font-bold font-montserrat">Contacto</h1>
          <p className="max-w-2xl text-xl">
            Estamos aquí para responder sus consultas y brindarle la mejor solución para sus necesidades técnicas.
          </p>
        </div>
      </div>

      <div className="container px-4 py-16 mx-auto">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">Envíenos un mensaje</h2>

            {submitMessage && (
              <div className={`p-4 mb-6 rounded-md ${submitError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="nombre" className="block mb-2 font-medium">Nombre completo</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block mb-2 font-medium">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="telefono" className="block mb-2 font-medium">Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="mensaje" className="block mb-2 font-medium">Mensaje</label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center px-6 py-3 font-medium text-white transition-colors rounded-md bg-primary hover:bg-primary-light disabled:opacity-70"
              >
                {isSubmitting ? 'Enviando...' : (
                  <>
                    Enviar mensaje
                    <Send size={18} className="ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">Información de contacto</h2>

            <div className="space-y-6">
              <div className="flex items-start">
                <Phone className="mt-1 mr-4 text-primary" />
                <div>
                  <h3 className="font-medium">Teléfono</h3>
                  <p className="text-gray-600">(351) 681 0777</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="mt-1 mr-4 text-primary" />
                <div>
                  <h3 className="font-medium">Correo electrónico</h3>
                  <p className="text-gray-600">sincorpserviciosintegrales@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="mt-1 mr-4 text-primary" />
                <div>
                  <h3 className="font-medium">Dirección</h3>
                  <p className="text-gray-600">Av. Luciano Torrent 4800</p>
                  <p className="text-gray-600">5000 Córdoba, Argentina</p>
                </div>
              </div>
            </div>

            <div className="flex mt-8 item-start">
              <Clock className="mt-1 mr-4 text-primary" />
              <div>
                <h3 className="mb-3 font-medium">Horario de atención</h3>
                <p className="text-gray-600">Lunes a Viernes: 8:00 - 18:00</p>
                <p className="text-gray-600">Sábados: 9:00 - 13:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}