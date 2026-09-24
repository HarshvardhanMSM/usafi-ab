import React from "react";
import {LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,} from "recharts";

const data = [
    { day: "Mon", present: 82, late: 62, absent: 48 },
    { day: "Tue", present: 85, late: 62, absent: 43 },
    { day: "Wed", present: 88, late: 70, absent: 48 },
    { day: "Thu", present: 80, late: 67, absent: 46 },
    { day: "Fri", present: 82, late: 61, absent: 51 },
    { day: "Sat", present: 90, late: 70, absent: 46 },
    { day: "Sun", present: 85, late: 75, absent: 55 },
];

export default function Attendancechart() {
    return (
        <div className="bg-white w-130  rounded-2xl border border-gray-200 p-6 shadow-sm">


            <div className="flex items-center justify-between mb-6">

                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        Attendance Overview
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                        Attendance activity for the last 7 days
                    </p>
                </div>

                <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 outline-none">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                </select>

            </div>


            {/* Graph */}
            <div className="h-[270px]">

                <ResponsiveContainer width="100%" height="100%">

                    <LineChart data={data}>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${value}%`}
                        />

                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="present"
                            stroke="#10B981"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            name="Present"
                        />

                        <Line
                            type="monotone"
                            dataKey="late"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            name="Late"
                        /> 

                         <Line
                            type="monotone"
                            dataKey="absent"
                            stroke="#F59E0B"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            name="Absent"
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>


            
            <div className="flex gap-6 mt-4">

                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-sm text-gray-500">Present</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-sm text-gray-500">Late</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    <span className="text-sm text-gray-500">Absent</span>
                </div>

            </div>

        </div>
    );
}