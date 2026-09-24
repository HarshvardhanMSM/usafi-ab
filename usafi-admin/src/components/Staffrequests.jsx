import React, { useState } from "react";
import {FiSearch,FiFilter,FiEye,FiCheck,FiX,FiClock,FiUsers,FiCheckCircle,FiXCircle,FiMapPin,FiCalendar} from "react-icons/fi";

export default function Staffrequests() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const requests = [
    {
      id: 1,
      name: "John Smith",
      initials: "JS",
      role: "Cleaner",
      shift: "Morning Cleaning",
      date: "Sep 24, 2026",
      time: "08:00 AM - 04:00 PM",
      location: "Jaipur",
      pay: "$18 / hour",
      applied: "Sep 23, 2026",
      status: "Pending",
    },
    {
      id: 2,
      name: "Sarah Wilson",
      initials: "SW",
      role: "Supervisor",
      shift: "Site Supervisor",
      date: "Sep 25, 2026",
      time: "09:00 AM - 05:00 PM",
      location: "Jaipur",
      pay: "$25 / hour",
      applied: "Sep 23, 2026",
      status: "Approved",
    },
    {
      id: 3,
      name: "Mike Brown",
      initials: "MB",
      role: "Cleaner",
      shift: "Evening Cleaning",
      date: "Sep 26, 2026",
      time: "04:00 PM - 10:00 PM",
      location: "Jaipur",
      pay: "$18 / hour",
      applied: "Sep 22, 2026",
      status: "Declined",
    },
    {
      id: 4,
      name: "Emma Davis",
      initials: "ED",
      role: "Security",
      shift: "Security Guard",
      date: "Sep 27, 2026",
      time: "08:00 AM - 06:00 PM",
      location: "Jaipur",
      pay: "$22 / hour",
      applied: "Sep 23, 2026",
      status: "Pending",
    },
    {
      id: 5,
      name: "Daniel Lee",
      initials: "DL",
      role: "Cleaner",
      shift: "Deep Cleaning",
      date: "Sep 28, 2026",
      time: "10:00 AM - 06:00 PM",
      location: "Jaipur",
      pay: "$20 / hour",
      applied: "Sep 22, 2026",
      status: "Pending",
    },
  ];

  const filteredRequests =
    activeFilter === "All"
      ? requests
      : requests.filter((request) => request.status === activeFilter);

  const statusStyle = (status) => {
    if (status === "Approved") {
      return "bg-green-50 text-green-600";
    }

    if (status === "Declined") {
      return "bg-red-50 text-red-600";
    }

    return "bg-yellow-50 text-yellow-600";
  };

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">

      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Staff Requests
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Review and manage staff requests for available shifts.
        </p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                24
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <FiUsers className="text-blue-600" size={21} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                8
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center">
              <FiClock className="text-yellow-600" size={21} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                12
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
              <FiCheckCircle className="text-green-600" size={21} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Declined</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                4
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <FiXCircle className="text-red-600" size={21} />
            </div>
          </div>
        </div>

      </div>

      
      <div className="bg-white rounded-2xl border border-gray-100">

        
        <div className="p-5 border-b border-gray-100">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

           
            <div className="relative w-full lg:w-80">
              <FiSearch
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search staff or shift..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
              />
            </div>

            
            <div className="flex items-center gap-2">

              <FiFilter className="text-gray-400" />

            {
              ["All", "Pending", "Approved", "Declined"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      activeFilter === filter
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {filter}
                  </button>
                )
              )
            }

            </div>

          </div>

        </div>

       
        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">

                <th className="px-6 py-4 font-medium">
                  Staff
                </th>

                <th className="px-6 py-4 font-medium">
                  Shift
                </th>

                <th className="px-6 py-4 font-medium">
                  Date & Time
                </th>

                <th className="px-6 py-4 font-medium">
                  Location
                </th>

                <th className="px-6 py-4 font-medium">
                  Applied
                </th>

                <th className="px-6 py-4 font-medium">
                  Status
                </th>

                <th className="px-6 py-4 font-medium text-right">
                  Action
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

            {
              filteredRequests.map((request) => (

                <tr
                  key={request.id}
                  className="hover:bg-gray-50 transition"
                >

                  
                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-sm">
                        {request.initials}
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">
                          {request.name}
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5">
                          {request.role}
                        </p>
                      </div>

                    </div>

                  </td>

                  
                  <td className="px-6 py-4">

                    <p className="text-sm font-medium text-gray-800">
                      {request.shift}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {request.pay}
                    </p>

                  </td>

                 
                  <td className="px-6 py-4">

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FiCalendar size={15} className="text-gray-400" />
                      {request.date}
                    </div>

                    <p className="text-xs text-gray-500 mt-1 ml-5">
                      {request.time}
                    </p>

                  </td>

                 
                  <td className="px-6 py-4">

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiMapPin size={15} className="text-gray-400" />
                      {request.location}
                    </div>

                  </td>

              
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {request.applied}
                  </td>

               
                  <td className="px-6 py-4">

                    <span
                      className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium ${statusStyle(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>

                  </td>

                  
                  <td className="px-6 py-4">

                    <div className="flex items-center justify-end gap-2">

                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
                        title="View"
                      >
                        <FiEye size={17} />
                      </button>

                    {
                      request.status === "Pending" && (
                        <>
                          <button
                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                            title="Approve"
                          >
                            <FiCheck size={17} />
                          </button>

                          <button
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                            title="Decline"
                          >
                            <FiX size={17} />
                          </button>
                        </>
                      )
                    }

                    </div>

                  </td>

                </tr>

              ))
              
            }

            </tbody>

          </table>

        </div>

      </div>

      
      {
      selectedRequest && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl">

           
            <div className="flex items-center justify-between p-6 border-b border-gray-100">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Request Details
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Review staff request
                </p>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>

            </div>

           
            <div className="p-6">

              <div className="flex items-center gap-4 mb-6">

                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {selectedRequest.initials}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedRequest.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {selectedRequest.role}
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Shift
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {selectedRequest.shift}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Pay Rate
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {selectedRequest.pay}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Date
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {selectedRequest.date}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Location
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {selectedRequest.location}
                  </p>
                </div>

              </div>

             
            {
              selectedRequest.status === "Pending" && (

                <div className="flex gap-3 mt-6">

                  <button className="flex-1 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 flex items-center justify-center gap-2">
                    <FiCheck />
                    Approve Request
                  </button>

                  <button className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 flex items-center justify-center gap-2">
                    <FiX />
                    Decline
                  </button>

                </div>

              )
            }

            </div>

          </div>

        </div>

      )}

    </div>
  );
}