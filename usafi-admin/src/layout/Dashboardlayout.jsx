import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen">

      <Sidebar />

      <div className="flex-1">
        <Header />

        <Outlet />
      </div>

    </div>
  );
}