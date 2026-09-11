// app/lib/richText.js
//
// Documentos guardados antes de que existiera el editor de texto enriquecido
// tienen "descripcionTrabajo" como texto plano (con \n como salto de línea).
// Los nuevos se guardan como HTML generado por Tiptap (RichTextEditor). Estas
// funciones permiten que ambos formatos convivan: se detecta cuál es y se
// convierte a donde haga falta (editor, vista de solo lectura, PDF).

// Heurística simple: si contiene una etiqueta HTML es porque viene del editor
// enriquecido; el texto plano legado no tiene "<...>".
export function esHtmlEnriquecido(valor) {
  return typeof valor === 'string' && /<\/?[a-z][\s\S]*>/i.test(valor);
}

const escaparHtml = (texto) => texto
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

// Convierte texto plano legado a HTML equivalente (párrafos separados por
// líneas en blanco, saltos de línea simples como <br>) para poder cargarlo
// en el editor sin que Tiptap lo aplaste todo en una sola línea.
export function textoPlanoAHtml(texto) {
  if (!texto) return '';
  return texto
    .split(/\n{2,}/)
    .map((parrafo) => `<p>${escaparHtml(parrafo).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

// Contenido inicial a pasarle al editor: si ya es HTML enriquecido se usa
// tal cual, si es texto plano legado se convierte primero.
export function contenidoInicialEditor(valor) {
  if (!valor) return '';
  return esHtmlEnriquecido(valor) ? valor : textoPlanoAHtml(valor);
}
