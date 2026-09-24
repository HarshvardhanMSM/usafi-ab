import React from "react";
import { FiUser, FiClock, FiArrowRight } from "react-icons/fi";

export default function RecentStaffRequests() {
  const requests = [
    {
      id: 1,
      name: "John Smith",
      role: "Accounts",
      time: "Today, 10:30 AM",
      status: "Pending",
    },
    {
      id: 2,
      name: "Sarah Wilson",
      role: "Supervisor",
      time: "Today, 09:45 AM",
      status: "Approved",
    },
    {
      id: 3,
      name: "Michael Brown",
      role: "business analyst",
      time: "Yesterday, 04:20 PM",
      status: "Pending",
    },
    {
      id: 4,
      name: "Emma Davis",
      role: "manager",
      time: "Yesterday, 02:15 PM",
      status: "Declined",
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

      
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Staff Requests
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Latest staff shift requests
          </p>
        </div>

        <button className="flex items-center ml-4 gap-2 text-sm font-medium text-gray-700 hover:text-black">
          View All
        </button>
      </div>

    
      <div>
        {
          requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition"
          >
            
            <div className="flex items-center gap-4">

            
              <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                <FiUser className="text-gray-500" size={19} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {request.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {request.role}
                </p>

                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <FiClock size={12} />
                  {request.time}
                </div>
              </div>
            </div>

    
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-medium
                ${
       request.status === "Pending" ? "bg-yellow-50 text-yellow-700": request.status === "Approved"
                    ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }
              `}
            >
              {request.status}
            </span>
          </div>
          ))
        }
      </div>
    </div>
  );
}