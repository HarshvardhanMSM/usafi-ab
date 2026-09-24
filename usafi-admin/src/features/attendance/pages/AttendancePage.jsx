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
import { Avatar } from '../../../components/ui/Avatar';
import { usePagination } from '../../../hooks/usePagination';
import {
  FiClock,
  FiUserCheck,
  FiAlertTriangle,
  FiMapPin,
  FiCheckCircle,
  FiNavigation,
} from 'react-icons/fi';

export const AttendancePage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const attendanceRecords = [
    { id: 'att_01', worker: 'John Smith', role: 'Cleaner', location: 'Jaipur JEC', checkIn: '07:55 AM', checkOut: '04:02 PM', hours: '8.1 hrs', gpsStatus: 'Verified', status: 'Present' },
    { id: 'att_02', worker: 'Sarah Wilson', role: 'Supervisor', location: 'City Mall Jaipur', checkIn: '09:15 AM', checkOut: '--', hours: '6.5 hrs', gpsStatus: 'Verified', status: 'Late' },
    { id: 'att_03', worker: 'Michael Brown', role: 'Cleaner', location: 'Grand Hotel', checkIn: '04:00 PM', checkOut: '--', hours: '2.0 hrs', gpsStatus: 'Geofence Alert', status: 'On Break' },
    { id: 'att_04', worker: 'Emily Davis', role: 'Security Guard', location: 'Royal Palace', checkIn: '08:00 AM', checkOut: '06:00 PM', hours: '10.0 hrs', gpsStatus: 'Verified', status: 'Present' },
    { id: 'att_05', worker: 'David Miller', role: 'Cleaner', location: 'Industrial Area', checkIn: '--', checkOut: '--', hours: '0 hrs', gpsStatus: 'No GPS Signal', status: 'Absent' },
  ];

  const filteredRecords = attendanceRecords.filter((r) => {
    const matchesSearch =
      r.worker.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? r.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const { currentPage, totalPages, currentData, goToPage, totalItems, itemsPerPage } = usePagination(filteredRecords, 5);

  const columns = [
    {
      header: 'Worker Name',
      key: 'worker',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.worker} size="sm" />
          <div>
            <p className="font-bold text-slate-900">{row.worker}</p>
            <p className="text-xs text-slate-500">{row.role}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Shift Location',
      key: 'location',
      render: (loc) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <FiMapPin size={13} className="text-slate-400" />
          <span>{loc}</span>
        </div>
      ),
    },
    {
      header: 'Check-In',
      key: 'checkIn',
      render: (time) => <span className="font-bold text-slate-800 text-xs">{time}</span>,
    },
    {
      header: 'Check-Out',
      key: 'checkOut',
      render: (time) => <span className="text-xs text-slate-600">{time}</span>,
    },
    {
      header: 'Working Hours',
      key: 'hours',
      render: (h) => <span className="font-semibold text-blue-600 text-xs">{h}</span>,
    },
    {
      header: 'GPS Verification',
      key: 'gpsStatus',
      render: (gps) => (
        <Badge
          variant={gps === 'Verified' ? 'success' : gps === 'Geofence Alert' ? 'warning' : 'default'}
          icon={gps === 'Verified' ? FiCheckCircle : FiNavigation}
        >
          {gps}
        </Badge>
      ),
    },
    {
      header: 'Attendance Status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="GPS Attendance Tracking"
        subtitle="Real-time geofenced check-in, check-out, working hours, and location verification logs."
      />

      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Present Today" value="92" icon={FiUserCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Late Check-ins" value="6" icon={FiClock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="GPS Verification Alerts" value="2" icon={FiNavigation} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Absent Workers" value="4" icon={FiAlertTriangle} iconBg="bg-red-50" iconColor="text-red-600" />
      </div>

      <Card padding="p-0">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search worker or shift location..."
            className="w-full sm:w-80"
          />
          <Select
            placeholder="All Status"
            options={['Present', 'Late', 'On Break', 'Absent']}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          />
        </div>

        <Table columns={columns} data={currentData} keyField="id" />

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
