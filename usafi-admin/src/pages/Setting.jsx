import React from "react";
import {FiUser,FiLock,FiBell,FiGlobe,FiShield,FiFileText,FiChevronRight,} from "react-icons/fi";

export default function Settings() {
  const settings = [
    {
      icon: FiUser,
      title: "Profile Settings",
      description: "Manage your admin profile and personal information",
    },
    {
      icon: FiLock,
      title: "Password & Security",
      description: "Update your password and security preferences",
    },
    {
      icon: FiBell,
      title: "Notifications",
      description: "Manage email and push notification preferences",
    },
    {
      icon: FiGlobe,
      title: "General Settings",
      description: "Manage language, timezone and system preferences",
    },
    {
      icon: FiShield,
      title: "Admin Roles & Permissions",
      description: "Manage access and permissions for admin users",
    },
    {
      icon: FiFileText,
      title: "Policies & Guidelines",
      description: "Manage internal policies and workforce guidelines",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] p-8">

      
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your account and system preferences
        </p>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

       
        <div className="bg-white rounded-2xl border border-gray-200 p-3 h-fit">

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 text-gray-900 text-sm font-medium">
            <FiUser size={18} />
            Account
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 text-sm">
            <FiBell size={18} />
            Notifications
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 text-sm">
            <FiShield size={18} />
            Security
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 text-sm">
            <FiGlobe size={18} />
            Preferences
          </button>

        </div>

       
        <div className="lg:col-span-3 space-y-6">

          
          <div className="bg-white rounded-2xl border border-gray-200 p-6">

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Admin Profile
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Your account information
              </p>
            </div>

            <div className="flex items-center gap-5 pb-6 border-b border-gray-100">

              <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-semibold">
                SA
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Super Admin
                </h3>

                <p className="text-sm text-gray-500">
                  Administrator
                </p>
              </div>

              <button className="ml-auto px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">
                Edit Profile
              </button>

            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value="Super Admin"
                  readOnly
                  className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>

                <input
                  type="text"
                  value="admin@usafi.com"
                  readOnly
                  className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 outline-none"
                />
              </div>

            </div>

          </div>

         
          <div className="bg-white rounded-2xl border border-gray-200 p-6">

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                System Settings
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Configure your workforce management system
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {
              settings.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={index}
                    className="group flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition"
                  >

                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                      <Icon size={20} />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {item.title}
                      </h3>

                      <p className="text-xs text-gray-500 mt-1 leading-5">
                        {item.description}
                      </p>
                    </div>

                    <FiChevronRight
                      size={18}
                      className="text-gray-400 group-hover:text-gray-700"
                    />

                  </div>
                );
              })
            }

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}