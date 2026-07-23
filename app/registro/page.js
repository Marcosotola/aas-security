// app/registro/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { crearUsuario } from '../lib/firestore';

export default function Registro() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const credencial = await createUserWithEmailAndPassword(auth, email, password);
      await crearUsuario(credencial.user.uid, { email, perfilCompleto: false });
      router.push('/registro/datos');
    } catch (err) {
      console.error('Error al registrarse:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Ya existe una cuenta con ese correo. Probá iniciar sesión.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Ingresá un correo válido.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil.');
      } else {
        setError('Error al crear la cuenta. Inténtalo de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
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
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Paso 1 de 2 · Correo y contraseña
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 rounded-md bg-red-100">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleRegistro}>
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">Contraseña</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Mínimo 6 caracteres"
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

          <div>
            <label htmlFor="confirmar-password" className="block mb-1 text-sm font-medium text-gray-700">Repetir contraseña</label>
            <input
              id="confirmar-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Repetí la contraseña"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white border border-transparent rounded-md bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Continuar'}
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-gray-600">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="font-medium text-primary hover:text-primary-light">
            Iniciá sesión
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-primary hover:text-primary-light">
            Volver al sitio principal
          </Link>
        </div>
      </div>
    </div>
  );
}
