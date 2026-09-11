// app/components/ui/RichTextEditor.jsx
'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Heading2, List, ListOrdered } from 'lucide-react';
import { contenidoInicialEditor } from '../../lib/richText';

// Editor de texto enriquecido (negrita, títulos, viñetas) para campos tipo
// "Descripción del trabajo realizado". Guarda y devuelve HTML por onChange;
// ver app/lib/richText.js para la convivencia con documentos viejos en texto
// plano.
export default function RichTextEditor({ value, onChange, placeholder, minHeight = '220px' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] }
      }),
      Placeholder.configure({ placeholder: placeholder || '' })
    ],
    content: contenidoInicialEditor(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'rich-text-content focus:outline-none'
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    }
  });

  // Si el valor cambia desde afuera (p. ej. termina de cargar el documento
  // desde Firestore después de montar el editor), sincronizamos el
  // contenido sin pisar lo que el usuario esté escribiendo.
  useEffect(() => {
    if (!editor) return;
    const htmlActual = editor.getHTML();
    const htmlNuevo = contenidoInicialEditor(value);
    if (htmlNuevo !== htmlActual && !(htmlNuevo === '' && htmlActual === '<p></p>')) {
      editor.commands.setContent(htmlNuevo, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const claseBoton = (activo) =>
    `p-2 rounded-md transition-colors ${activo ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`;

  return (
    <div className="border border-gray-300 rounded-md">
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 rounded-t-md bg-gray-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={claseBoton(editor.isActive('bold'))}
          title="Negrita"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={claseBoton(editor.isActive('italic'))}
          title="Cursiva"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={claseBoton(editor.isActive('heading', { level: 2 }))}
          title="Título"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={claseBoton(editor.isActive('bulletList'))}
          title="Viñetas"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={claseBoton(editor.isActive('orderedList'))}
          title="Lista numerada"
        >
          <ListOrdered size={16} />
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="px-3 py-2 overflow-y-auto text-sm text-gray-800"
        style={{ minHeight, maxHeight: '60vh' }}
      />
    </div>
  );
}
