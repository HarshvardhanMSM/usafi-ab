import React, { useState } from 'react';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { Card } from '../../../components/ui/Card';
import { Table } from '../../../components/tables/Table';
import { Pagination } from '../../../components/tables/Pagination';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Select } from '../../../components/ui/Select';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { usePagination } from '../../../hooks/usePagination';
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiXCircle,
} from 'react-icons/fi';

export const CompliancePage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const complianceList = [
    { id: 'cmp_01', staffName: 'John Smith', role: 'Cleaner', policeCheck: 'Verified', medicalClearance: 'Verified', idProof: 'Verified', status: 'Compliant' },
    { id: 'cmp_02', staffName: 'Sarah Wilson', role: 'Supervisor', policeCheck: 'Verified', medicalClearance: 'Pending', idProof: 'Verified', status: 'Pending' },
    { id: 'cmp_03', staffName: 'Michael Brown', role: 'Cleaner', policeCheck: 'Missing', medicalClearance: 'Missing', idProof: 'Verified', status: 'Missing' },
    { id: 'cmp_04', staffName: 'Emily Davis', role: 'Security Guard', policeCheck: 'Verified', medicalClearance: 'Verified', idProof: 'Verified', status: 'Compliant' },
    { id: 'cmp_05', staffName: 'David Miller', role: 'Cleaner', policeCheck: 'Verified', medicalClearance: 'Expiring', idProof: 'Verified', status: 'Expiring' },
  ];

  const filteredData = complianceList.filter((c) => {
    const matchesSearch =
      c.staffName.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const { currentPage, totalPages, currentData, goToPage, totalItems, itemsPerPage } = usePagination(filteredData, 5);

  const columns = [
    {
      header: 'Staff Member',
      key: 'staffName',
      render: (_, row) => (
        <div>
          <p className="font-bold text-slate-900">{row.staffName}</p>
          <p className="text-xs text-slate-500">{row.role}</p>
        </div>
      ),
    },
    {
      header: 'Police Clearance',
      key: 'policeCheck',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      header: 'Medical Clearance',
      key: 'medicalClearance',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      header: 'Identity Verification',
      key: 'idProof',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      header: 'Overall Status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Workforce Compliance Audit"
        subtitle="Monitor worker eligibility, police verification, health clearances, and document expiration alerts."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Fully Compliant" value="108" icon={FiCheckCircle} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Pending Review" value="10" icon={FiClock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Expiring Soon (30 Days)" value="4" icon={FiAlertTriangle} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Non-Compliant / Missing" value="2" icon={FiXCircle} iconBg="bg-red-50" iconColor="text-red-600" />
      </div>

      <Card padding="p-0">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name or role..."
            className="w-full sm:w-80"
          />
          <Select
            placeholder="All Compliance Status"
            options={['Compliant', 'Pending', 'Expiring', 'Missing']}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
