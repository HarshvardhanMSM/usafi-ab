import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "./layout/Dashboardlayout";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Setting";
import Login from "./pages/Login";
import AdminUsers from "./components/AdminUsers";
import Rolespermission from "./components/Rolespermission";
import Permissions from "./components/Permissions";
import Audit from "./components/Audit";
import Customer from "./components/Customer";
import Customersupport from "./components/Customersupport";
import Shift from "./components/Shift";
import Staff from "./components/Staff";
import Staffrequests from "./components/Staffrequests";
import Notification from "./components/Notification";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "admin-user",
        element: <AdminUsers />,
      },
      {
        path: "role-permission",
        element: <Rolespermission />,
      },
      {
        path: "permissions",
        element: < Permissions/>,
      },
      {
        path: "audit",
        element: < Audit/>,
      },
      {
        path: "customer-support",
        element: < Customersupport/>,
      },
      {
        path: "customer",
        element: < Customer/>,
      },
      {
        path: "shift",
        element: < Shift/>,
      },
      {
        path: "staff",
        element: < Staff/>,
      },
      {
        path: "staff-request",
        element: < Staffrequests/>,
      },
      {
        path: "notification",
        element: <Notification/>,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

export default router;