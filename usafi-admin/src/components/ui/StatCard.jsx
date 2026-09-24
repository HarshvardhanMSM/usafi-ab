import React from 'react';
import { Card } from './Card';

export const StatCard = ({
  title,
  value,
  change,
  changeText,
  icon: Icon,
  iconBg = 'bg-blue-50',
  iconColor = 'text-blue-600',
  isPositive = true,
  className = '',
}) => {
  return (
    <Card padding="p-5" className={`hover:border-slate-300 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
          {(change || changeText) && (
            <div className="flex items-center gap-1.5 mt-2">
              {change && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                  isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {isPositive ? '+' : ''}{change}
                </span>
              )}
              {changeText && <span className="text-xs text-slate-400">{changeText}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
            {typeof Icon === 'function' ? <Icon size={20} /> : Icon}
          </div>
        )}
      </div>
    </Card>
  );
};
