import React, { useState } from 'react';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { Card } from '../../../components/ui/Card';
import { Table } from '../../../components/tables/Table';
import { Pagination } from '../../../components/tables/Pagination';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { usePagination } from '../../../hooks/usePagination';
import { FiList, FiClock, FiShield } from 'react-icons/fi';

export const AuditLogsPage = () => {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  const auditLogs = [
    { id: 'log_01', user: 'Super Admin', action: 'Approved Shift Request', module: 'Shift Management', ip: '192.168.1.42', timestamp: '24 Sep 2026, 05:26 PM' },
    { id: 'log_02', user: 'Operations Manager', action: 'Created New Shift (Event Assistant)', module: 'Shift Scheduling', ip: '192.168.1.55', timestamp: '24 Sep 2026, 04:12 PM' },
    { id: 'log_03', user: 'Compliance Officer', action: 'Verified Aadhaar Document (John Smith)', module: 'Compliance', ip: '192.168.1.88', timestamp: '24 Sep 2026, 02:45 PM' },
    { id: 'log_04', user: 'Super Admin', action: 'Updated Admin User Permissions', module: 'User Management', ip: '192.168.1.42', timestamp: '23 Sep 2026, 11:15 AM' },
    { id: 'log_05', user: 'Shift Coordinator', action: 'Overrode GPS Attendance Warning', module: 'Attendance', ip: '192.168.1.90', timestamp: '23 Sep 2026, 09:30 AM' },
  ];

  const filteredLogs = auditLogs.filter((l) => {
    const matchesSearch =
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter ? l.module === moduleFilter : true;
    return matchesSearch && matchesModule;
  });

  const { currentPage, totalPages, currentData, goToPage, totalItems, itemsPerPage } = usePagination(filteredLogs, 5);

  const columns = [
    { header: 'Admin User', key: 'user', render: (val) => <span className="font-bold text-slate-900">{val}</span> },
    { header: 'Action Performed', key: 'action', render: (val) => <span className="font-semibold text-slate-800 text-xs">{val}</span> },
    { header: 'Module', key: 'module', render: (val) => <Badge variant="primary">{val}</Badge> },
    { header: 'IP Address', key: 'ip', render: (val) => <span className="font-mono text-xs text-slate-500">{val}</span> },
    { header: 'Timestamp', key: 'timestamp', render: (val) => <span className="text-xs text-slate-500">{val}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Administrative Audit Logs"
        subtitle="Complete record of all administrative actions, shift changes, document approvals, and system events."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Audit Logs" value="1,024" icon={FiList} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Today's Actions" value="14" icon={FiClock} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Critical System Events" value="0" icon={FiShield} iconBg="bg-purple-50" iconColor="text-purple-600" />
      </div>

      <Card padding="p-0">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search log by user or action..."
            className="w-full sm:w-80"
          />
          <Select
            placeholder="All Modules"
            options={['Shift Management', 'Shift Scheduling', 'Compliance', 'User Management', 'Attendance']}
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="w-48"
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
