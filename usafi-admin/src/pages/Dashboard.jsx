import React from "react";
import Statcard from "../components/Statecard";
import Attendancechart from "../components/Attendancechart";
import Workforcechart from "../components/Workforcechart";
import Recentstaffrequests from "../components/Recentstaffrequest";
import TopUsers from "../components/Topuser";
import TopJobs from "../components/Topjob";

import {FiUsers,FiClock,FiCalendar,FiUserPlus,FiCheckCircle,FiBriefcase,} from "react-icons/fi";

export default function Dashboard() {
  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen ">

      
      <div className="mb-7">
        <h1 className="text-3xl  font-bold text-gray-800">
          Dashboard Overview
        </h1>

        <p className="text-gray-500 mt-4">
          Welcome back, Admin. Here is what is happening with your workforce today.
        </p>
      </div>


    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <Statcard
          title="Active Workers"
          value="124"
          change="8.2%"
          changeText="vs last week"
          icon={<FiUsers size={26} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          graphColor="#3B82F6"
        />


        <Statcard
          title="Today's Attendance"
          value="92%"
          change="4.5%"
          changeText="vs yesterday"
          icon={<FiClock size={26} />}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          graphColor="#10B981"
        />


        <Statcard
          title="Total Hours Worked"
          value="1,248"
          change="12.4%"
          changeText="this week"
          icon={<FiCalendar size={26} />}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          graphColor="#8B5CF6"
        />


        <Statcard
          title="Pending Requests"
          value="18"
          change="3"
          changeText="new requests"
          icon={<FiUserPlus size={26} />}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          graphColor="#F59E0B"
        />


        <Statcard
          title="Compliance Rate"
          value="96.8%"
          change="2.1%"
          changeText="vs last month"
          icon={<FiCheckCircle size={26} />}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          graphColor="#10B981"
        />




        <Statcard
          title="Upcoming Shifts"
          value="36"
          change="6"
          changeText="next 7 days"
          icon={<FiBriefcase size={26} />}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          graphColor="#8B5CF6"
        />
      </div>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-[90px] mt-10 ">
         <Attendancechart />
         <Workforcechart />
      </div>

      <div className="flex gap-4 mt-4">
         <Recentstaffrequests/>
          <TopUsers/>
          <TopJobs/>
      </div>

       
    </div>
  );
}