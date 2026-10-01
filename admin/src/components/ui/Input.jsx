import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  required = false,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full h-11 ${Icon ? 'pl-10' : 'px-4'} pr-4 bg-white border ${
            error ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
          } rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 transition duration-200 disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
