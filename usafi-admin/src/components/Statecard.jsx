import React from "react";

export default function StatCard({
  title,
  value,
  change,
  changeText,
  icon,
  iconBg,
  iconColor,
  graphColor,
}) {
  return (
    <div className="bg-white rounded-2xl  border border-gray-200 p-5 h-[220px] shadow-sm">

      
      <div className="flex items-start justify-between">

        <div className="flex items-center gap-4">

          
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center ${iconBg} ${iconColor}`}
           >
            {icon}
          </div>

          
          <div>
            <p className="text-sm font-semibold text-gray-400 uppercase">
              {title}
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mt-1">
              {value}
            </h2>
          </div>

        </div>

        
      </div>

      
      <div className="flex items-center gap-2 mt-4">

        <span className="text-sm font-semibold text-green-500">
          ↑ {change}
        </span>

        <span className="text-sm text-gray-400">
          {changeText}
        </span>

      </div>

      {/* Mini Graph */}
      <div className="mt-3 h-[60px]">

        <svg
          viewBox="0 0 400 70"
          className="w-full h-full"
          preserveAspectRatio="none"
         >

          {/* Area */}
          <path
            d="M0 55
               C30 60, 45 48, 70 52
               C95 57, 110 35, 135 42
               C160 48, 175 30, 200 35
               C225 40, 245 20, 270 30
               C295 40, 315 18, 340 25
               C365 32, 380 12, 400 20
               L400 70
               L0 70 Z"
            fill={graphColor}
            opacity="0.10"
          />

          {/* Line */}
          <path
            d="M0 55
               C30 60, 45 48, 70 52
               C95 57, 110 35, 135 42
               C160 48, 175 30, 200 35
               C225 40, 245 20, 270 30
               C295 40, 315 18, 340 25
               C365 32, 380 12, 400 20"
            fill="none"
            stroke={graphColor}
            strokeWidth="3"
          />

          {/* Dots */}
          <circle cx="0" cy="55" r="3" fill={graphColor} />
          <circle cx="70" cy="52" r="3" fill={graphColor} />
          <circle cx="135" cy="42" r="3" fill={graphColor} />
          <circle cx="200" cy="35" r="3" fill={graphColor} />
          <circle cx="270" cy="30" r="3" fill={graphColor} />
          <circle cx="340" cy="25" r="3" fill={graphColor} />
          <circle cx="400" cy="20" r="3" fill={graphColor} />

        </svg>

      </div>

    </div>
  );
}