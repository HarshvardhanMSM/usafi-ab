import React from "react";
import {PieChart,Pie,Cell,Tooltip,ResponsiveContainer,} from "recharts";

const data = [
  { name: "Active", value: 124 },
  { name: "On Leave", value: 18 },
  { name: "Inactive", value: 12 },
  { name: "Pending", value: 8 },
];

const COLORS = [
  "#3B82F6",
  "#F59E0B",
  "#9CA3AF",
  "#8B5CF6",
];

export default function Workforcechart() {
  return (
    <div className="bg-white  rounded-2xl border border-gray-200 p-6 shadow-sm">

      
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Workforce by Status
        </h2>

        <p className="text-sm text-gray-400 mt-1">
          Current workforce distribution
        </p>
      </div>



      <div className="h-[270px]">

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={105}
              paddingAngle={3}
            >

              {
               data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index]}
                />
               ))
              }

            </Pie>

            <Tooltip />

          </PieChart>
        </ResponsiveContainer>

      </div>


    
      <div className="grid grid-cols-2 gap-4 mt-2">

        {
         data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between"
           >

            <div className="flex items-center gap-2">

              <span
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: COLORS[index],
                }}
              />

              <span className="text-sm text-gray-500">
                {item.name}
              </span>

            </div>

            <span className="text-sm font-semibold text-gray-700">
              {item.value}
            </span>

          </div>
         ))
        }

      </div>

    </div>
  );
}