// Frontend/src/components/Toolbar.jsx
import React from 'react';

const Toolbar = ({ editor }) => {
  // 👉 Add a check to see if the editor has been destroyed
  if (!editor || editor.isDestroyed) {
    return null;
  }

  return (
    <div className="bg-gray-700 p-2 rounded-md mb-2 flex items-center gap-2">
      {/* Bold Button */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded ${editor.isActive('bold') ? 'bg-indigo-500' : 'hover:bg-gray-600'}`}
      >
        <span className="font-bold">B</span>
      </button>

      {/* Italic Button */}
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded ${editor.isActive('italic') ? 'bg-indigo-500' : 'hover:bg-gray-600'}`}
      >
        <span className="italic">I</span>
      </button>
      
      {/* Heading Button (H2) */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-500' : 'hover:bg-gray-600'}`}
      >
        <span className="font-bold">H2</span>
      </button>

      {/* Bullet List Button */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-indigo-500' : 'hover:bg-gray-600'}`}
      >
        List
      </button>
    </div>
  );
};

export default Toolbar;