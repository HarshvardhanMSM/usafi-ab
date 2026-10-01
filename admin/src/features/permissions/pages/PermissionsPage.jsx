import React from 'react';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Table } from '../../../components/tables/Table';

export const PermissionsPage = () => {
  const permissionsCatalog = [
    { key: 'staff:read', name: 'View Staff Directory', module: 'Staff Management', desc: 'Allows viewing worker profiles, status, and documents.' },
    { key: 'staff:write', name: 'Manage Staff Profiles', module: 'Staff Management', desc: 'Allows creating, editing, and updating worker data.' },
    { key: 'shift:create', name: 'Create Shifts', module: 'Shift Scheduling', desc: 'Allows creating and publishing workforce shifts.' },
    { key: 'shift:assign', name: 'Approve Staff Requests', module: 'Shift Scheduling', desc: 'Allows approving/declining worker shift applications.' },
    { key: 'attendance:view', name: 'View GPS Attendance', module: 'Attendance', desc: 'Allows monitoring GPS check-in/out records.' },
    { key: 'compliance:verify', name: 'Approve Documents', module: 'Compliance', desc: 'Allows approving or rejecting worker verification uploads.' },
  ];

  const columns = [
    { header: 'Permission Name', key: 'name', render: (val) => <span className="font-bold text-slate-900">{val}</span> },
    { header: 'System Code', key: 'key', render: (val) => <code className="px-2 py-1 bg-slate-100 rounded text-xs text-blue-700 font-mono font-semibold">{val}</code> },
    { header: 'Module', key: 'module', render: (val) => <Badge variant="primary">{val}</Badge> },
    { header: 'Description', key: 'desc', render: (val) => <span className="text-xs text-slate-600">{val}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Permissions Catalog"
        subtitle="System-level permission definitions available for Role-Based Access Control (RBAC)."
      />

      <Card padding="p-0">
        <Table columns={columns} data={permissionsCatalog} keyField="key" />
      </Card>
    </div>
  );
};
