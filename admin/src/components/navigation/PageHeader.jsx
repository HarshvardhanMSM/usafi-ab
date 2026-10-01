import React from 'react';
import { Breadcrumb } from './Breadcrumb';

export const PageHeader = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className = '',
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <Breadcrumb items={breadcrumbs} className="mb-2" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
