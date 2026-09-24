import React from "react";
import { FiUser, FiClock, } from "react-icons/fi";

export default function TopUsers() {
  const users = [
    {
      name: "James",
      role: "Security Staff",
      jobs: 24,
      hours: 186,
    },
    {
      name: "Amit",
      role: "Cleaning Staff",
      jobs: 21,
      hours: 172,
    },
    {
      name: " Brown",
      role: "Event Staff",
      jobs: 19,
      hours: 158,
    },
    {
      name: "Sophia ",
      role: "Hospitality Staff",
      jobs: 17,
      hours: 145,
    },
    {
      name: "Daniel",
      role: "Security Staff",
      jobs: 15,
      hours: 132,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Top Users
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Most active workers
          </p>
        </div>

        <button className="text-sm font-medium text-gray-600 hover:text-black">
          View All
        </button>
      </div>

      
      <div className="space-y-5">
        {
         users.map((user, index) => (
          <div
            key={index}
            className="flex items-center justify-between"
          >
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <FiUser className="text-gray-600" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {user.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {user.role}
                </p>
              </div>
            </div>

        
            <div className="flex items-center gap-7">
              <div className="text-right">
                <div className="flex items-center gap-3 text-gray-700">
                  <span className="text-sm font-medium gap-3">
                    {user.jobs}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Jobs
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-gray-700">
                  <FiClock size={13} />
                  <span className="text-sm font-medium">
                    {user.hours}h
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Hours
                </p>
              </div>
            </div>
          </div>
         ))
        }
      </div>
    </div>
  );
}