import React from 'react'
import {  FiUserX, FiRefreshCw, FiSearch, FiChevronDown, FiDownload, FiCalendar, FiClock, FiWind, } from "react-icons/fi";


export default function Audit() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] px-8 py-8">
    
    
                <div className="flex items-start justify-between mb-8">
    
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-1 h-7 bg-[#5138ee] rounded-full"></div>
    
                            <span className="text-sm font-bold tracking-wide text-[#5138ee]">
                               COMPLIANCE
                            </span>
                        </div>
    
                        <h1 className="text-[30px] font-bold text-[#17233c]">
                           Audit Logs
                        </h1>
    
                        <p className="mt-1 text-[16px] text-[#71809a]">
                            Complete record of all administrative actions taken across the platform.
                        </p>
                    </div>
    
    
                    <div className="flex items-center gap-3 mt-10">
    
                        <button className="h-10 px-6 flex items-center gap-3 bg-white border border-[#dfe5ef] rounded-2xl text-[#34435d] font-semibold shadow-sm hover:bg-gray-50 transition">
                            <FiRefreshCw size={20} />
                            Refresh
                        </button>
    
                        <button className=" h-10 px-6 flex items-center gap-3 bg-[#5138ee] rounded-2xl text-white font-semibold shadow-sm hover:bg-[#4630d5] transition">
                            <FiDownload size={20} />
                            Export
                        </button>
    
                    </div>
                </div>
    
    
    
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
    
    
                    <div className="bg-white border border-[#dfe5ef] rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-5">
    
                            <div className="w-14 h-14 rounded-2xl bg-[#eef0ff] flex items-center justify-center">
                                <FiWind
                                    size={25}
                                    className="text-[#5138ee]"
                                />
                            </div>
    
                            <div>
                                <h2 className="text-[30px] font-bold text-[#1d2940]">
                                    1
                                </h2>
    
                                <p className="text-sm font-bold tracking-wide text-[#8a9ab4]">
                                    TOTAL LOGS
                                </p>
                            </div>
    
                        </div>
                    </div>
    
    
    
                    <div className="bg-white border border-[#dfe5ef] rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-5">
    
                            <div className="w-14 h-14 rounded-2xl bg-[#eafbf4] flex items-center justify-center">
                                <FiClock
                                    size={25}
                                    className="text-[#00a66a]"
                                />
                            </div>
    
                            <div>
                                <h2 className="text-[30px] font-bold text-[#1d2940]">
                                    1
                                </h2>
    
                                <p className="text-sm font-bold  text-[#8a9ab4]">
                                    TODAY
                                </p>
                            </div>
    
                        </div>
                    </div>
    
    
    
                    <div className="bg-white border border-[#dfe5ef] rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-5">
    
                            <div className="w-14 h-14 rounded-2xl bg-[#fff0f2] flex items-center justify-center">
                                <FiCalendar
                                    size={25}
                                    className="text-[#f20d46]"
                                />
                            </div>
    
                            <div>
                                <h2 className="text-[30px] font-bold text-[#1d2940]">
                                    0
                                </h2>
    
                                <p className="text-sm font-bold tracking-wide text-[#8a9ab4]">
                                    THIS WEEK
                                </p>
                            </div>
    
                        </div>
                    </div>

                     <div className="bg-white border border-[#dfe5ef] rounded-2xl p-5      shadow-sm">
                        <div className="flex items-center gap-5">
    
                            <div className="w-14 h-14 rounded-2xl bg-[#fff0f2] flex items-center justify-center">
                                <FiUserX
                                    size={25}
                                    className="text-[#f20d46]"
                                />
                            </div>
    
                            <div>
                                <h2 className="text-[30px] font-bold text-[#1d2940]">
                                    0
                                </h2>
    
                                <p className="text-sm font-bold tracking-wide text-[#8a9ab4]">
                                    CRITICAL EVENTS
                                </p>
                            </div>
    
                        </div>
                    </div>
    
                </div>
    
    
    
                <div className="bg-white border border-[#dfe5ef] rounded-2xl p-5 shadow-sm    mb-8">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
    
                            <div className="relative max-w-[580px] w-full">
    
                                <FiSearch
                                    size={21}
                                    className=" absolute left-5 top-1/2 -translate-y-1/2 text-[#8da0bc]"
                                />
    
                                <input type="text"
                                    placeholder="Search by name or email..."
                                    className=" w-full h-14 pl-14 pr-5 rounded-2xl border border-[#dfe5ef] outline-none text-[#34435d] placeholder:text-[#9aa8bb] focus:border [#5138ee]  "
                                />
    
                            </div>
    
    
    
                            <button
                                className="h-14 px-5 min-w-[150px] flex items-center justify-between gap-5 bg-white border border-[#dfe5ef] rounded-2xl text-[#34435d] font-semibold"
                            >
                                <span>All Modules</span>
    
                                <FiChevronDown
                                    size={18}
                                    className="text-[#8292aa]"
                                />
                            </button>

                            <button
                                className="h-14 px-5 min-w-[150px] flex items-center justify-between gap-5 bg-white border border-[#dfe5ef] rounded-2xl text-[#34435d] font-semibold"
                            >
                                <span>All Section</span>
    
                                <FiChevronDown
                                    size={18}
                                    className="text-[#8292aa]"
                                />
                            </button>
    
                        </div>
    
    
                        <span className="text-sm text-[#667894] whitespace-nowrap">
                 10 of 1000 logs
                 </span>
    
                    </div>
    
                </div>
    
    
    
                <div className="bg-white border border-[#dfe5ef] rounded-2xl shadow-sm     overflow-hidden">
    
    
                    <div className="grid
                         //   grid-cols-[2.2fr_1.3fr_1.2fr_1.2fr_1.2fr] items-center min-h-[68px] px-7 bg-[#fbfcfe] border-b border-[#e7ebf2] text-sm font-bold text-[#61738f]">
                        
                        <span>USER</span>
                        <span>TIME STAMP</span>
                        <span>MODULE</span>
                        <span>IP Address</span>
                        <span className="text-right">ACTION</span>
    
                    </div>
    
    
    
                    <div className="grid grid-cols-[2.2fr_1.3fr_1.2fr_1.2fr_1.2fr] items-center  min-h- [95px] px-7 mb-10 mt-5 border-b border-[#e7ebf2]  min-h-[68px]">
    
    
                        <div className="flex items-center gap-4">
    
                            <div className=" w-8 h-8 rounded-full bg-[#e9edf5] flex items-center justify-center text-[#53647d] font-bold">
                                ?
                            </div>
    
                            <div>
                                <h6 className="text-[17px] font-bold text-[#1c2940]">
                                    unknown
                                </h6>
                            </div>
    
                        </div>
    
    
    
                        <div>
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full border   text-xs font-bold">
                                sep 18, 05:26 PM 
                            </span>
                        </div>
    
    
    
                        <div>
                            <span className=" inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ecfdf5] bg-[#ecfdf5] text-cyan-900 text-xs font-bold">
                               
                                send-login-otp
                            </span>
                        </div>
    
    
    
                        <div className="text-[16px] text-[#53647d]">
                            6.29.2026
                        </div>
    
    
    
                       
                         <div className='ml-12'>
                            <span className=" inline-flex items-center gap-2 px-4  rounded-full border border-[#6ee7b7] bg-[#ecfdf5] text-[#00a66a] text-xs font-bold">
                                
                                Create
                            </span>
                        </div>
    
                    </div>

                    

                    
                </div>
    
    </main>
  )
}
