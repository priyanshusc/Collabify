// Frontend/src/components/ColorPalette.jsx
import React, { useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'; // 👉 Add this import line

const colors = [
  '#2d3748', '#9B2C2C', '#975A16', '#9D5518',
  '#2F855A', '#2C5282', '#5A388C', '#805AD5',
];

const ColorPalette = ({ onSelect, onClose, position }) => {
  const paletteRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target)) {
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
      ref={paletteRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute z-50 bg-gray-700 rounded-lg shadow-xl p-2 border border-white/10"
      style={{ top: position.top, left: position.left }}
    >
      <div className="grid grid-cols-4 gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white transition"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ColorPalette;