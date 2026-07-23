// app/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { obtenerUsuarioPorId } from '../lib/firestore';

export default function Login() {
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
      const credencial = await signInWithEmailAndPassword(auth, email, password);
      const perfil = await obtenerUsuarioPorId(credencial.user.uid);

      if (!perfil) {
        // Cuenta autenticada sin perfil completo (registro interrumpido): lo termina.
        router.push('/registro/datos');
      } else if (perfil.role === 'Admin' || perfil.role === 'Tecnico') {
        router.push('/admin/dashboard');
      } else if (!perfil.perfilCompleto) {
        router.push('/registro/datos');
      } else {
        router.push('/cuenta');
      }
    } catch (err) {
      console.error('Error login:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
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
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-100 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div>
          <Link href="/" className="flex items-center justify-center mb-6 group">
            <span className="text-3xl font-bold font-montserrat">
              <span className="text-primary">AAS</span>
              <span className="text-secondary"> Security</span>
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-center font-montserrat text-primary">
            Mi Cuenta
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            {resetMode ? 'Ingresá tu correo para recuperar el acceso' : 'Ingresá con tu correo y contraseña'}
          </p>
        </div>

        {!resetMode ? (
          <>
            {error && (
              <div className="p-3 text-sm text-red-700 rounded-md bg-red-100">
                {error}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div className="-space-y-px rounded-md shadow-sm">
                <div>
                  <label htmlFor="email-address" className="sr-only">Email</label>
                  <input
                    id="email-address"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    placeholder="Correo electrónico"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="password" className="sr-only">Contraseña</label>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative block w-full px-3 py-3 pr-10 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
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
                  className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white border border-transparent rounded-md bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>
              </div>
            </form>

            <p className="text-sm text-center text-gray-600">
              ¿No tenés cuenta?{' '}
              <Link href="/registro" className="font-medium text-primary hover:text-primary-light">
                Registrate
              </Link>
            </p>
          </>
        ) : (
          <>
            {resetMessage && (
              <div className="p-3 text-sm text-green-700 rounded-md bg-green-100">
                {resetMessage}
              </div>
            )}
            {resetError && (
              <div className="p-3 text-sm text-red-700 rounded-md bg-red-100">
                {resetError}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="reset-email" className="sr-only">Email</label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Correo electrónico"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white border border-transparent rounded-md bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
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

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-primary hover:text-primary-light">
            Volver al sitio principal
          </Link>
        </div>
      </div>
    </div>
  );
}
