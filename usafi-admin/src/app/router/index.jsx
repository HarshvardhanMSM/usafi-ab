import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage';
import { StaffListPage } from '../../features/staff/pages/StaffListPage';
import { StaffDetailPage } from '../../features/staff/pages/StaffDetailPage';
import { StaffRequestsPage } from '../../features/staff-requests/pages/StaffRequestsPage';
import { ShiftsPage } from '../../features/shifts/pages/ShiftsPage';
import { CreateShiftPage } from '../../features/shifts/pages/CreateShiftPage';
import { AttendancePage } from '../../features/attendance/pages/AttendancePage';
import { DocumentsPage } from '../../features/documents/pages/DocumentsPage';
import { CompliancePage } from '../../features/compliance/pages/CompliancePage';
import { AdminUsersPage } from '../../features/admin-users/pages/AdminUsersPage';
import { RolesPermissionsPage } from '../../features/roles-permissions/pages/RolesPermissionsPage';
import { PermissionsPage } from '../../features/permissions/pages/PermissionsPage';
import { AuditLogsPage } from '../../features/audit-logs/pages/AuditLogsPage';
import { AnnouncementsPage } from '../../features/announcements/pages/AnnouncementsPage';
import { NotificationsPage } from '../../features/notifications/pages/NotificationsPage';
import { CustomerPage } from '../../features/customer/pages/CustomerPage';
import { CustomerSupportPage } from '../../features/customer-support/pages/CustomerSupportPage';
import { SettingsPage } from '../../features/settings/pages/SettingsPage';
import { ROUTES } from '../../constants/routes';

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.HOME,
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'staff',
        element: <StaffListPage />,
      },
      {
        path: 'staff/:id',
        element: <StaffDetailPage />,
      },
      {
        path: 'staff-requests',
        element: <StaffRequestsPage />,
      },
      {
        path: 'shifts',
        element: <ShiftsPage />,
      },
      {
        path: 'shifts/create',
        element: <CreateShiftPage />,
      },
      {
        path: 'attendance',
        element: <AttendancePage />,
      },
      {
        path: 'documents',
        element: <DocumentsPage />,
      },
      {
        path: 'compliance',
        element: <CompliancePage />,
      },
      {
        path: 'admin-users',
        element: <AdminUsersPage />,
      },
      {
        path: 'roles-permissions',
        element: <RolesPermissionsPage />,
      },
      {
        path: 'permissions',
        element: <PermissionsPage />,
      },
      {
        path: 'audit-logs',
        element: <AuditLogsPage />,
      },
      {
        path: 'announcements',
        element: <AnnouncementsPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'customer',
        element: <CustomerPage />,
      },
      {
        path: 'customer-support',
        element: <CustomerSupportPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
]);
