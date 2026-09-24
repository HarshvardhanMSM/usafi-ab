import React, { useState } from 'react';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { Card } from '../../../components/ui/Card';
import { Table } from '../../../components/tables/Table';
import { Pagination } from '../../../components/tables/Pagination';
import { SearchInput } from '../../../components/ui/SearchInput';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { usePagination } from '../../../hooks/usePagination';
import { FiBriefcase, FiUsers, FiCheckCircle } from 'react-icons/fi';

export const CustomerPage = () => {
  const [search, setSearch] = useState('');

  const customers = [
    { id: 'cust_01', name: 'Jaipur Exhibition Centre', contact: 'Syam Sharma', email: 'syam.sharma@jec.com', phone: '+91 98765 11111', shiftsBooked: 24, status: 'Active' },
    { id: 'cust_02', name: 'City Mall Jaipur', contact: 'Anita Roy', email: 'anita@citymall.com', phone: '+91 98765 22222', shiftsBooked: 18, status: 'Active' },
    { id: 'cust_03', name: 'Grand Hotel & Suites', contact: 'Vikram Singh', email: 'vikram@grandhotel.com', phone: '+91 98765 33333', shiftsBooked: 12, status: 'Active' },
    { id: 'cust_04', name: 'Royal Palace Events', contact: 'Kavita Mehta', email: 'kavita@royalpalace.com', phone: '+91 98765 44444', shiftsBooked: 8, status: 'Active' },
  ];

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const { currentPage, totalPages, currentData, goToPage, totalItems, itemsPerPage } = usePagination(filteredCustomers, 5);

  const columns = [
    { header: 'Client / Company Name', key: 'name', render: (val) => <span className="font-bold text-slate-900">{val}</span> },
    { header: 'Primary Contact Person', key: 'contact', render: (val) => <span className="font-semibold text-slate-800">{val}</span> },
    { header: 'Email Address', key: 'email', render: (val) => <span className="text-xs text-slate-600">{val}</span> },
    { header: 'Phone Number', key: 'phone', render: (val) => <span className="text-xs text-slate-600">{val}</span> },
    { header: 'Total Shifts Booked', key: 'shiftsBooked', render: (val) => <span className="font-bold text-blue-600">{val}</span> },
    { header: 'Account Status', key: 'status', render: (val) => <StatusBadge status={val} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Client Accounts Directory"
        subtitle="Manage client accounts, contract facilities, and corporate workforce bookings."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Client Accounts" value={customers.length.toString()} icon={FiBriefcase} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Active Client Facilities" value="4" icon={FiCheckCircle} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Total Shifts Contracted" value="62" icon={FiUsers} iconBg="bg-purple-50" iconColor="text-purple-600" />
      </div>

      <Card padding="p-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client or contact name..."
            className="w-full sm:w-80"
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
