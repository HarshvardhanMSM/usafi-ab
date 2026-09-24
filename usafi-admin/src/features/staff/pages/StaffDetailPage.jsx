import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { WorkerProfileTabs } from '../components/WorkerProfileTabs';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../constants/routes';
import { FiArrowLeft, FiPhone, FiMail, FiMapPin, FiCalendar } from 'react-icons/fi';

export const StaffDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const mockWorker = {
    id: id || 'stf_01',
    name: 'John Smith',
    email: 'john.smith@gmail.com',
    phone: '+91 98765 43210',
    role: 'Cleaner',
    status: 'Active',
    compliance: 'Verified',
    joined: '12 Aug 2026',
    address: '124 Vaishali Nagar, Jaipur, Rajasthan',
  };

  return (
    <div>
      <PageHeader
        title={`Staff Profile: ${mockWorker.name}`}
        subtitle={`Viewing full workforce details for worker ID: ${mockWorker.id}`}
        actions={
          <Button variant="outline" icon={FiArrowLeft} onClick={() => navigate(ROUTES.STAFF)}>
            Back to Directory
          </Button>
        }
      />

      {/* Header Summary Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Avatar name={mockWorker.name} size="xl" />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{mockWorker.name}</h2>
              <StatusBadge status={mockWorker.status} />
              <StatusBadge status={mockWorker.compliance} />
            </div>
            <p className="text-sm font-semibold text-blue-600 mt-1">{mockWorker.role}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1.5"><FiMail /> {mockWorker.email}</span>
              <span className="flex items-center gap-1.5"><FiPhone /> {mockWorker.phone}</span>
              <span className="flex items-center gap-1.5"><FiMapPin /> {mockWorker.address}</span>
              <span className="flex items-center gap-1.5"><FiCalendar /> Joined {mockWorker.joined}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Usafi 6 Tabs Worker Profile Component */}
      <WorkerProfileTabs worker={mockWorker} />
    </div>
  );
};
