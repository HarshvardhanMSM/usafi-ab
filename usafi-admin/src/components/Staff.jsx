import React from 'react'
import { useState } from 'react';
import { FiSearch, FiPlus, FiMoreVertical, FiUsers, FiUserCheck, FiClock, FiAlertCircle, FiFilter, } from "react-icons/fi";

export default function Staff() {
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const staff = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@gmail.com",
      role: "Cleaner",
      status: "Active",
      documents: "4/4",
      compliance: "Verified",
      joined: "12 Aug 2026",
    },
    {
      id: 2,
      name: "Sarah Wilson",
      email: "sarah.wilson@gmail.com",
      role: "Supervisor",
      status: "Active",
      documents: "3/4",
      compliance: "Pending",
      joined: "08 Aug 2026",
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael.brown@gmail.com",
      role: "Cleaner",
      status: "Inactive",
      documents: "2/4",
      compliance: "Missing",
      joined: "02 Aug 2026",
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@gmail.com",
      role: "Team Leader",
      status: "Active",
      documents: "4/4",
      compliance: "Verified",
      joined: "28 Jul 2026",
    },
    {
      id: 5,
      name: "David Miller",
      email: "david.miller@gmail.com",
      role: "Cleaner",
      status: "Active",
      documents: "3/4",
      compliance: "Pending",
      joined: "21 Jul 2026",
    },
  ];

  const filteredStaff = staff.filter((person) =>
    person.name.toLowerCase().includes(search.toLowerCase()) ||
    person.email.toLowerCase().includes(search.toLowerCase()) ||
    person.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">


      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Staff
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage your workforce and staff information
          </p>
        </div>

        <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium ">
          <FiPlus size={17} />
          Add Staff
        </button>
      </div>



      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">

        <StatCard
          title="Total Staff"
          value="124"
          icon={<FiUsers />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Active Staff"
          value="108"
          icon={<FiUserCheck />}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />

        <StatCard
          title="Pending Verification"
          value="10"
          icon={<FiClock />}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />

        <StatCard
          title="Compliance Issues"
          value="6"
          icon={<FiAlertCircle />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />

      </div>



      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">


        <div className="p-5 border-b border-gray-100">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>
              <h2 className="text-base font-semibold text-gray-900">
                All Staff
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                View and manage all staff members
              </p>
            </div>

            <div className="flex items-center gap-3">


              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={17}
                />

                <input
                  type="text"
                  placeholder="Search staff..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400"
                />
              </div>


              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                <FiFilter size={16} />
                Filter
              </button>

            </div>

          </div>

        </div>



        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">

                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Staff
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Role
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Documents
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Compliance
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Joined
                </th>

                <th className="px-5 py-4"></th>

              </tr>
            </thead>


            <tbody>

              {
                filteredStaff.map((person) => (

                  <tr
                    key={person.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition"
                  >


                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                          {person.name
                            .split(" ")
                            .map((name) => name[0])
                            .join("")}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {person.name}
                          </p>

                          <p className="text-xs text-gray-500 mt-0.5">
                            {person.email}
                          </p>
                        </div>

                      </div>

                    </td>



                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-700">
                        {person.role}
                      </span>
                    </td>



                    <td className="px-5 py-4">
                      <StatusBadge status={person.status} />
                    </td>



                    <td className="px-5 py-4">

                      <span className="text-sm font-medium text-gray-700">
                        {person.documents}
                      </span>

                    </td>



                    <td className="px-5 py-4">
                      <ComplianceBadge
                        compliance={person.compliance}
                      />
                    </td>



                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-500">
                        {person.joined}
                      </span>
                    </td>




                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-block">

                        <button
                          onClick={() => setOpenMenu(openMenu === person.id ? null : person.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                        >
                          <FiMoreVertical size={18} />
                        </button>

                        {
                          openMenu === person.id && (
                            <div className="absolute right-0 top-10 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">

                              <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-500">
                                View Staff
                              </button>

                              <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-500">
                                Edit Staff
                              </button>

                              <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-500">
                                View Documents
                              </button>

                              <div className="border-t border-gray-100 my-1"></div>

                              <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                                Deactivate
                              </button>

                            </div>
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



        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">

          <p className="text-sm text-gray-500">
            Showing {filteredStaff.length} of {staff.length} staff
          </p>

          <div className="flex items-center gap-2">

            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500">
              Previous
            </button>

            <button className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm">
              1
            </button>

            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600">
              2
            </button>

            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600">
              Next
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


/* Stat Card */
function StatCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 mt-2">
            {value}
          </h3>
        </div>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>

          {React.cloneElement(icon, { size: 20 })}
        </div>

      </div>

    </div>
  );
}


/* Status Badge */
function StatusBadge({ status }) {

  const styles = {
    Active: "bg-green-50 text-green-700",
    Inactive: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}


/* Compliance Badge */
function ComplianceBadge({ compliance }) {

  const styles = {
    Verified: "bg-green-50 text-green-700",
    Pending: "bg-orange-50 text-orange-700",
    Missing: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${styles[compliance]}`}
    >
      {compliance}
    </span>
  );
}


