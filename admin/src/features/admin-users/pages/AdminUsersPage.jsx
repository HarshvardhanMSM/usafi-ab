import React, { useState } from 'react';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { Card } from '../../../components/ui/Card';
import { Table } from '../../../components/tables/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useToast } from '../../../hooks/useToast';
import { FiUsers, FiUserCheck, FiUserPlus, FiShield, FiLock } from 'react-icons/fi';

export const AdminUsersPage = () => {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [adminUsers, setAdminUsers] = useState([
    { id: 'usr_01', name: 'Super Admin', email: 'admin@usafi.com', role: 'Super Admin', status: 'Active', created: '29 Jun 2026', isSystem: true },
    { id: 'usr_02', name: 'Operations Manager', email: 'ops@usafi.com', role: 'Operations Manager', status: 'Active', created: '10 Jul 2026', isSystem: false },
    { id: 'usr_03', name: 'Shift Coordinator', email: 'shifts@usafi.com', role: 'Shift Coordinator', status: 'Active', created: '15 Aug 2026', isSystem: false },
    { id: 'usr_04', name: 'Compliance Officer', email: 'compliance@usafi.com', role: 'Compliance Officer', status: 'Active', created: '01 Sep 2026', isSystem: false },
  ]);

  const handleAddUser = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newUser = {
      id: `usr_0${adminUsers.length + 1}`,
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      status: 'Active',
      created: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      isSystem: false,
    };
    setAdminUsers([...adminUsers, newUser]);
    toast.success(`Created admin account for ${newUser.name}`);
    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Admin User',
      key: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="md" />
          <div>
            <p className="font-bold text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      key: 'role',
      render: (role) => <Badge variant="purple">{role}</Badge>,
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      header: 'Created Date',
      key: 'created',
      render: (date) => <span className="text-xs text-slate-500">{date}</span>,
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          {row.isSystem ? (
            <Badge variant="default" icon={FiLock}>
              System Protected
            </Badge>
          ) : (
            <Button variant="outline" size="sm">
              Manage Access
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Admin Accounts & RBAC"
        subtitle="Manage administrator accounts, security access privileges, and internal team permissions."
        actions={
          <Button variant="dark" icon={FiUserPlus} onClick={() => setIsModalOpen(true)}>
            Create Admin User
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Admin Users" value={adminUsers.length.toString()} icon={FiUsers} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Active Accounts" value={adminUsers.filter((u) => u.status === 'Active').length.toString()} icon={FiUserCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="System Roles" value="5" icon={FiShield} iconBg="bg-purple-50" iconColor="text-purple-600" />
      </div>

      <Card padding="p-0">
        <Table columns={columns} data={adminUsers} keyField="id" />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Admin User">
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input label="Full Name" name="name" required placeholder="e.g. Ankit Sharma" />
          <Input label="Email Address" name="email" type="email" required placeholder="e.g. ankit@usafi.com" />
          <Select label="Assign Role" name="role" required options={['Operations Manager', 'Shift Coordinator', 'Compliance Officer', 'Support Agent']} />
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="dark">Create Account</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
