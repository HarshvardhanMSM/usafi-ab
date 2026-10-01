import React, { useState } from 'react';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Avatar } from '../../../components/ui/Avatar';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { FiUser, FiBell, FiGlobe, FiShield, FiFileText, FiCheck } from 'react-icons/fi';

export const SettingsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState('account');

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Settings updated successfully');
  };

  const navItems = [
    { id: 'account', label: 'Account Profile', icon: FiUser },
    { id: 'notifications', label: 'Notification Preferences', icon: FiBell },
    { id: 'security', label: 'Password & Security', icon: FiShield },
    { id: 'general', label: 'System Preferences', icon: FiGlobe },
    { id: 'policies', label: 'Policies & Guidelines', icon: FiFileText },
  ];

  return (
    <div>
      <PageHeader
        title="Settings & System Preferences"
        subtitle="Configure your admin profile, notification channels, security policies, and workforce settings."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Navigation Sidebar */}
        <Card padding="p-2" className="h-fit">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive ? 'bg-blue-50 text-blue-600 shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Settings Detail Section */}
        <div className="space-y-6">
          {activeSection === 'account' && (
            <Card header={<h3 className="text-sm font-bold text-slate-900">Admin Account Profile</h3>}>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
                  <Avatar name={user?.name || 'Super Admin'} size="xl" />
                  <div>
                    <h4 className="font-bold text-slate-900">{user?.name || 'Super Admin'}</h4>
                    <p className="text-xs text-slate-500">{user?.role || 'Administrator'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" defaultValue={user?.name || 'Super Admin'} />
                  <Input label="Email Address" type="email" defaultValue={user?.email || 'admin@usafi.com'} />
                  <Input label="Role Title" defaultValue={user?.role || 'Super Admin'} disabled />
                  <Input label="Platform Organization" defaultValue="Usafi Workforce Solutions" disabled />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="dark" icon={FiCheck}>
                    Save Profile
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card header={<h3 className="text-sm font-bold text-slate-900">Notification Alerts</h3>}>
              <div className="space-y-4">
                {[
                  { label: 'Email alerts for new shift requests', default: true },
                  { label: 'Push alerts for document compliance updates', default: true },
                  { label: 'GPS Geofence check-in mismatch warnings', default: true },
                  { label: 'Weekly workforce analytics digest', default: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                    <input type="checkbox" defaultChecked={item.default} className="w-4 h-4 text-blue-600 accent-blue-600 rounded" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeSection === 'security' && (
            <Card header={<h3 className="text-sm font-bold text-slate-900">Password & Security</h3>}>
              <form onSubmit={handleSave} className="space-y-4 max-w-md">
                <Input label="Current Password" type="password" required />
                <Input label="New Password" type="password" required />
                <Input label="Confirm New Password" type="password" required />
                <Button type="submit" variant="dark">
                  Update Password
                </Button>
              </form>
            </Card>
          )}

          {(activeSection === 'general' || activeSection === 'policies') && (
            <Card header={<h3 className="text-sm font-bold text-slate-900">Platform Policies</h3>}>
              <p className="text-xs text-slate-600 leading-relaxed">
                Usafi Workforce Platform internal guidelines and general system preferences (Timezone: Asia/Kolkata (IST), Currency: USD/INR).
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
