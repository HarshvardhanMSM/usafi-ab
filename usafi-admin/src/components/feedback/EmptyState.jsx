import React from 'react';
import { FiInbox } from 'react-icons/fi';
import { Button } from '../ui/Button';

export const EmptyState = ({
  title = 'No records found',
  description = 'Try adjusting your filters or search terms.',
  icon: Icon = FiInbox,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-xs mb-4">
        <Icon size={28} />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
