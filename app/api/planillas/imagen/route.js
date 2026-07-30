// app/api/planillas/imagen/route.js
import { NextResponse } from 'next/server';

// Trae el contenido de una foto de Firebase Storage desde el servidor.
// El navegador no puede leer los bytes de un fetch() directo a Storage
// porque el bucket no tiene CORS habilitado (aunque un <img src> normal sí
// funciona, ya que la carga de imágenes no está sujeta a CORS). Acá el fetch
// corre en el servidor, donde CORS no aplica, y se le devuelve el archivo ya
// resuelto al cliente para armar el PDF de la Orden de Trabajo.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Falta el parámetro url.' }, { status: 400 });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: 'URL inválida.' }, { status: 400 });
  }

  // Solo se permite reenviar URLs de Firebase Storage, para que esta ruta no
  // se pueda usar como proxy genérico hacia cualquier sitio.
  if (parsedUrl.hostname !== 'firebasestorage.googleapis.com') {
    return NextResponse.json({ error: 'Solo se permiten URLs de Firebase Storage.' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: 'No se pudo obtener la imagen.' }, { status: 502 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error al obtener la imagen de Storage:', error);
    return NextResponse.json({ error: 'No se pudo obtener la imagen.' }, { status: 500 });
  }
}
