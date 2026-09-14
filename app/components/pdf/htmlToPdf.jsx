// app/components/pdf/htmlToPdf.jsx
import React from 'react';
import { Text, View } from '@react-pdf/renderer';

// Convierte el HTML que genera RichTextEditor (Tiptap) a elementos de
// @react-pdf/renderer, para poder imprimir en el PDF la misma negrita,
// títulos y viñetas que se ven en el editor. No es un parser HTML genérico:
// solo entiende las etiquetas que StarterKit puede producir (p, strong, em,
// h2, h3, ul, ol, li, br). Documentos guardados antes del editor enriquecido
// siguen siendo texto plano y no pasan por acá (ver esHtmlEnriquecido en
// app/lib/richText.js).
//
// Corre siempre en el navegador: estos PDFs se generan del lado del cliente
// vía PDFDownloadLink, nunca en el servidor, así que DOMParser está
// disponible.

const renderInline = (nodos, keyPrefix, estilos) => {
  const elementos = [];
  nodos.forEach((nodo, i) => {
    const key = `${keyPrefix}-${i}`;
    if (nodo.nodeType === Node.TEXT_NODE) {
      if (nodo.textContent) elementos.push(nodo.textContent);
      return;
    }
    const tag = nodo.tagName?.toLowerCase();
    if (tag === 'br') {
      elementos.push('\n');
      return;
    }
    if (tag === 'strong' || tag === 'b') {
      elementos.push(
        <Text key={key} style={estilos.negrita}>
          {renderInline(Array.from(nodo.childNodes), key, estilos)}
        </Text>
      );
      return;
    }
    if (tag === 'em' || tag === 'i') {
      elementos.push(
        <Text key={key} style={estilos.cursiva}>
          {renderInline(Array.from(nodo.childNodes), key, estilos)}
        </Text>
      );
      return;
    }
    // Etiqueta no soportada: se ignora el tag pero se conserva el texto.
    elementos.push(...renderInline(Array.from(nodo.childNodes || []), key, estilos));
  });
  return elementos;
};

// Un <p><br></p> (línea en blanco dejada por Enter, o un título vacío como
// <h2></h2>) produce un array de contenido con un único string "\n" -- no
// está vacío (length > 0), pero tampoco tiene ningún carácter visible.
// @react-pdf/renderer puede colgarse indefinidamente al paginar un <Text>
// cuyo contenido es así de degenerado (visto en producción: pasaba solo
// cuando ese bloque caía cerca de otro con wrap={false}, como las firmas).
// Por eso hace falta detectar "en blanco" por contenido real, no por
// longitud de array, y en ese caso reemplazar por un espacio simple.
const esContenidoEnBlanco = (contenido) =>
  contenido.every((item) => typeof item === 'string' && item.trim() === '');

// `estilos` debe traer: parrafo, titulo, lista, itemLista, vinieta,
// textoItemLista, negrita, cursiva.
export function renderHtmlEnriquecidoParaPdf(html, estilos) {
  if (typeof window === 'undefined' || !html) return null;

  const documento = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const bloques = Array.from(documento.body.firstChild?.childNodes || []);

  return bloques.map((nodo, i) => {
    const key = `bloque-${i}`;
    const tag = nodo.tagName?.toLowerCase();

    if (tag === 'h2' || tag === 'h3') {
      const contenidoTitulo = renderInline(Array.from(nodo.childNodes), key, estilos);
      return (
        <Text key={key} style={estilos.titulo}>
          {esContenidoEnBlanco(contenidoTitulo) ? ' ' : contenidoTitulo}
        </Text>
      );
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(nodo.childNodes).filter((n) => n.tagName?.toLowerCase() === 'li');
      return (
        <View key={key} style={estilos.lista}>
          {items.map((li, j) => {
            const contenidoItem = renderInline(Array.from(li.childNodes), `${key}-${j}`, estilos);
            return (
              <View key={j} style={estilos.itemLista}>
                <Text style={estilos.vinieta}>{tag === 'ol' ? `${j + 1}.` : '•'}</Text>
                <Text style={estilos.textoItemLista}>
                  {esContenidoEnBlanco(contenidoItem) ? ' ' : contenidoItem}
                </Text>
              </View>
            );
          })}
        </View>
      );
    }

    if (!tag) {
      // Nodo de texto suelto (fuera de un <p>), poco común pero posible.
      return nodo.textContent ? (
        <Text key={key} style={estilos.parrafo}>{nodo.textContent}</Text>
      ) : null;
    }

    // <p> y cualquier otra etiqueta de bloque no contemplada: párrafo normal.
    const contenido = renderInline(Array.from(nodo.childNodes), key, estilos);
    return (
      <Text key={key} style={estilos.parrafo}>
        {esContenidoEnBlanco(contenido) ? ' ' : contenido}
      </Text>
    );
  });
}
