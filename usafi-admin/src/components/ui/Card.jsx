import React from 'react';

export const Card = ({
  children,
  className = '',
  header,
  footer,
  padding = 'p-6',
  ...props
}) => {
  return (
    <div className={`bg-white border border-slate-200/80 rounded-2xl shadow-xs transition duration-200 ${className}`} {...props}>
      {header && <div className="p-5 border-b border-slate-100">{header}</div>}
      <div className={padding}>{children}</div>
      {footer && <div className="p-4 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl">{footer}</div>}
    </div>
  );
};
