import React from "react";
import {   FiRefreshCw,  FiSearch, FiChevronDown,  FiShoppingCart, FiEye, FiTrash2, } from "react-icons/fi";

export default function AdminUsers() {

    const notifications = [
        {
            title: "Order Status Updated",
            message:
                "Order ORD-20260827-000001 status changed to DISPATCHED",
            date: "8/27/2026",
            type: "ORDER",
            unread: true,
        },
        {
            title: "Order Status Updated",
            message:
                "Order ORD-20260827-000001 status changed to PACKED",
            date: "8/27/2026",
            type: "ORDER",
            unread: true,
        },
        {
            title: "Order Status Updated",
            message:
                "Order ORD-20260728-000004 status changed to PROCESSING",
            date: "7/28/2026",
            type: "ORDER",
            unread: true,
        },
        {
            title: "Order Status Updated",
            message:
                "Order ORD-20260728-000004 status changed to CONFIRMED",
            date: "7/28/2026",
            type: "ORDER",
            unread: true,
        },
        {
            title: "New Order",
            message:
                "Order ORD-20260728-000004 placed by Harshvardhan (harshvardhan.swami@mscoretech.com)",
            date: "7/28/2026",
            type: "ORDER",
            unread: true,
        },
    ];

    const categories = [
        {
            name: "All Notifications",
            count: 29,
            active: true,
        },
        {
            name: "Unread",
            count: 29,
        },
        {
            name: "Orders",
            count: 0,
        },
        {
            name: "Inventory",
            count: 0,
        },
        {
            name: "Customers",
            count: 0,
        },
        {
            name: "System Alerts",
            count: 0,
        },
    ];
    return (
        <main className="min-h-screen bg-[#f7f9fc] px-8 py-8">


            <div className="flex items-start justify-between mb-8">

                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-1 h-7 bg-[#5138ee] rounded-full"></div>

                        <span className="text-sm font-bold tracking-wide text-[#5138ee]">
                            SYSTEM LOGS & ACTIONS
                        </span>
                    </div>

                    <h1 className="text-[30px] font-bold text-[#17233c]">
                        Notifications Center
                    </h1>

                    <p className="mt-1 text-[16px] text-[#71809a]">
                        Track active store actions, inventory alerts, orders, and system health status.


                    </p>
                </div>

            </div>


            <div className="bg-white border border-[#dfe5ef] rounded-2xl p-5 shadow-sm mb-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">

                        <div className="relative max-w-[580px] w-full">

                            <FiSearch
                                size={21}
                                className=" absolute left-5 top-1/2 -translate-y-1/2 text-[#8da0bc]"
                            />

                            <input type="text"
                                placeholder="Search title or message.."
                                className=" w-110 h-12 pl-14 pr-5 rounded-2xl border border-[#dfe5ef] outline-none text-[#34435d] placeholder:text-[#9aa8bb] focus:border [#5138ee]  "
                            />

                        </div>



                        <button
                            className="h-12 px-5 min-w-[150px] flex items-center justify-between  bg-[#e0e4e9] border border-[#dfe5ef] text-sm rounded-2xl text-[#0d63f7] font-semibold"
                        >
                            <FiChevronDown
                                size={14}
                                className="text-[#8292aa]"
                            />
                            <span>Mark All Read</span>


                        </button>

                        <button className="h-12 px-6 flex items-center gap-3 bg-white border border-[#dfe5ef] rounded-2xl text-[#34435d] font-semibold shadow-sm hover:bg-gray-50 transition">
                            <FiRefreshCw size={14} />
                            Refresh
                        </button>
                    </div>


                    {/* <span className="text-sm text-[#667894] whitespace-nowrap">
                     1 of 1 users </span> */}

                </div>

            </div>




            
            <div className="flex gap-5 items-start">

                <div className="w-[230px]  bg-white rounded-[22px] border border-gray-200 shadow-sm p-3 h-90">

                    {
                        categories.map((category, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between px-4 py-4 rounded-[16px] mb-1 last:mb-0 cursor-pointer transition ${category.active
                                        ? "bg-[#4f39f6] text-white shadow-md"
                                        : "text-[#455674] hover:bg-gray-50"
                                    }`}
                            >
                                <span className="font-semibold text-[15px]">
                                    {category.name}
                                </span>

                                <span
                                    className={`min-w-[34px] h-[24px] px-2 rounded-full flex items-center justify-center text-xs font-semibold ${category.active
                                            ? "bg-white/20 text-white"
                                            : category.name === "Unread"
                                                ? "bg-red-500 text-white"
                                                : "bg-[#f0f4f8] text-[#53627a]"
                                        }`}
                                >
                                    {category.count}
                                </span>
                            </div>
                        ))
                    }

                </div>

                   
                <div className="flex-1 w-170 bg-white rounded-[22px] border border-gray-200 shadow-sm overflow-hidden">

                    {
                        notifications.map((notification, index) => (
                            <div
                                key={index}
                                className={`relative flex items-start gap-5 px-5 py-5 border-b border-gray-100 last:border-b-0 ${notification.unread
                                        ? "bg-white"
                                        : "bg-gray-50/40"
                                    }`}
                            >

                               
                                <div className="w-[40px] h-[40px]  rounded-[10px] bg-[#eff6ff] border border-[#dceaff] flex items-center justify-center">
                                    <FiShoppingCart
                                        size={25}
                                        className="text-[#1769ff]"
                                    />
                                </div>

                                
                                <div className="flex-1 min-w-0">

                                   
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-[14px] font-bold text-[#202d45]">
                                            {notification.title}
                                        </h3>

                                        {notification.unread && (
                                            <span className="w-[10px] h-[10px] bg-red-500 rounded-full"></span>
                                        )}
                                    </div>

                                    
                                    <p className="mt-2 text-[14px] text-[#667895] truncate pr-10">
                                        {notification.message}
                                    </p>

                                   
                                    <div className="flex items-center gap-4 mt-4">

                                        <span className="text-[12px] font-semibold text-[#91a0b8]">
                                            {notification.date}
                                        </span>

                                        <span className="w-px h-4 bg-gray-200"></span>

                                        <button className="flex items-center gap-2 text-[#4f39f6] text-[12px] font-semibold hover:text-[#3824dc]">
                                            <FiEye size={14} />
                                            View Details
                                        </button>

                                    </div>

                                </div>

                                
                                <div className="flex items-start gap-5 ">

                                   
                                    <span className="px-3 py-1.5 rounded-lg bg-[#f8fafc] border border-gray-100 text-[12px] font-semibold text-[#8b9ab2]">
                                        {notification.type}
                                    </span>

                                   
                                    <button className="w-[42px] h-[42px] rounded-xl border border-gray-100 flex items-center justify-center text-[#8ba0bb] hover:text-red-500 hover:bg-red-50 transition">
                                        <FiTrash2 size={18} />
                                    </button>

                                </div>

                            </div>
                        ))
                    }

                </div>

             </div>
            

        </main>



    );
}








