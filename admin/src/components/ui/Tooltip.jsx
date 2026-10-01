import React, { useState } from 'react';

export const Tooltip = ({ text, children, position = 'top' }) => {
  const [show, setShow] = useState(false);

  if (!text) return children;

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className={`absolute z-50 px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 rounded-lg whitespace-nowrap shadow-md pointer-events-none transition-opacity duration-150 ${positions[position] || positions.top}`}>
          {text}
        </div>
      )}
    </div>
  );
};
