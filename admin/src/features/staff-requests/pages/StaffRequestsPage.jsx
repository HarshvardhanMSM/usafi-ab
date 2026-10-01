import React, { useState } from 'react';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { Card } from '../../../components/ui/Card';
import { Table } from '../../../components/tables/Table';
import { Pagination } from '../../../components/tables/Pagination';
import { SearchInput } from '../../../components/ui/SearchInput';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { usePagination } from '../../../hooks/usePagination';
import { useToast } from '../../../hooks/useToast';
import {
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiCheck,
  FiX,
  FiMapPin,
  FiCalendar,
} from 'react-icons/fi';

export const StaffRequestsPage = () => {
  const toast = useToast();
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionConfirm, setActionConfirm] = useState(null); // { type: 'approve'|'decline', item }

  const [requests, setRequests] = useState([
    { id: 1, name: 'John Smith', role: 'Cleaner', shift: 'Morning Cleaning', date: 'Sep 24, 2026', time: '08:00 AM - 04:00 PM', location: 'Jaipur JEC', pay: '$18 / hr', applied: 'Sep 23, 2026', status: 'Pending' },
    { id: 2, name: 'Sarah Wilson', role: 'Supervisor', shift: 'Site Supervisor', date: 'Sep 25, 2026', time: '09:00 AM - 05:00 PM', location: 'City Mall Jaipur', pay: '$25 / hr', applied: 'Sep 23, 2026', status: 'Approved' },
    { id: 3, name: 'Mike Brown', role: 'Cleaner', shift: 'Evening Cleaning', date: 'Sep 26, 2026', time: '04:00 PM - 10:00 PM', location: 'Grand Hotel', pay: '$18 / hr', applied: 'Sep 22, 2026', status: 'Declined' },
    { id: 4, name: 'Emma Davis', role: 'Security Guard', shift: 'Security Guard', date: 'Sep 27, 2026', time: '08:00 AM - 06:00 PM', location: 'Royal Palace', pay: '$22 / hr', applied: 'Sep 23, 2026', status: 'Pending' },
    { id: 5, name: 'Daniel Lee', role: 'Cleaner', shift: 'Deep Cleaning', date: 'Sep 28, 2026', time: '10:00 AM - 06:00 PM', location: 'Industrial Area', pay: '$20 / hr', applied: 'Sep 22, 2026', status: 'Pending' },
  ]);

  const filteredRequests = requests.filter((req) => {
    const matchesFilter = activeFilter === 'All' ? true : req.status === activeFilter;
    const matchesSearch =
      req.name.toLowerCase().includes(search.toLowerCase()) ||
      req.shift.toLowerCase().includes(search.toLowerCase()) ||
      req.role.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const { currentPage, totalPages, currentData, goToPage, totalItems, itemsPerPage } = usePagination(filteredRequests, 5);

  const handleActionExecute = () => {
    if (!actionConfirm) return;
    const newStatus = actionConfirm.type === 'approve' ? 'Approved' : 'Declined';
    setRequests((prev) =>
      prev.map((r) => (r.id === actionConfirm.item.id ? { ...r, status: newStatus } : r))
    );
    toast.success(`Request ${newStatus.toLowerCase()} for ${actionConfirm.item.name}`);
    setActionConfirm(null);
    setSelectedRequest(null);
  };

  const columns = [
    {
      header: 'Staff Member',
      key: 'name',
      render: (_, row) => (
        <div>
          <p className="font-bold text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{row.role}</p>
        </div>
      ),
    },
    {
      header: 'Shift & Pay',
      key: 'shift',
      render: (_, row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.shift}</p>
          <p className="text-xs font-semibold text-blue-600 mt-0.5">{row.pay}</p>
        </div>
      ),
    },
    {
      header: 'Date & Time',
      key: 'date',
      render: (_, row) => (
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <FiCalendar size={13} className="text-slate-400" />
            <span>{row.date}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{row.time}</p>
        </div>
      ),
    },
    {
      header: 'Location',
      key: 'location',
      render: (loc) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <FiMapPin size={13} className="text-slate-400" />
          <span>{loc}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" icon={FiEye} onClick={() => setSelectedRequest(row)}>
            Review
          </Button>
          {row.status === 'Pending' && (
            <>
              <Button variant="secondary" size="sm" icon={FiCheck} onClick={() => setActionConfirm({ type: 'approve', item: row })}>
                Approve
              </Button>
              <Button variant="danger" size="sm" icon={FiX} onClick={() => setActionConfirm({ type: 'decline', item: row })}>
                Decline
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Staff Shift Requests"
        subtitle="Review and process incoming shift applications from workers."
      />

      {/* Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Requests" value="24" icon={FiUsers} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Pending Review" value="8" icon={FiClock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Approved Shifts" value="12" icon={FiCheckCircle} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Declined Requests" value="4" icon={FiXCircle} iconBg="bg-red-50" iconColor="text-red-600" />
      </div>

      {/* Main Table Card */}
      <Card padding="p-0">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff or shift..."
            className="w-full sm:w-80"
          />
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['All', 'Pending', 'Approved', 'Declined'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <Table columns={columns} data={currentData} keyField="id" onRowClick={(row) => setSelectedRequest(row)} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
        />
      </Card>

      {/* Request Details Modal */}
      {selectedRequest && (
        <Modal isOpen={Boolean(selectedRequest)} onClose={() => setSelectedRequest(null)} title="Staff Request Details">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                {selectedRequest.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{selectedRequest.name}</h3>
                <p className="text-xs text-slate-500">{selectedRequest.role}</p>
                <div className="mt-1">
                  <StatusBadge status={selectedRequest.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-1">Shift Name</span>
                <span className="font-bold text-slate-800">{selectedRequest.shift}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-1">Pay Rate</span>
                <span className="font-bold text-blue-600">{selectedRequest.pay}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-1">Date & Time</span>
                <span className="font-bold text-slate-800">{selectedRequest.date} ({selectedRequest.time})</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-1">Location</span>
                <span className="font-bold text-slate-800">{selectedRequest.location}</span>
              </div>
            </div>

            {selectedRequest.status === 'Pending' && (
              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <Button
                  variant="primary"
                  icon={FiCheck}
                  className="flex-1"
                  onClick={() => setActionConfirm({ type: 'approve', item: selectedRequest })}
                >
                  Approve Request
                </Button>
                <Button
                  variant="danger"
                  icon={FiX}
                  className="flex-1"
                  onClick={() => setActionConfirm({ type: 'decline', item: selectedRequest })}
                >
                  Decline
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Action Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(actionConfirm)}
        onClose={() => setActionConfirm(null)}
        onConfirm={handleActionExecute}
        title={actionConfirm?.type === 'approve' ? 'Approve Shift Request' : 'Decline Shift Request'}
        description={`Are you sure you want to ${actionConfirm?.type} the shift request for ${actionConfirm?.item?.name}?`}
        confirmText={actionConfirm?.type === 'approve' ? 'Approve' : 'Decline'}
        variant={actionConfirm?.type === 'approve' ? 'primary' : 'danger'}
      />
    </div>
  );
};
