// Frontend/src/components/ShareNoteModal.jsx
import React, { useState } from 'react';

const ShareNoteModal = ({ isOpen, onShare, onClose }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      onShare(email);
    }
  };

  return (
    <div 
      className={`
        fixed inset-0 bg-black/50 bg-opacity-70 z-50 flex justify-center items-center
        transition-opacity duration-300 ease-in-out
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
      onClick={onClose} 
    >
      <div 
        className={`
          bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
        `}
        onClick={e => e.stopPropagation()} 
      >
        <h3 className="text-xl font-bold text-white mb-4">Share Note</h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="email-share" className="text-gray-300 text-sm">
            Enter the email of the user you want to share with:
          </label>
          <input
            type="email"
            id="email-share"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
            className="bg-gray-700 text-white rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md"
            >
              Share
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareNoteModal;