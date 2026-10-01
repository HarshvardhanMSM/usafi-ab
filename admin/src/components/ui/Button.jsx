import React from 'react';
import { FiLoader } from 'react-icons/fi';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500 shadow-sm',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus:ring-slate-400',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus:ring-slate-400 shadow-xs',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400',
    dark: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 focus:ring-slate-700 shadow-sm',
  };

  const sizes = {
    sm: 'h-9 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <FiLoader className="animate-spin text-current" size={size === 'sm' ? 14 : 18} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 18} className="shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
