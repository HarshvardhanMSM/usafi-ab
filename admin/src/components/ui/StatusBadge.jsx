import React from 'react';

const STATUS_MAP = {
  // Staff & Admin Users
  Active: { label: 'Active', variant: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Inactive: { label: 'Inactive', variant: 'bg-slate-100 text-slate-600 border-slate-200' },

  // Staff Requests & Approvals
  Pending: { label: 'Pending', variant: 'bg-amber-50 text-amber-700 border-amber-200' },
  Approved: { label: 'Approved', variant: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Declined: { label: 'Declined', variant: 'bg-red-50 text-red-700 border-red-200' },
  Rejected: { label: 'Rejected', variant: 'bg-red-50 text-red-700 border-red-200' },

  // Shifts
  Open: { label: 'Open', variant: 'bg-amber-50 text-amber-700 border-amber-200' },
  Filled: { label: 'Filled', variant: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Completed: { label: 'Completed', variant: 'bg-blue-50 text-blue-700 border-blue-200' },
  Cancelled: { label: 'Cancelled', variant: 'bg-slate-100 text-slate-600 border-slate-200' },

  // Compliance & Documents
  Verified: { label: 'Verified', variant: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Compliant: { label: 'Compliant', variant: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Missing: { label: 'Missing', variant: 'bg-red-50 text-red-700 border-red-200' },
  Expiring: { label: 'Expiring', variant: 'bg-amber-50 text-amber-700 border-amber-200' },

  // Attendance
  Present: { label: 'Present', variant: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Late: { label: 'Late', variant: 'bg-amber-50 text-amber-700 border-amber-200' },
  Absent: { label: 'Absent', variant: 'bg-red-50 text-red-700 border-red-200' },
  'On Break': { label: 'On Break', variant: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export const StatusBadge = ({ status, className = '' }) => {
  const config = STATUS_MAP[status] || {
    label: status,
    variant: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.variant} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {config.label}
    </span>
  );
};
