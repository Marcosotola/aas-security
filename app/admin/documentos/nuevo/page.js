'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Save, Download } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useStaffAuth } from '../../../lib/useStaffAuth';
import { PDFDownloadLink } from '@react-pdf/renderer';
import DocumentoPDF from '../../../components/pdf/DocumentoPDF';

export default function NuevoDocumento() {
  const router = useRouter();
  const { user, loading } = useStaffAuth(['Admin']);
  const [guardando, setGuardando] = useState(false);

  // Estado para el modal de contenido
  const [modalContenido, setModalContenido] = useState({
    isOpen: false,
    value: ''
  });

  // Estado del formulario
  const [documento, setDocumento] = useState({
    titulo: '',
    fecha: new Date().toISOString().split('T')[0],
    contenido: ''
  });

  // Función para abrir el modal de contenido
  const abrirModalContenido = () => {
    setModalContenido({
      isOpen: true,
      value: documento.contenido
    });
  };

  // Función para guardar y cerrar el modal
  const guardarContenido = () => {
    setDocumento({ ...documento, contenido: modalContenido.value });
    setModalContenido({
      isOpen: false,
      value: ''
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleGuardarDocumento = async () => {
    if (!documento.titulo.trim()) {
      alert('Por favor ingrese un título para el documento');
      return;
    }

    if (!documento.contenido.trim()) {
      alert('Por favor ingrese el contenido del documento');
      return;
    }

    setGuardando(true);
    try {
      const documentoData = {
        ...documento,
        usuarioCreador: user.email,
        fechaCreacion: serverTimestamp()
      };

      await addDoc(collection(db, 'documentos'), documentoData);
      alert('Documento guardado exitosamente');
      router.push('/admin/documentos');
    } catch (error) {
      console.error('Error al guardar el documento:', error);
      alert('Error al guardar el documento. Inténtelo de nuevo más tarde.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del administrador */}
      <header className="text-white shadow bg-primary">
        <div className="container flex items-center justify-between px-4 py-20 mx-auto">
          <div className="flex items-center">
            <div className="relative mr-2">
              <div className="absolute inset-0 transform rotate-45 rounded-full bg-white/30"></div>
              <div className="absolute inset-0 transform scale-75 -rotate-45 rounded-full bg-white/20"></div>
            </div>
            <h1 className="text-xl font-bold font-montserrat">Panel de Administración</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center p-2 text-white rounded-md hover:bg-primary-light"
            >
              <LogOut size={18} className="mr-2" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              <Home size={16} className="mr-1" /> Panel
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link
              href="/admin/documentos"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              Documentos
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Nuevo Documento</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <button
              onClick={handleGuardarDocumento}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            {documento.titulo && documento.contenido && (
              <PDFDownloadLink
                document={<DocumentoPDF documento={documento} />}
                fileName={`${documento.titulo.replace(/\s+/g, '_')}.pdf`}
                className={`bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center`}
              >
                {({ blob, url, loading, error }) =>
                  loading ?
                    <span><span className="inline-block w-4 h-4 mr-2 border-t-2 border-white rounded-full animate-spin"></span> Generando PDF...</span> :
                    <span><Download size={18} className="mr-2" /> Descargar PDF</span>
                }
              </PDFDownloadLink>
            )}
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Nuevo Documento
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {/* Información básica */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Documento</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Título *</label>
                <input
                  type="text"
                  value={documento.titulo}
                  onChange={(e) => setDocumento({ ...documento, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Ej: CERTIFICACIÓN, CARTA, etc."
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={documento.fecha}
                  onChange={(e) => setDocumento({ ...documento, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contenido del documento */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Contenido del Documento *</h3>
            
            {/* Vista móvil - Botón que abre modal */}
            <div className="md:hidden">
              <div 
                onClick={abrirModalContenido}
                className="min-h-[150px] p-3 border border-gray-300 rounded-md bg-gray-50 cursor-pointer flex items-start justify-between transition-colors hover:bg-gray-100"
              >
                <span className={`text-sm flex-1 ${documento.contenido ? 'text-gray-800' : 'text-gray-400'}`}>
                  {documento.contenido || 'Toca para agregar el contenido del documento'}
                </span>
                <svg className="flex-shrink-0 w-5 h-5 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              {/* Preview del texto si existe */}
              {documento.contenido && (
                <div className="mt-2 text-xs text-gray-500">
                  {documento.contenido.length} caracteres
                </div>
              )}
            </div>
            
            {/* Vista desktop - Textarea normal */}
            <div className="hidden md:block">
              <textarea
                value={documento.contenido}
                onChange={(e) => setDocumento({ ...documento, contenido: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[300px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Escriba aquí el contenido completo del documento. Este texto aparecerá en el cuerpo de la hoja membretada."
                rows={12}
                required
              />
              <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                <span>{documento.contenido.length} caracteres</span>
                <span className="text-xs text-gray-400">El texto se ajustará automáticamente en el PDF</span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => router.push('/admin/documentos')}
              className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardarDocumento}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar Documento'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal para editar contenido (móvil) */}
      {modalContenido.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col w-full h-full bg-white md:w-11/12 md:h-5/6 md:rounded-lg md:max-w-4xl">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 md:rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Contenido del documento</h3>
              <button
                onClick={() => setModalContenido({ isOpen: false, value: '' })}
                className="p-2 text-gray-500 transition-colors hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Contenido del modal */}
            <div className="flex flex-col flex-1 p-4 bg-white md:rounded-b-lg">
              <textarea
                value={modalContenido.value}
                onChange={(e) => setModalContenido({ ...modalContenido, value: e.target.value })}
                className="flex-1 w-full p-4 text-base border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Escriba aquí el contenido completo del documento..."
                autoFocus
                style={{ minHeight: '200px' }}
              />
              
              {/* Contador de caracteres */}
              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <span>{modalContenido.value.length} caracteres</span>
                <span className="text-xs text-gray-400">El texto se ajustará automáticamente en el PDF</span>
              </div>
              
              {/* Botones del modal */}
              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={() => setModalContenido({ isOpen: false, value: '' })}
                  className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarContenido}
                  className="px-6 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}