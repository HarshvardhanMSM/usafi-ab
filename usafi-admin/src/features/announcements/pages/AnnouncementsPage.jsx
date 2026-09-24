import React, { useState } from 'react';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../hooks/useToast';
import { FiVolume2, FiPlus, FiCalendar, FiUsers } from 'react-icons/fi';

export const AnnouncementsPage = () => {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Updated Health & Safety Guidelines (2026)', target: 'All Workforce Staff', date: '24 Sep 2026', author: 'Operations Team', status: 'Published' },
    { id: 2, title: 'Jaipur Exhibition Centre Event Shift Announcement', target: 'Cleaners & Event Staff', date: '20 Sep 2026', author: 'Shift Coordinator', status: 'Published' },
  ]);

  const handleCreate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newAnn = {
      id: Date.now(),
      title: formData.get('title'),
      target: formData.get('target'),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      author: 'Super Admin',
      status: 'Published',
    };
    setAnnouncements([newAnn, ...announcements]);
    toast.success('Broadcast announcement sent to workers');
    setIsModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Workforce Announcements"
        subtitle="Broadcast platform announcements, safety policies, and shift notices to mobile worker apps."
        actions={
          <Button variant="dark" icon={FiPlus} onClick={() => setIsModalOpen(true)}>
            New Announcement
          </Button>
        }
      />

      <div className="space-y-4">
        {announcements.map((item) => (
          <Card key={item.id} className="hover:border-slate-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FiVolume2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1"><FiUsers /> Audience: {item.target}</span>
                    <span className="flex items-center gap-1"><FiCalendar /> Published: {item.date}</span>
                    <span>By: {item.author}</span>
                  </div>
                </div>
              </div>
              <Badge variant="success">{item.status}</Badge>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Broadcast Announcement">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Announcement Title" name="title" required placeholder="e.g. Mandatory Uniform Notice" />
          <Select label="Target Audience" name="target" required options={['All Workforce Staff', 'Cleaners Only', 'Supervisors Only', 'Security Guards Only']} />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Announcement Content
            </label>
            <textarea
              name="content"
              rows={4}
              required
              placeholder="Enter message text that will appear on worker mobile apps..."
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="dark">Broadcast Announcement</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
