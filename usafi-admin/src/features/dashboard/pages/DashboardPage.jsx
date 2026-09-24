import React from 'react';
import { PageHeader } from '../../../components/navigation/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../constants/routes';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiClock,
  FiCalendar,
  FiUserPlus,
  FiCheckCircle,
  FiBriefcase,
  FiArrowRight,
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const DashboardPage = () => {
  const attendanceData = [
    { day: 'Mon', present: 112, late: 8, absent: 4 },
    { day: 'Tue', present: 118, late: 5, absent: 1 },
    { day: 'Wed', present: 120, late: 3, absent: 1 },
    { day: 'Thu', present: 115, late: 7, absent: 2 },
    { day: 'Fri', present: 124, late: 2, absent: 0 },
    { day: 'Sat', present: 98, late: 6, absent: 5 },
    { day: 'Sun', present: 85, late: 4, absent: 3 },
  ];

  const shiftCategoryData = [
    { role: 'Cleaner', filled: 42, open: 6 },
    { role: 'Supervisor', filled: 12, open: 2 },
    { role: 'Security', filled: 18, open: 4 },
    { role: 'Hospitality', filled: 25, open: 5 },
  ];

  const recentRequests = [
    { id: 1, name: 'John Smith', role: 'Cleaner', shift: 'Morning Cleaning', date: 'Sep 24, 2026', status: 'Pending' },
    { id: 2, name: 'Sarah Wilson', role: 'Supervisor', shift: 'Site Supervisor', date: 'Sep 25, 2026', status: 'Approved' },
    { id: 3, name: 'Michael Brown', role: 'Cleaner', shift: 'Evening Cleaning', date: 'Sep 26, 2026', status: 'Declined' },
    { id: 4, name: 'Emily Davis', role: 'Security Guard', shift: 'Security Guard', date: 'Sep 27, 2026', status: 'Pending' },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        subtitle="Welcome back, Administrator. Real-time overview of your workforce metrics and activity."
        actions={
          <Link to={ROUTES.SHIFTS_CREATE}>
            <Button variant="dark" icon={FiBriefcase}>
              Create Shift
            </Button>
          </Link>
        }
      />

      {/* Workforce Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard title="Active Workers" value="124" change="8.2%" changeText="vs last week" icon={FiUsers} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Today's Attendance" value="92.4%" change="4.5%" changeText="vs yesterday" icon={FiClock} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Total Hours" value="1,248" change="12.4%" changeText="this week" icon={FiCalendar} iconBg="bg-purple-50" iconColor="text-purple-600" />
        <StatCard title="Pending Requests" value="18" change="3" changeText="new today" icon={FiUserPlus} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Compliance Rate" value="96.8%" change="2.1%" changeText="vs last month" icon={FiCheckCircle} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Upcoming Shifts" value="36" change="6" changeText="next 7 days" icon={FiBriefcase} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card header={<h3 className="text-sm font-bold text-slate-900">Attendance Overview (Weekly)</h3>}>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="present" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#presentGrad)" name="Present Workers" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card header={<h3 className="text-sm font-bold text-slate-900">Shift Allocation by Role</h3>}>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftCategoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="role" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip />
                <Bar dataKey="filled" fill="#10b981" radius={[4, 4, 0, 0]} name="Filled Positions" />
                <Bar dataKey="open" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Open Spots" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card
        header={
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Staff Requests</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest shift applications from workers</p>
            </div>
            <Link to={ROUTES.STAFF_REQUESTS} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View All <FiArrowRight size={14} />
            </Link>
          </div>
        }
        padding="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Staff</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Shift</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {recentRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-4 font-semibold text-slate-900">{req.name}</td>
                  <td className="px-5 py-4 text-slate-600">{req.role}</td>
                  <td className="px-5 py-4 text-slate-700">{req.shift}</td>
                  <td className="px-5 py-4 text-slate-500 text-xs">{req.date}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
