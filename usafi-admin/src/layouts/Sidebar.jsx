import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FiGrid,
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiClock,
  FiFileText,
  FiCheckCircle,
  FiShield,
  FiKey,
  FiLock,
  FiList,
  FiVolume2,
  FiBell,
  FiBriefcase,
  FiMessageSquare,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiX,
} from 'react-icons/fi';
import { ROUTES } from '../constants/routes';
import { Tooltip } from '../components/ui/Tooltip';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = ({ collapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate(ROUTES.LOGIN);
  };

  const menuSections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', icon: FiGrid, path: ROUTES.DASHBOARD },
      ],
    },
    {
      title: 'WORKFORCE',
      items: [
        { name: 'Staff', icon: FiUsers, path: ROUTES.STAFF },
        { name: 'Staff Requests', icon: FiUserCheck, path: ROUTES.STAFF_REQUESTS },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Shifts', icon: FiCalendar, path: ROUTES.SHIFTS },
        { name: 'Attendance', icon: FiClock, path: ROUTES.ATTENDANCE },
        { name: 'Documents', icon: FiFileText, path: ROUTES.DOCUMENTS },
        { name: 'Compliance', icon: FiCheckCircle, path: ROUTES.COMPLIANCE },
      ],
    },
    {
      title: 'USER MANAGEMENT',
      items: [
        { name: 'Admin Users', icon: FiShield, path: ROUTES.ADMIN_USERS },
        { name: 'Roles & Permissions', icon: FiKey, path: ROUTES.ROLES_PERMISSIONS },
        { name: 'Permissions', icon: FiLock, path: ROUTES.PERMISSIONS },
        { name: 'Audit Logs', icon: FiList, path: ROUTES.AUDIT_LOGS },
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        { name: 'Announcements', icon: FiVolume2, path: ROUTES.ANNOUNCEMENTS },
        { name: 'Notifications', icon: FiBell, path: ROUTES.NOTIFICATIONS },
      ],
    },
    {
      title: 'CUSTOMERS',
      items: [
        { name: 'Customer', icon: FiBriefcase, path: ROUTES.CUSTOMER },
        { name: 'Customer Support', icon: FiMessageSquare, path: ROUTES.CUSTOMER_SUPPORT },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className={`h-16 flex items-center border-b border-slate-100 px-4 justify-between shrink-0`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'mx-auto' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
            U
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">USAFI</h1>
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest">Workforce Admin</span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button onClick={onCloseMobile} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600">
          <FiX size={20} />
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {menuSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== ROUTES.DASHBOARD && location.pathname.startsWith(item.path));

                const linkNode = (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={`w-full h-10 flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={19} className={`shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </NavLink>
                );

                return collapsed ? (
                  <Tooltip key={item.name} text={item.name} position="right">
                    {linkNode}
                  </Tooltip>
                ) : (
                  linkNode
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Controls */}
      <div className="p-3 border-t border-slate-100 space-y-1 shrink-0">
        <NavLink
          to={ROUTES.SETTINGS}
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `w-full h-10 flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 rounded-xl text-sm font-medium transition ${
              isActive ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`
          }
        >
          <FiSettings size={19} className="text-slate-400 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={() => setShowLogoutModal(true)}
          className={`w-full h-10 flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition`}
          title={collapsed ? 'Logout' : ''}
        >
          <FiLogOut size={19} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex w-full h-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition mt-2"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <FiChevronLeft className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} size={18} />
        </button>
      </div>

      <ConfirmDialog
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout Confirmation"
        description="Are you sure you want to logout from the Usafi Admin Panel?"
        confirmText="Logout"
      />
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block h-screen sticky top-0 ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 z-30 shrink-0`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative w-64 max-w-xs h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
