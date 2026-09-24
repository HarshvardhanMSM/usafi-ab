import React from 'react';
import { FiLoader } from 'react-icons/fi';

export const LoadingState = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-slate-500 ${className}`}>
      <FiLoader className="animate-spin text-blue-600 mb-3" size={32} />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};
