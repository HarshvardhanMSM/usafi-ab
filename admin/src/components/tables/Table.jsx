import React from 'react';
import { EmptyState } from '../feedback/EmptyState';
import { Skeleton } from '../feedback/Skeleton';

export const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no records to display at this time.',
  keyField = 'id',
  onRowClick,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
            {columns.map((col, i) => (
              <th
                key={col.key || i}
                className={`px-5 py-3.5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, rowIndex) => (
            <tr
              key={row[keyField] || rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={`transition duration-150 ${
                onRowClick ? 'cursor-pointer hover:bg-blue-50/30' : 'hover:bg-slate-50/60'
              }`}
            >
              {columns.map((col, colIndex) => (
                <td
                  key={col.key || colIndex}
                  className={`px-5 py-4 text-sm text-slate-700 ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
