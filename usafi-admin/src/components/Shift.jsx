import React from "react";
import {FiPlus,FiSearch,FiFilter,FiMoreVertical,FiMapPin,FiCalendar,FiClock,FiUsers,FiDollarSign,} from "react-icons/fi";

export default function Shift() {
  const shifts = [
    {
      id: 1,
      job: "Event Staff",
      role: "Event Assistant",
      date: "24 Sep 2026",
      time: "09:00 AM - 05:00 PM",
      location: "Jaipur Exhibition Centre",
      pay: "$18/hr",
      workers: "8 / 10",
      status: "Open",
    },
    {
      id: 2,
      job: "Cleaning Staff",
      role: "Cleaner",
      date: "25 Sep 2026",
      time: "08:00 AM - 04:00 PM",
      location: "City Mall, Jaipur",
      pay: "$16/hr",
      workers: "12 / 12",
      status: "Filled",
    },
    {
      id: 3,
      job: "Security Staff",
      role: "Security Guard",
      date: "26 Sep 2026",
      time: "06:00 PM - 02:00 AM",
      location: "Grand Hotel",
      pay: "$20/hr",
      workers: "5 / 8",
      status: "Open",
    },
    {
      id: 4,
      job: "Hospitality",
      role: "Waiter",
      date: "27 Sep 2026",
      time: "10:00 AM - 06:00 PM",
      location: "Royal Palace",
      pay: "$17/hr",
      workers: "6 / 6",
      status: "Filled",
    },
    {
      id: 5,
      job: "Warehouse Staff",
      role: "Warehouse Assistant",
      date: "28 Sep 2026",
      time: "07:00 AM - 03:00 PM",
      location: "Industrial Area",
      pay: "$19/hr",
      workers: "4 / 10",
      status: "Open",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">

     
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Shifts
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage workforce schedules and shift assignments
          </p>
        </div>

        <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
          <FiPlus size={18} />
          Create Shift
        </button>
      </div>

     
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">

       
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Shifts
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-2">
                48
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                This month
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
              <FiCalendar className="text-gray-700" size={20} />
            </div>
          </div>
        </div>

       
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Upcoming
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-2">
                24
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Next 7 days
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <FiClock className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Filled
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-2">
                17
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Fully staffed
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
              <FiUsers className="text-green-600" size={20} />
            </div>
          </div>
        </div>

       
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Open
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-2">
                7
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Need workers
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
              <FiUsers className="text-orange-600" size={20} />
            </div>
          </div>
        </div>

      </div>

      
      <div className="bg-white border border-gray-200 rounded-2xl">

       
        <div className="p-5 border-b border-gray-200">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

           
            <div className="relative w-full lg:w-80">
              <FiSearch
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search shifts..."
                className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400"
              />
            </div>

            
            <div className="flex items-center gap-3">

              <button className="flex items-center gap-2 h-11 px-4 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                <FiFilter size={17} />
                Filter
              </button>

              <select className="h-11 px-4 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none">
                <option>All Status</option>
                <option>Open</option>
                <option>Filled</option>
              </select>

            </div>

          </div>

        </div>

        
        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70">

                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500">
                  JOB / ROLE
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500">
                  DATE & TIME
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500">
                  LOCATION
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500">
                  PAY RATE
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500">
                  WORKERS
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500">
                  STATUS
                </th>

                <th className="text-right px-5 py-4 text-xs font-semibold text-gray-500">
                  ACTION
                </th>

              </tr>
            </thead>

            <tbody>

            {
              shifts.map((shift) => (

                <tr
                  key={shift.id}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition"
                >

                  
                  <td className="px-5 py-5">

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {shift.job}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {shift.role}
                      </p>
                    </div>

                  </td>

                 
                  <td className="px-5 py-5">

                    <div className="flex items-start gap-2">

                      <FiCalendar
                        size={16}
                        className="text-gray-400 mt-0.5"
                      />

                      <div>
                        <p className="text-sm text-gray-700">
                          {shift.date}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {shift.time}
                        </p>
                      </div>

                    </div>

                  </td>

                  
                  <td className="px-5 py-5">

                    <div className="flex items-center gap-2">

                      <FiMapPin
                        size={16}
                        className="text-gray-400"
                      />

                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        {shift.location}
                      </span>

                    </div>

                  </td>

                  
                  <td className="px-5 py-5">

                    <div className="flex items-center gap-1.5">

                      <FiDollarSign
                        size={15}
                        className="text-gray-400"
                      />

                      <span className="text-sm font-medium text-gray-700">
                        {shift.pay}
                      </span>

                    </div>

                  </td>

                  
                  <td className="px-5 py-5">

                    <div className="flex items-center gap-2">

                      <FiUsers
                        size={16}
                        className="text-gray-400"
                      />

                      <span className="text-sm text-gray-700">
                        {shift.workers}
                      </span>

                    </div>

                  </td>

                  
                  <td className="px-5 py-5">

                    <span
                      className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium ${
                        shift.status === "Open"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {shift.status}
                    </span>

                  </td>

                 
                  <td className="px-5 py-5 text-right">

                    <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500">
                      <FiMoreVertical size={18} />
                    </button>

                  </td>

                </tr>

              ))
              
            }

            </tbody>

          </table>

        </div>

       
        <div className="px-5 py-4 flex items-center justify-between border-t border-gray-200">

          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-700">5</span> of{" "}
            <span className="font-medium text-gray-700">48</span> shifts
          </p>

          <div className="flex items-center gap-2">

            <button className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-400">
              Previous
            </button>

            <button className="px-3 py-2 text-sm bg-gray-900 text-white rounded-lg">
              1
            </button>

            <button className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600">
              2
            </button>

            <button className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600">
              3
            </button>

            <button className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600">
              Next
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}