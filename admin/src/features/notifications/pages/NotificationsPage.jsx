import React from 'react';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { FiBell } from 'react-icons/fi';

export const NotificationsPage = () => {
  const notificationsList = [
    { id: 1, title: 'New Staff Request Submitted', desc: 'John Smith applied for Morning Cleaning Shift (Jaipur JEC).', time: '10 mins ago', type: 'Request', isRead: false },
    { id: 2, title: 'Document Verification Uploaded', desc: 'Sarah Wilson uploaded updated Police Clearance Certificate.', time: '1 hour ago', type: 'Document', isRead: false },
    { id: 3, title: 'Shift Fully Staffed', desc: 'Commercial Cleaning shift reached full allocation capacity.', time: '3 hours ago', type: 'Shift', isRead: true },
    { id: 4, title: 'GPS Check-In Geofence Alert', desc: 'Michael Brown checked in 250m outside designated boundary.', time: '5 hours ago', type: 'Attendance', isRead: true },
  ];

  return (
    <div>
      <PageHeader
        title="System Notifications"
        subtitle="View all administrative alerts, shift updates, and worker activities."
      />

      <Card padding="p-0">
        <div className="divide-y divide-slate-100">
          {notificationsList.map((n) => (
            <div key={n.id} className={`p-4 flex items-start justify-between gap-4 transition ${!n.isRead ? 'bg-blue-50/20' : 'hover:bg-slate-50/50'}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FiBell size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{n.desc}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                </div>
              </div>
              <StatusBadge status={n.isRead ? 'Completed' : 'Pending'} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
