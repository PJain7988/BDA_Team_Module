// frontend/src/components/LoadingSpinner.jsx
import React from 'react';

function LoadingSpinner({ size = 'md', fullPage = false }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const spinner = (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}></div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;
