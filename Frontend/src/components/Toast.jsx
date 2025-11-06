// Frontend/src/components/Toast.jsx
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';

const Toast = ({ isOpen, message, onUndo, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 24 }}
          animate={{ opacity: 1, y: 0, x: 24 }}
          exit={{ opacity: 0, y: 20, x: 24 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed bottom-6 left-0 z-50 bg-gray-800 border border-gray-700 text-white py-3 px-5 rounded-lg shadow-xl flex items-center justify-between min-w-[250px]"
        >
          <span>{message}</span>
          <div className="flex items-center gap-4 ml-6">
            <button
              onClick={onUndo}
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              Undo
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-lg leading-none"
            >
              &times;
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;