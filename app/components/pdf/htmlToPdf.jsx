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
      return (
        <Text key={key} style={estilos.titulo}>
          {renderInline(Array.from(nodo.childNodes), key, estilos)}
        </Text>
      );
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(nodo.childNodes).filter((n) => n.tagName?.toLowerCase() === 'li');
      return (
        <View key={key} style={estilos.lista}>
          {items.map((li, j) => (
            <View key={j} style={estilos.itemLista}>
              <Text style={estilos.vinieta}>{tag === 'ol' ? `${j + 1}.` : '•'}</Text>
              <Text style={estilos.textoItemLista}>
                {renderInline(Array.from(li.childNodes), `${key}-${j}`, estilos)}
              </Text>
            </View>
          ))}
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
        {contenido.length > 0 ? contenido : ' '}
      </Text>
    );
  });
}
