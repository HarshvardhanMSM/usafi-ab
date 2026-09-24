import React, { useState } from 'react';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../hooks/useToast';
import { FiCheck } from 'react-icons/fi';

export const RolesPermissionsPage = () => {
  const toast = useToast();
  const [selectedRole, setSelectedRole] = useState('Operations Manager');

  const roles = [
    { id: 'role_01', name: 'Super Admin', desc: 'Unrestricted access to all modules and system settings.', isSystem: true, userCount: 1 },
    { id: 'role_02', name: 'Operations Manager', desc: 'Full workforce, shift, and attendance management rights.', isSystem: false, userCount: 3 },
    { id: 'role_03', name: 'Shift Coordinator', desc: 'Manage shift creation, staff requests, and daily schedules.', isSystem: false, userCount: 5 },
    { id: 'role_04', name: 'Compliance Officer', desc: 'Document verification, health clearance, and audit access.', isSystem: false, userCount: 2 },
    { id: 'role_05', name: 'Support Agent', desc: 'Customer support tickets and worker inquiry handling.', isSystem: false, userCount: 4 },
  ];

  const permissionsMatrix = [
    { module: 'Staff Management', view: true, create: true, edit: true, delete: false },
    { module: 'Shift Scheduling', view: true, create: true, edit: true, delete: true },
    { module: 'GPS Attendance', view: true, create: true, edit: true, delete: false },
    { module: 'Document Verification', view: true, create: false, edit: true, delete: false },
    { module: 'Admin & System Settings', view: false, create: false, edit: false, delete: false },
  ];

  const handleSavePermissions = () => {
    toast.success(`Updated permission matrix for ${selectedRole}`);
  };

  return (
    <div>
      <PageHeader
        title="Roles & Permission Matrix"
        subtitle="Define granular access rights and module permissions for Usafi admin roles."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Roles Selection Panel */}
        <div className="space-y-3">
          <Card header={<h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Usafi System Roles</h3>} padding="p-2">
            <div className="space-y-1">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.name)}
                  className={`w-full text-left p-3.5 rounded-xl transition duration-150 ${
                    selectedRole === r.name
                      ? 'bg-blue-50 border border-blue-200 text-blue-900 shadow-2xs font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{r.name}</span>
                    {r.isSystem && <Badge variant="default">System</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.desc}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Permission Grid Details */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Module Access Rights: {selectedRole}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Configure read, write, edit, and delete permissions for this role</p>
              </div>
              <Button variant="dark" icon={FiCheck} onClick={handleSavePermissions}>
                Save Permissions
              </Button>
            </div>
          }
          padding="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Module Name</th>
                  <th className="px-5 py-3.5 text-center">View / Read</th>
                  <th className="px-5 py-3.5 text-center">Create</th>
                  <th className="px-5 py-3.5 text-center">Edit / Update</th>
                  <th className="px-5 py-3.5 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {permissionsMatrix.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4 font-bold text-slate-900">{p.module}</td>
                    <td className="px-5 py-4 text-center">
                      <input type="checkbox" defaultChecked={p.view} className="w-4 h-4 rounded text-blue-600 accent-blue-600" />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <input type="checkbox" defaultChecked={p.create} className="w-4 h-4 rounded text-blue-600 accent-blue-600" />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <input type="checkbox" defaultChecked={p.edit} className="w-4 h-4 rounded text-blue-600 accent-blue-600" />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <input type="checkbox" defaultChecked={p.delete} className="w-4 h-4 rounded text-blue-600 accent-blue-600" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
