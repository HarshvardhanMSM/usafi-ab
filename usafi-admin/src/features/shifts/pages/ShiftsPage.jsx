import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { Card } from '../../../components/ui/Card';
import { Table } from '../../../components/tables/Table';
import { Pagination } from '../../../components/tables/Pagination';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { usePagination } from '../../../hooks/usePagination';
import { ROUTES } from '../../../constants/routes';
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiPlus,
  FiMapPin,
  FiDollarSign,
  FiEye,
  FiEdit2,
} from 'react-icons/fi';

export const ShiftsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const shifts = [
    { id: 'shf_01', job: 'Event Staffing', role: 'Event Assistant', date: '24 Sep 2026', time: '09:00 AM - 05:00 PM', location: 'Jaipur Exhibition Centre', pay: '$18/hr', workers: '8 / 10', status: 'Open' },
    { id: 'shf_02', job: 'Commercial Cleaning', role: 'Cleaner', date: '25 Sep 2026', time: '08:00 AM - 04:00 PM', location: 'City Mall, Jaipur', pay: '$16/hr', workers: '12 / 12', status: 'Filled' },
    { id: 'shf_03', job: 'Security Services', role: 'Security Guard', date: '26 Sep 2026', time: '06:00 PM - 02:00 AM', location: 'Grand Hotel', pay: '$20/hr', workers: '5 / 8', status: 'Open' },
    { id: 'shf_04', job: 'Hospitality Staffing', role: 'Waiter', date: '27 Sep 2026', time: '10:00 AM - 06:00 PM', location: 'Royal Palace', pay: '$17/hr', workers: '6 / 6', status: 'Filled' },
    { id: 'shf_05', job: 'Industrial Facility', role: 'Warehouse Assistant', date: '28 Sep 2026', time: '07:00 AM - 03:00 PM', location: 'Industrial Area', pay: '$19/hr', workers: '4 / 10', status: 'Open' },
  ];

  const filteredShifts = shifts.filter((s) => {
    const matchesSearch =
      s.job.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? s.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const { currentPage, totalPages, currentData, goToPage, totalItems, itemsPerPage } = usePagination(filteredShifts, 5);

  const columns = [
    {
      header: 'Job / Role',
      key: 'job',
      render: (_, row) => (
        <div>
          <p className="font-bold text-slate-900">{row.job}</p>
          <p className="text-xs text-slate-500 mt-0.5">{row.role}</p>
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
      header: 'Pay Rate',
      key: 'pay',
      render: (pay) => (
        <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
          <FiDollarSign size={13} className="text-slate-400" />
          <span>{pay}</span>
        </div>
      ),
    },
    {
      header: 'Workers Assigned',
      key: 'workers',
      render: (w) => <span className="font-bold text-slate-700 text-xs">{w}</span>,
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
        <div className="flex items-center justify-end gap-1">
          <Button variant="outline" size="sm" icon={FiEye} onClick={() => navigate(`/shifts/${row.id}`)}>
            Details
          </Button>
          <Button variant="secondary" size="sm" icon={FiEdit2} onClick={() => navigate(`/shifts/${row.id}/edit`)}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Shift Management"
        subtitle="Schedule, assign, and track single & multi-worker workforce shifts."
        actions={
          <Link to={ROUTES.SHIFTS_CREATE}>
            <Button variant="dark" icon={FiPlus}>
              Create Shift
            </Button>
          </Link>
        }
      />

      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Shifts" value="48" icon={FiCalendar} iconBg="bg-slate-100" iconColor="text-slate-700" />
        <StatCard title="Upcoming Shifts" value="24" icon={FiClock} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Filled Shifts" value="17" icon={FiUsers} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Open Shifts" value="7" icon={FiUsers} iconBg="bg-amber-50" iconColor="text-amber-600" />
      </div>

      {/* Main Table Card */}
      <Card padding="p-0">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shifts by title, role or location..."
            className="w-full sm:w-80"
          />
          <Select
            placeholder="All Status"
            options={['Open', 'Filled', 'Completed']}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          />
        </div>

        <Table columns={columns} data={currentData} keyField="id" onRowClick={(row) => navigate(`/shifts/${row.id}`)} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
        />
      </Card>
    </div>
  );
};
