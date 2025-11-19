// Frontend/src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-transparent">
      <div className="flex items-end gap-1 h-8">
        <div className="w-1.5 bg-blue-500 animate-[bounce_1s_infinite] h-6 rounded-full"></div>
        <div className="w-1.5 bg-purple-500 animate-[bounce_1s_infinite] delay-100 h-10 rounded-full"></div>
        <div className="w-1.5 bg-white animate-[bounce_1s_infinite] delay-200 h-8 rounded-full"></div>
        <div className="w-1.5 bg-red-500 animate-[bounce_1s_infinite] delay-150 h-10 rounded-full"></div>
        <div className="w-1.5 bg-blue-500 animate-[bounce_1s_infinite] delay-75 h-6 rounded-full"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

