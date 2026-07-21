// app/admin/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Autenticación con Firebase
      await signInWithEmailAndPassword(auth, email, password);
      
      // Login exitoso, redirigir al dashboard
      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Error login:', err);
      
      // Mensajes de error personalizados según el código
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Credenciales incorrectas. Por favor, inténtelo de nuevo.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Por favor, inténtelo más tarde.');
      } else {
        setError('Error al iniciar sesión. Por favor, inténtelo de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <Link href="/" className="flex items-center justify-center mb-6 group">
            <div className="relative mr-2">
              <div className="absolute inset-0 bg-primary rounded-full transform rotate-45 transition-transform group-hover:rotate-90"></div>
              <div className="absolute inset-0 bg-secondary rounded-full transform -rotate-45 scale-75 transition-transform group-hover:-rotate-90"></div>
 
            </div>
            <div>
              <span className="text-3xl font-montserrat font-bold">
                <span className="text-primary">SIN</span>
                <span className="text-secondary">CORP</span>
              </span>
            </div>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-montserrat font-bold text-primary">
            Panel de Administración
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingrese sus credenciales para acceder
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Contraseña"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-primary hover:text-primary-light">
            Volver al sitio principal
          </Link>
        </div>
      </div>
    </div>
  );
}