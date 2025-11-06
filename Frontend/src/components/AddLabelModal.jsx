// Frontend/src/components/AddLabelModal.jsx
import React, { useState, useEffect } from 'react';

const AddLabelModal = ({ existingLabels = [], onSave, onClose }) => {
  const [labels, setLabels] = useState(existingLabels);
  const [inputValue, setInputValue] = useState('');

  // Update internal state if the initial labels change
  useEffect(() => {
    setLabels(existingLabels);
  }, [existingLabels]);

  const handleAddLabel = (e) => {
    e.preventDefault();
    if (inputValue && !labels.includes(inputValue)) {
      setLabels([...labels, inputValue.trim()]);
      setInputValue(''); // Clear input
    }
  };

  const handleRemoveLabel = (labelToRemove) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  const handleSave = () => {
    onSave(labels);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-4">Edit Labels</h3>
        
        <form onSubmit={handleAddLabel} className="flex gap-2 mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a label..."
            className="flex-grow bg-gray-700 text-white rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md">
            Add
          </button>
        </form>

        <div className="flex flex-wrap gap-2 min-h-[40px] mb-6">
          {labels.map(label => (
            <div key={label} className="bg-gray-600 text-white text-sm font-medium px-2.5 py-1 rounded-full flex items-center gap-2">
              <span>{label}</span>
              <button onClick={() => handleRemoveLabel(label)} className="text-gray-300 hover:text-white">
                &times;
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-md">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLabelModal;