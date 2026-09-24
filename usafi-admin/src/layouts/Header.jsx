import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiMenu,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiMessageSquare,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from '../components/ui/Avatar';

export const Header = ({ onOpenMobile }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const sampleNotifications = [
    {
      id: 1,
      title: 'New Staff Request Submitted',
      message: 'John Smith applied for Morning Cleaning Shift.',
      time: '10 mins ago',
      icon: FiUser,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 2,
      title: 'Document Verification Pending',
      message: 'Sarah Wilson uploaded updated ID & Health Clearance.',
      time: '1 hour ago',
      icon: FiAlertCircle,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 3,
      title: 'Shift Fully Staffed',
      message: 'Event Assistant shift (Jaipur JEC) reached full capacity.',
      time: '3 hours ago',
      icon: FiCheckCircle,
      color: 'text-emerald-600 bg-emerald-50',
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile Toggle & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          aria-label="Open sidebar"
        >
          <FiMenu size={20} />
        </button>
      </div>

      {/* Action Controls & Profile Menu */}
      <div className="flex items-center gap-3">
        {/* Customer Support Quick Link */}
        <Link to={ROUTES.CUSTOMER_SUPPORT}>
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            title="Customer Support"
          >
            <FiMessageSquare size={19} />
          </button>
        </Link>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              setProfileOpen(false);
            }}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            title="Notifications"
          >
            <FiBell size={19} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
          </button>

          {notificationOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                <Link
                  to={ROUTES.NOTIFICATIONS}
                  onClick={() => setNotificationOpen(false)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {sampleNotifications.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="p-4 hover:bg-slate-50/80 transition flex items-start gap-3 cursor-pointer">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{item.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationOpen(false);
            }}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <Avatar name={user?.name || 'Super Admin'} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'Super Admin'}</p>
              <p className="text-[11px] font-medium text-slate-500">{user?.role || 'Administrator'}</p>
            </div>
            <FiChevronDown size={16} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 md:hidden">
                <p className="text-xs font-bold text-slate-900">{user?.name || 'Super Admin'}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
              </div>
              <Link
                to={ROUTES.SETTINGS}
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <FiUser size={15} />
                <span>Profile</span>
              </Link>
              <Link
                to={ROUTES.SETTINGS}
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <FiSettings size={15} />
                <span>Settings</span>
              </Link>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
              >
                <FiLogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
