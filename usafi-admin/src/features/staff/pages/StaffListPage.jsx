import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { Card } from '../../../components/ui/Card';
import { Table } from '../../../components/tables/Table';
import { Pagination } from '../../../components/tables/Pagination';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { IconButton } from '../../../components/ui/IconButton';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Avatar } from '../../../components/ui/Avatar';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { usePagination } from '../../../hooks/usePagination';
import { useToast } from '../../../hooks/useToast';
import {
  FiUsers,
  FiUserCheck,
  FiClock,
  FiAlertCircle,
  FiPlus,
  FiEye,
  FiEdit2,
  FiTrash2,
} from 'react-icons/fi';

export const StaffListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deactivateId, setDeactivateId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Initial staff dataset
  const [staffList, setStaffList] = useState([
    { id: 'stf_01', name: 'John Smith', email: 'john.smith@gmail.com', phone: '+91 98765 43210', role: 'Cleaner', status: 'Active', documents: '4/4', compliance: 'Verified', joined: '12 Aug 2026' },
    { id: 'stf_02', name: 'Sarah Wilson', email: 'sarah.wilson@gmail.com', phone: '+91 98765 43211', role: 'Supervisor', status: 'Active', documents: '3/4', compliance: 'Pending', joined: '08 Aug 2026' },
    { id: 'stf_03', name: 'Michael Brown', email: 'michael.brown@gmail.com', phone: '+91 98765 43212', role: 'Cleaner', status: 'Inactive', documents: '2/4', compliance: 'Missing', joined: '02 Aug 2026' },
    { id: 'stf_04', name: 'Emily Davis', email: 'emily.davis@gmail.com', phone: '+91 98765 43213', role: 'Team Leader', status: 'Active', documents: '4/4', compliance: 'Verified', joined: '28 Jul 2026' },
    { id: 'stf_05', name: 'David Miller', email: 'david.miller@gmail.com', phone: '+91 98765 43214', role: 'Cleaner', status: 'Active', documents: '3/4', compliance: 'Pending', joined: '21 Jul 2026' },
    { id: 'stf_06', name: 'Priya Sharma', email: 'priya.sharma@gmail.com', phone: '+91 98765 43215', role: 'Security Guard', status: 'Active', documents: '4/4', compliance: 'Verified', joined: '15 Jul 2026' },
  ]);

  const filteredData = useMemo(() => {
    return staffList.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.role.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter ? item.role === roleFilter : true;
      const matchesStatus = statusFilter ? item.status === statusFilter : true;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staffList, search, roleFilter, statusFilter]);

  const { currentPage, totalPages, currentData, goToPage, totalItems, itemsPerPage } = usePagination(filteredData, 5);

  const handleDeactivateConfirm = () => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === deactivateId ? { ...s, status: 'Inactive' } : s))
    );
    toast.success('Staff member deactivated successfully');
    setDeactivateId(null);
  };

  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newStaff = {
      id: `stf_0${staffList.length + 1}`,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || '+91 98000 00000',
      role: formData.get('role'),
      status: 'Active',
      documents: '0/4',
      compliance: 'Pending',
      joined: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setStaffList([newStaff, ...staffList]);
    toast.success(`Added ${newStaff.name} to staff directory`);
    setIsAddModalOpen(false);
  };

  const columns = [
    {
      header: 'Staff Member',
      key: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="md" />
          <div>
            <p className="font-bold text-slate-900 leading-tight">{row.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      key: 'role',
      render: (role) => <span className="font-semibold text-slate-700">{role}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      header: 'Documents',
      key: 'documents',
      render: (docs) => <span className="font-bold text-slate-700">{docs}</span>,
    },
    {
      header: 'Compliance',
      key: 'compliance',
      render: (comp) => <StatusBadge status={comp} />,
    },
    {
      header: 'Joined Date',
      key: 'joined',
      render: (joined) => <span className="text-xs text-slate-500">{joined}</span>,
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton icon={FiEye} title="View Profile" onClick={() => navigate(`/staff/${row.id}`)} />
          <IconButton icon={FiEdit2} title="Edit Staff" onClick={() => navigate(`/staff/${row.id}/edit`)} />
          <IconButton icon={FiTrash2} variant="danger" title="Deactivate Staff" onClick={() => setDeactivateId(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Staff Directory"
        subtitle="Manage your workforce members, profiles, roles, and compliance status."
        actions={
          <Button variant="dark" icon={FiPlus} onClick={() => setIsAddModalOpen(true)}>
            Add Staff
          </Button>
        }
      />

      {/* Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Staff" value="124" icon={FiUsers} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Active Staff" value="108" icon={FiUserCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Pending Verification" value="10" icon={FiClock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Compliance Issues" value="6" icon={FiAlertCircle} iconBg="bg-red-50" iconColor="text-red-600" />
      </div>

      {/* Main Table Card */}
      <Card padding="p-0">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name, email or role..."
            className="w-full sm:w-80"
          />
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select
              placeholder="All Roles"
              options={['Cleaner', 'Supervisor', 'Team Leader', 'Security Guard']}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-40"
            />
            <Select
              placeholder="All Status"
              options={['Active', 'Inactive']}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-36"
            />
          </div>
        </div>

        <Table columns={columns} data={currentData} keyField="id" onRowClick={(row) => navigate(`/staff/${row.id}`)} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
        />
      </Card>

      {/* Add Staff Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Staff Member">
        <form onSubmit={handleAddStaffSubmit} className="space-y-4">
          <Input label="Full Name" name="name" required placeholder="e.g. Ramesh Kumar" />
          <Input label="Email Address" name="email" type="email" required placeholder="e.g. ramesh@gmail.com" />
          <Input label="Phone Number" name="phone" placeholder="+91 98765 00000" />
          <Select label="Primary Role" name="role" required options={['Cleaner', 'Supervisor', 'Team Leader', 'Security Guard']} />
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="dark">Save Staff Member</Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deactivateId)}
        onClose={() => setDeactivateId(null)}
        onConfirm={handleDeactivateConfirm}
        title="Deactivate Staff Member"
        description="Are you sure you want to deactivate this staff member? They will no longer be assigned to active shifts."
        confirmText="Deactivate"
      />
    </div>
  );
};
