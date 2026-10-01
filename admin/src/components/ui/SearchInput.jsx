import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  ...props
}) => {
  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
        <FiSearch size={18} />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-9 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={onClear || (() => onChange({ target: { value: '' } }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
};
