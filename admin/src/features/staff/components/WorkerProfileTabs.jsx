import React, { useState } from 'react';
import { Tabs } from '../../../components/ui/Tabs';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useToast } from '../../../hooks/useToast';
import {
  FiUser,
  FiActivity,
  FiAward,
  FiFileText,
  FiUploadCloud,
  FiCheckCircle,
  FiDownload,
  FiCheck,
} from 'react-icons/fi';

export const WorkerProfileTabs = ({ worker }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const toast = useToast();

  const profileTabs = [
    { id: 'personal', label: 'Personal Detail', icon: FiUser },
    { id: 'health', label: 'Health Information', icon: FiActivity },
    { id: 'qualification', label: 'Qualification & Experience', icon: FiAward },
    { id: 'reference', label: 'Employment Reference', icon: FiFileText },
    { id: 'documents', label: 'Upload Documents', icon: FiUploadCloud, count: 4 },
    { id: 'contract', label: 'Employee Contract', icon: FiCheckCircle },
  ];

  const handleSave = () => {
    toast.success('Worker profile updated successfully');
  };

  return (
    <div>
      <Tabs tabs={profileTabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {/* Tab 1: Personal Detail */}
      {activeTab === 'personal' && (
        <Card header={<h3 className="text-sm font-bold text-slate-900">Personal Information</h3>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Full Name" defaultValue={worker?.name || 'John Smith'} />
            <Input label="Email Address" type="email" defaultValue={worker?.email || 'john.smith@gmail.com'} />
            <Input label="Phone Number" defaultValue={worker?.phone || '+91 98765 43210'} />
            <Input label="Date of Birth" type="date" defaultValue="1995-08-15" />
            <Select label="Gender" options={['Male', 'Female', 'Other']} defaultValue="Male" />
            <Select label="Primary Role" options={['Cleaner', 'Supervisor', 'Security Guard', 'Hospitality Worker']} defaultValue={worker?.role || 'Cleaner'} />
            <div className="md:col-span-2">
              <Input label="Residential Address" defaultValue="124 Vaishali Nagar, Jaipur, Rajasthan 302021" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="dark" icon={FiCheck} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 2: Health Information */}
      {activeTab === 'health' && (
        <Card header={<h3 className="text-sm font-bold text-slate-900">Health & Medical Clearances</h3>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select label="Medical Fitness Status" options={['Fit for Work', 'Pending Assessment', 'Restricted Duty']} defaultValue="Fit for Work" />
            <Input label="Blood Group" defaultValue="O positive (O+)" />
            <Input label="Emergency Contact Person" defaultValue="Mary Smith (Spouse)" />
            <Input label="Emergency Contact Phone" defaultValue="+91 98765 00112" />
            <div className="md:col-span-2">
              <Input label="Allergies or Medical Notes" defaultValue="No known medical allergies. Fully vaccinated." />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="dark" icon={FiCheck} onClick={handleSave}>
              Save Health Profile
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 3: Qualification & Experience */}
      {activeTab === 'qualification' && (
        <Card header={<h3 className="text-sm font-bold text-slate-900">Qualifications & Certifications</h3>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Highest Qualification" defaultValue="High School Diploma / Secondary Education" />
            <Input label="Years of Experience" defaultValue="4 Years" />
            <Input label="Specialized Certifications" defaultValue="Industrial Hygiene Certificate Level 2, First Aid Certified" />
            <Input label="Languages Spoken" defaultValue="English, Hindi, Local Dialect" />
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="dark" icon={FiCheck} onClick={handleSave}>
              Save Qualifications
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 4: Employment Reference */}
      {activeTab === 'reference' && (
        <Card header={<h3 className="text-sm font-bold text-slate-900">Previous Employment References</h3>}>
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Primary Reference</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Company Name" defaultValue="Apex Commercial Sanitation Ltd." />
                <Input label="Supervisor Name" defaultValue="Robert Jenkins" />
                <Input label="Contact Phone" defaultValue="+91 91234 56789" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="dark" icon={FiCheck} onClick={handleSave}>
              Save References
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 5: Upload Documents */}
      {activeTab === 'documents' && (
        <Card header={<h3 className="text-sm font-bold text-slate-900">Worker Compliance Documents</h3>}>
          <div className="space-y-4">
            {[
              { title: 'National Identity Card (Aadhaar / Passport)', status: 'Verified', date: 'Uploaded Aug 12, 2026' },
              { title: 'Police Character Verification Certificate', status: 'Verified', date: 'Uploaded Aug 14, 2026' },
              { title: 'Health & Vaccination Clearance Certificate', status: 'Pending', date: 'Uploaded Sep 01, 2026' },
              { title: 'Bank Account & Payroll Mandate Form', status: 'Verified', date: 'Uploaded Aug 12, 2026' },
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FiFileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{doc.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={doc.status} />
                  <Button variant="outline" size="sm" icon={FiDownload}>
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 6: Employee Contract */}
      {activeTab === 'contract' && (
        <Card header={<h3 className="text-sm font-bold text-slate-900">Employment Contract & Terms</h3>}>
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Standard Workforce Contract (2026)</h4>
                <p className="text-xs text-slate-500 mt-0.5">Signed digitally on August 12, 2026</p>
              </div>
              <StatusBadge status="Verified" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This contract governs worker employment terms, shift assignment guidelines, GPS attendance requirements, safety standards, and compensation rules under the Usafi platform policies.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="dark" icon={FiDownload}>
              Download Contract PDF
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
