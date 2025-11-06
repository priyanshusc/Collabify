import React, { useEffect, useRef } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const NoteOptionsMenu = ({ onClose, onCopy, position, onAddLabel, onMoveToBin }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={menuRef} // Attach the ref to the menu
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50 bg-gray-700 rounded-md shadow-xl py-1 w-36 border border-white/10"
      style={{ top: position.top, left: position.left }}
    >
      <button
        onClick={() => {
          onCopy();
          onClose(); // Close menu after action
        }}
        className="w-full text-left px-3 py-1.5 text-sm text-gray-200 hover:bg-white/10"
      >
        Make a copy
      </button>
      <button
        onClick={onAddLabel} // Use the new prop here
        className="w-full text-left px-3 py-1.5 text-sm text-gray-200 hover:bg-white/10"
      >
        Add label
      </button>
      <button
        onClick={() => {
          onMoveToBin();
          onClose();
        }}
        className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-white/10"
      >
        Move to bin
      </button>
    </motion.div>
  );
};

export default NoteOptionsMenu;