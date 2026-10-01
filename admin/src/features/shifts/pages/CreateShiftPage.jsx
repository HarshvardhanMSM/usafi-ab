import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../hooks/useToast';
import { ROUTES } from '../../../constants/routes';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';

export const CreateShiftPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Shift created and published to workforce app');
      navigate(ROUTES.SHIFTS);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Create New Shift"
        subtitle="Define shift details, role requirements, location, timing, and hourly pay rate."
        actions={
          <Button variant="outline" icon={FiArrowLeft} onClick={() => navigate(ROUTES.SHIFTS)}>
            Back to Shifts
          </Button>
        }
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Job Title / Client Name" required placeholder="e.g. Commercial Cleaning Event" />
            <Select label="Role Category" required options={['Cleaner', 'Supervisor', 'Security Guard', 'Hospitality Worker', 'Warehouse Assistant']} />
            <Input label="Shift Date" type="date" required defaultValue="2026-09-30" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start Time" type="time" required defaultValue="08:00" />
              <Input label="End Time" type="time" required defaultValue="16:00" />
            </div>
            <Input label="Work Location / Address" required placeholder="e.g. Jaipur Exhibition Centre, Sitapura" />
            <Input label="Hourly Pay Rate ($ / hr)" type="number" required placeholder="18" />
            <Input label="Required Workers Count" type="number" required placeholder="10" defaultValue="5" />
            <Select label="Break Duration" options={['30 Minutes Unpaid', '45 Minutes Unpaid', '60 Minutes Unpaid', 'Paid Break']} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Shift Instructions & Special Requirements
            </label>
            <textarea
              rows={4}
              placeholder="Enter uniform requirements, safety gear needed, or entrance instructions for staff..."
              className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => navigate(ROUTES.SHIFTS)}>
              Cancel
            </Button>
            <Button type="submit" variant="dark" icon={FiCheck} isLoading={isLoading}>
              Publish Shift
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
