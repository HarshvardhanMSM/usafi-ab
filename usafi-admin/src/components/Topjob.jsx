import React from "react";
import { FiBriefcase, FiMapPin, FiUsers } from "react-icons/fi";

export default function TopJobs() {
  const jobs = [
    {
      title: "Security Event Staff",
      location: "London",
      workers: 18,
      requests: 32,
    },
    {
      title: "Office Cleaning",
      location: "Manchester",
      workers: 14,
      requests: 27,
    },
    {
      title: "Hospitality Staff",
      location: "Birmingham",
      workers: 12,
      requests: 21,
    },
    {
      title: "Festival Support Staff",
      location: "Liverpool",
      workers: 10,
      requests: 18,
    },
    {
      title: "Warehouse Staff",
      location: "Leeds",
      workers: 8,
      requests: 15,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Top Jobs
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Most requested jobs
          </p>
        </div>

        <button className="text-sm font-medium text-gray-600 hover:text-black">
          View All
        </button>
      </div>

    
      <div className="space-y-5">
        {
         jobs.map((job, index) => (
          <div
            key={index}
            className="flex items-center justify-between"
           >
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <FiBriefcase className="text-gray-600" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {job.title}
                </h3>

                <div className="flex items-center gap-1 mt-1">
                  <FiMapPin size={12} className="text-gray-400" />

                  <span className="text-xs text-gray-500">
                    {job.location}
                  </span>
                </div>
              </div>
            </div>


            <div className="text-right">
              <div className="flex items-center justify-end gap-1">
                <FiUsers size={13} className="text-gray-500" />

                <span className="text-sm font-semibold text-gray-900">
                  {job.workers}
                </span>
              </div>

              <p className="text-[11px] text-gray-400">
                {job.requests} requests
              </p>
            </div>
          </div>
         ))
        }
      </div>
    </div>
  );
}