import React, { useState } from "react";
import { FiMessageSquare, FiBell, FiChevronDown, FiUser, FiSettings, FiLogOut, } from "react-icons/fi";
import { Link } from "react-router-dom";
export default function Header() {

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false)

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-end px-6">

      <div className="flex items-center gap-3">


        <Link to={"/customer-support"}>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition">
            <FiMessageSquare size={19} className="text-gray-600" />
          </button>
        </Link>


        <button
          onClick={() => setNotificationOpen(!notificationOpen)}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition">
          <FiBell size={19} className="text-gray-600" />

          {/* <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span> */}
        </button>


        <div className="relative ml-2">

          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition"
          >

            {/* <img
              src="/profile.png"
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            /> */}


            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-900">
                Admin
              </p>

              <p className="text-xs text-gray-500">
                Super Admin
              </p>
            </div>

            <FiChevronDown
              size={17}
              className="text-gray-500 transition-transform"
            />
          </button>


          {
            profileOpen && (
              <div className="absolute right-0 top-14 w-40  bg-white border border-gray-200 rounded-2xl shadow-lg py-2 z-50">

                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-200 transition">
                  <FiUser size={17} />
                  <span>My Profile</span>
                </button>


                <Link to={"/settings"}>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-200 transition">
                    <FiSettings size={17} />
                    <span>Settings</span>
                  </button>
                </Link>


                <div className="border-t border-gray-100  pt-1">
                  <Link to={"/login"}>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition">
                      <FiLogOut size={17} />
                      <span>Logout</span>
                    </button>
                  </Link>
                </div>

              </div>
            )
          }

          {
            notificationOpen && (
              <div className="absolute right-0 top-17 w-[400px] bg-white border border-gray-200 rounded-2xl shadow-xl  overflow-hidden">

              
                <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
                  <h2 className="text-[17px] font-semibold text-slate-800">
                    Notifications
                  </h2>

                  <span className="text-sm font-semibold text-indigo-600">
                    29 unread
                  </span>
                </div>

              
                <div className="max-h-[600px] overflow-y-auto">


                  <div className="px-5 py-5 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <h3 className="text-[12px] font-semibold text-slate-800">
                        order status updated
                      </h3>

                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        20.9.2312
                      </span>

                    </div>

                    
                    <p className="mt-1 text-sm  text-slate-500 pr-2">
                      Order ORD-20260827-000001 status changed to DISPATCHED
                    </p>

                  
                    <div className="mt-3">
                      <span className="block w-2 h-2 bg-red-500 rounded-full"></span>
                    </div>

                  </div>


                </div>
              </div>
            )
          }

        </div>

      </div>
    </header>
  );
}





