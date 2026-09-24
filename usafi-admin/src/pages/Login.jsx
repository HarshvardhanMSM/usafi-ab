import React from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        <div className="text-center mb-8">

          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to Usafi
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Sign in to access your admin dashboard
          </p>
        </div>

    
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Admin Login
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Enter your credentials to continue
            </p>
          </div>

          
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <div className="relative">
              <FiMail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                type="email"
                placeholder="admin@example.com"
                className="w-full h-12 pl-11  border border-gray-200 rounded-xl outline-none text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-gray-100 transition"
              />
            </div>
          </div>

          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>

              <button className="text-sm font-medium text-gray-900 hover:underline">
                Forgot password?
              </button>
            </div>

            <div className="relative">
              <FiLock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                type="password"
                placeholder="Enter your password"
                className="w-full h-12 pl-11  border border-gray-200 rounded-xl outline-none text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-gray-100 transition"
              />

              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <FiEye size={18} />
              </button>
            </div>
          </div>

          
          <div className="flex items-center gap-2 mb-6">
            <input
              type="checkbox"
              className="w-4 h-4 accent-black"
            />

            <span className="text-sm text-gray-600">
              Remember me
            </span>
          </div>

          
          <button
            className="w-full h-12 bg-black text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition"
          >
            Sign In
          </button>

        </div>

        
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Usafi. All rights reserved.
        </p>

      </div>
    </div>
  );
}