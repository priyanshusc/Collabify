// Frontend/src/components/TiptapEditor.jsx
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

const TiptapEditor = ({ content, onChange, onEditorReady }) => { // 👉 Add onEditorReady prop
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your masterpiece...',
      }),
    ],
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      // Pass the editor instance to the parent component
      onEditorReady(editor); // 👉 Call the new prop
      
      const editorContent = editor.getHTML();
      if (content !== editorContent) {
        editor.commands.setContent(content, false);
      }
    }
  }, [content, editor, onEditorReady]);

  return <EditorContent editor={editor} />;
};

export default TiptapEditor;