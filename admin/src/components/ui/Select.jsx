import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

export const Select = React.forwardRef(({
  label,
  options = [],
  error,
  helperText,
  required = false,
  className = '',
  id,
  placeholder = 'Select option...',
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`w-full h-11 px-4 pr-10 bg-white border ${
            error ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
          } rounded-xl text-sm text-slate-900 outline-none focus:ring-4 appearance-none transition duration-200 disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <FiChevronDown size={18} />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';
