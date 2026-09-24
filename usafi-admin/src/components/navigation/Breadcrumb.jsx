import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import { ROUTES } from '../../constants/routes';

export const Breadcrumb = ({ items, className = '' }) => {
  const location = useLocation();

  const generatedItems = items || (() => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    return pathnames.map((value, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = value
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      return { label, to };
    });
  })();

  return (
    <nav className={`flex items-center gap-1.5 text-xs text-slate-500 font-medium ${className}`} aria-label="Breadcrumb">
      <Link to={ROUTES.DASHBOARD} className="flex items-center gap-1 hover:text-slate-800 transition">
        <FiHome size={14} />
        <span>Dashboard</span>
      </Link>

      {generatedItems.map((item, index) => {
        const isLast = index === generatedItems.length - 1;
        return (
          <React.Fragment key={index}>
            <FiChevronRight size={13} className="text-slate-400 shrink-0" />
            {isLast || !item.to ? (
              <span className="font-semibold text-slate-800">{item.label}</span>
            ) : (
              <Link to={item.to} className="hover:text-slate-800 transition">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
