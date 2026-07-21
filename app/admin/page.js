// app/admin/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Te enviamos un correo con un enlace para restablecer tu contraseña.');
    } catch (err) {
      console.error('Error al enviar email de recuperación:', err);
      if (err.code === 'auth/user-not-found') {
        setResetError('No existe una cuenta con ese correo.');
      } else if (err.code === 'auth/invalid-email') {
        setResetError('Ingresá un correo válido.');
      } else {
        setResetError('Error al enviar el correo. Inténtalo de nuevo más tarde.');
      }
    } finally {
      setResetLoading(false);
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
                <span className="text-primary">AAS</span>
                <span className="text-secondary"> Security</span>
              </span>
            </div>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-montserrat font-bold text-primary">
            Panel de Administración
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {resetMode ? 'Ingresá tu correo para recuperar el acceso' : 'Ingrese sus credenciales para acceder'}
          </p>
        </div>

        {!resetMode ? (
          <>
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
                <div className="relative">
                  <label htmlFor="password" className="sr-only">Contraseña</label>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    placeholder="Contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(true);
                    setResetEmail(email);
                    setResetMessage('');
                    setResetError('');
                  }}
                  className="text-sm text-primary hover:text-primary-light"
                >
                  ¿Olvidaste tu contraseña?
                </button>
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
          </>
        ) : (
          <>
            {resetMessage && (
              <div className="bg-green-100 text-green-700 p-3 rounded-md text-sm">
                {resetMessage}
              </div>
            )}
            {resetError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
                {resetError}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="reset-email" className="sr-only">Email</label>
                <input
                  id="reset-email"
                  name="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Correo electrónico"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {resetLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setResetMessage('');
                    setResetError('');
                  }}
                  className="text-sm text-primary hover:text-primary-light"
                >
                  Volver a iniciar sesión
                </button>
              </div>
            </form>
          </>
        )}

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-primary hover:text-primary-light">
            Volver al sitio principal
          </Link>
        </div>
      </div>
    </div>
  );
}