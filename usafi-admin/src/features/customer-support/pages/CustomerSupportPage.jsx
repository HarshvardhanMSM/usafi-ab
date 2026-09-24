import React, { useState } from 'react';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { Card } from '../../../components/ui/Card';
import { Table } from '../../../components/tables/Table';
import { Pagination } from '../../../components/tables/Pagination';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Select } from '../../../components/ui/Select';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { usePagination } from '../../../hooks/usePagination';
import { useToast } from '../../../hooks/useToast';
import { FiMessageSquare, FiClock, FiCheckCircle, FiEye, FiCheck } from 'react-icons/fi';

export const CustomerSupportPage = () => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [tickets, setTickets] = useState([
    { id: 'TKT-0008', subject: 'Unable to login to worker mobile app', category: 'Account Issue', priority: 'High', customer: 'Sara Sharma (sara@example.com)', status: 'Pending' },
    { id: 'TKT-0009', subject: 'GPS Check-in location mismatch inquiry', category: 'Attendance', priority: 'Medium', customer: 'John Smith (john@gmail.com)', status: 'Approved' },
    { id: 'TKT-0010', subject: 'Updated bank account mandate submission', category: 'Payroll', priority: 'Low', customer: 'Michael Brown (mike@gmail.com)', status: 'Approved' },
  ]);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const { currentPage, totalPages, currentData, goToPage, totalItems, itemsPerPage } = usePagination(filteredTickets, 5);

  const handleResolve = (id) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'Approved' } : t)));
    toast.success('Support ticket marked as resolved');
    setSelectedTicket(null);
  };

  const columns = [
    { header: 'Ticket #', key: 'id', render: (val) => <span className="font-mono font-bold text-blue-600">{val}</span> },
    { header: 'Subject', key: 'subject', render: (val) => <span className="font-semibold text-slate-800">{val}</span> },
    { header: 'Category', key: 'category', render: (val) => <Badge variant="default">{val}</Badge> },
    { header: 'Priority', key: 'priority', render: (val) => <Badge variant={val === 'High' ? 'danger' : val === 'Medium' ? 'warning' : 'primary'}>{val}</Badge> },
    { header: 'Customer / Staff', key: 'customer', render: (val) => <span className="text-xs text-slate-600">{val}</span> },
    { header: 'Status', key: 'status', render: (val) => <StatusBadge status={val} /> },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" icon={FiEye} onClick={() => setSelectedTicket(row)}>
            View
          </Button>
          {row.status === 'Pending' && (
            <Button variant="secondary" size="sm" icon={FiCheck} onClick={() => handleResolve(row.id)}>
              Resolve
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customer & Workforce Support Tickets"
        subtitle="Track support inquiries, resolve app login issues, and manage ticket status."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Tickets" value={tickets.length.toString()} icon={FiMessageSquare} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Open / In Progress" value={tickets.filter((t) => t.status === 'Pending').length.toString()} icon={FiClock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Resolved Tickets" value={tickets.filter((t) => t.status === 'Approved').length.toString()} icon={FiCheckCircle} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
      </div>

      <Card padding="p-0">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticket ID, subject or customer..."
            className="w-full sm:w-80"
          />
          <Select
            placeholder="All Status"
            options={['Pending', 'Approved']}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          />
        </div>

        <Table columns={columns} data={currentData} keyField="id" onRowClick={(row) => setSelectedTicket(row)} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
        />
      </Card>

      {selectedTicket && (
        <Modal isOpen={Boolean(selectedTicket)} onClose={() => setSelectedTicket(null)} title={`Support Ticket ${selectedTicket.id}`}>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Subject</span>
              <h3 className="text-base font-bold text-slate-900">{selectedTicket.subject}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-1">Category</span>
                <span className="font-bold text-slate-800">{selectedTicket.category}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-1">Priority</span>
                <span className="font-bold text-slate-800">{selectedTicket.priority}</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-xs">
              <span className="text-slate-400 block mb-1">Submitted By</span>
              <span className="font-bold text-slate-800">{selectedTicket.customer}</span>
            </div>

            {selectedTicket.status === 'Pending' && (
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <Button variant="secondary" icon={FiCheck} onClick={() => handleResolve(selectedTicket.id)}>
                  Mark Ticket Resolved
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
