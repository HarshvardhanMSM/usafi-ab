import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { Button } from '../ui/Button';

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'Failed to load data from server. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-red-50/50 border border-red-100 rounded-2xl ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
        <FiAlertCircle size={26} />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-600 max-w-md">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" icon={FiRefreshCw} onClick={onRetry} className="mt-4">
          Try Again
        </Button>
      )}
    </div>
  );
};
