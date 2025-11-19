// Frontend/src/components/Toolbar.jsx
import React, { useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Heading2, 
  List, 
  ListOrdered,
  Quote,
  Code
} from 'lucide-react';

const Toolbar = ({ editor }) => {
  // 1. Add local state to force re-render
  const [, setTick] = useState(0);

  // 2. Listen to editor events to trigger updates immediately
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setTick(prev => prev + 1);
    };

    // 'transaction' fires on every state change (cursor move, formatting change, typing)
    editor.on('transaction', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);

    return () => {
      editor.off('transaction', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  // Helper to define button classes based on active state
  const getButtonClass = (isActive) => 
    `p-2 rounded-lg transition-all duration-200 flex items-center justify-center
     ${isActive 
       ? 'bg-blue-600/20 text-blue-400' 
       : 'text-gray-400 hover:text-white hover:bg-gray-800'
     }`;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={getButtonClass(editor.isActive('bold'))}
        title="Bold"
      >
        <Bold size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={getButtonClass(editor.isActive('italic'))}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-800 mx-2"></div>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={getButtonClass(editor.isActive('heading', { level: 2 }))}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={getButtonClass(editor.isActive('bulletList'))}
        title="Bullet List"
      >
        <List size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={getButtonClass(editor.isActive('orderedList'))}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-800 mx-2"></div>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={getButtonClass(editor.isActive('blockquote'))}
        title="Quote"
      >
        <Quote size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={getButtonClass(editor.isActive('codeBlock'))}
        title="Code Block"
      >
        <Code size={18} />
      </button>
    </div>
  );
};

export default Toolbar;