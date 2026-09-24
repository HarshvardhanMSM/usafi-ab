import React, { useState } from "react";
import { FiGrid, FiUsers, FiCalendar, FiClock, FiFileText, FiCheckCircle, FiBell, FiSettings, FiLogOut, FiChevronLeft, FiMessageSquare, } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";


export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const navigate = useNavigate();

    const menuSections = [
        {
            title: "WORKFORCE",
            items: [
                {
                    name: "Staff",
                    icon: <FiUsers />,
                    path: "staff"
                },
                {
                    name: "Staff Requests",
                    icon: <FiUsers />,
                    path: "staff-request"
                },
            ],
        },

        {
            title: "MANAGEMENT",
            items: [
                {
                    name: "Shifts",
                    icon: <FiCalendar />,
                    path: "shift"
                },
                {
                    name: "Attendance",
                    icon: <FiClock />,
                },
                {
                    name: "Documents",
                    icon: <FiFileText />,
                },
                {
                    name: "Compliance",
                    icon: <FiCheckCircle />,
                },
            ],
        },

        {
            title: "USER MANAGEMENT",
            items: [
                {
                    name: "Admin Users",
                    icon: <FiUsers/>,
                    path: "admin-user"
                },
                {
                    name: "Roles & Permissions",
                    icon: <FiUsers />,
                    path: "role-permission"

                },
                {
                    name: "Permissions",
                    icon: <FiUsers />,
                    path: "permissions"
                },
                {
                    name: "Audit Logs",
                    icon: <FiUsers />,
                    path: "audit"
                },
            ],
        },

        {
            title: "COMMUNICATION",
            items: [
                {
                    name: "Announcements",
                    icon: <FiBell />,
                },
            ],
        },

        {
            title: "SYSTEM",
            items: [
                {
                    name: "Notification",
                    icon: <FiBell />,
                    path: "notification"
                },
            ],
        },

        {
            title: "CUSTOMERS",
            items: [
                {
                    name: "Customer",
                    icon: <FiUsers />,
                    path: "Customer"
                },
                 {
                    name: "Customer Support",
                    icon: <FiMessageSquare />,
                    path: "customer-support"
                },
            ],
        },
    ];

    return (

        <aside className={` ${collapsed ? "w-[88px]" : "w-64"} h-screen sticky top-0  bg-white     border-r border-gray-200 flex flex-col shrink-0  duration-300`}>


            <div className={`h-20 flex items-center  border-b border-gray-200 ${collapsed ?  "justify-center px-3" : "px-5"}`}>

                <div
                    className={`h-11 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center   duration-300
                    ${collapsed ? "w-14" : "w-full"}`}>
                    <h1
                        className={` text-white font-bold  ${collapsed ? "text-sm" : "text-xl"}`}
                    >
                        USAFI
                    </h1>
                </div>

            </div>



            <nav className="flex-1 px-3 py-5  overflow-y-auto">


                <button
                    title={collapsed ? "Dashboard" : ""}
                    className={` w-full flex items-center ${collapsed ? "justify-center" : "gap-3"}  px-3 py-3 mb-6 rounded-xl bg-blue-50 text-blue-600  border-blue-600 `}>

                    <FiGrid className="text-xl shrink-0" />

                    {
                        !collapsed && (
                            <span className="text-sm font-semibold">
                                Dashboard
                            </span>
                        )
                    }

                </button>



                {
                    menuSections.map((section) => (
                        <div key={section.title}
                            className="mb-6"
                        >


                            {!collapsed && (
                                <p className="text-[11px] font-bold tracking-wider text-gray-400 px-3 mb-2">
                                    {section.title}
                                </p>
                            )}



                            <div className="space-y-1">

                                {
                                    section.items.map((item) => (
                                        <NavLink
                                            to={item.path}
                                            key={item.name}
                                            title={collapsed ? item.name : ""}
                                            className={`w-full h-11 flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600transition-all duration-200`} >

                                            <span className="text-xl shrink-0">
                                                {item.icon}
                                            </span>

                                            {!collapsed && (
                                                <span className="text-sm font-medium whitespace-nowrap">
                                                    {item.name}
                                                </span>
                                            )}

                                        </NavLink>
                                    ))
                                }

                            </div>

                        </div>
                    ))
                }

            </nav>

            <div className="border-t h-34 border-gray-200 p-3">


                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                      ${isActive
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-500 hover:bg-gray-50"
                        }`
                    }
                >
                    <FiSettings size={19} />

                    {!collapsed && <span>Settings</span>}
                </NavLink>



                <button
                    onClick={() => setShowLogoutModal(true)}

                    className="w-full flex items-center gap-2 px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-red-600 rounded-xl transition"
                >
                    <FiLogOut size={20} />

                    {!collapsed && (
                        <span className="text-sm font-medium">
                            Logout
                        </span>
                    )}
                </button>



                <div className="  border-t border-gray-100">

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? "Show sidebar" : "Hide sidebar"}
                        className={`w-full h-8 flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900`}>

                        <FiChevronLeft className={`text-xl transition-transform duration-300`} />

                        {!collapsed && (
                            <span className="text-sm font-medium">
                                Hide
                            </span>
                        )}

                    </button>

                </div>

            </div>

        {
            showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

                    <div className="w-[400px] bg-white rounded-2xl p-6 shadow-xl">

                       
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <FiLogOut className="text-red-600" size={22} />
                        </div>

                      
                        <h2 className="text-xl font-semibold text-gray-900">
                            Logout
                        </h2>

                        <p className="text-sm text-gray-500 mt-2">
                            Are you sure you want to logout from the admin panel?
                        </p>

                      
                        <div className="flex justify-end gap-3 mt-6">

                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    setShowLogoutModal(false);
                                    navigate("/login");
                                }}
                                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                            >
                                Logout
                            </button>

                        </div>

                    </div>

                </div>
            )
        }

        </aside>
    );
}