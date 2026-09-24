import React from 'react'

import {  FiUserX, FiSearch, FiChevronDown,  FiClock,  FiMessageCircle, FiCheck, } from "react-icons/fi";


export default function Customersupport() {
  return (
     <main className="min-h-screen bg-[#f7f9fc] px-8 py-8">
       
       
                   <div className="flex items-start justify-between mb-8">
                       <div>
                          
       
                           <h1 className="text-[30px] font-bold text-[#17233c]">
                              Customer Support
                           </h1>
       
                           <p className="mt-1 text-[16px] text-[#71809a]">
                               Manage tickets, track resolutions, and ensure customer satisfaction.
                           </p>
                       </div>
       
                   </div>
       
       
       
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                       <div className="bg-white border border-[#dfe5ef] rounded-2xl p-5    shadow-sm">
                           <div className="flex items-center gap-5">
       
                               <div className="w-14 h-14 rounded-2xl bg-[#eef0ff] flex items-center justify-center">
                                   <FiMessageCircle
                                       size={25}
                                       className="text-[#5138ee]"
                                   />
                               </div>
       
                               <div>
                                   <h2 className="text-[30px] font-bold text-[#1d2940]">
                                       1
                                   </h2>
       
                                   <p className="text-sm font-bold tracking-wide text-[#8a9ab4]">
                                       OPEN TICKETS
                                   </p>
                               </div>
       
                           </div>
                       </div>
       
       
       
                       <div className="bg-white border border-[#dfe5ef] rounded-2xl p-5      shadow-sm">
                           <div className="flex items-center gap-5">
       
                               <div className="w-14 h-14 rounded-2xl bg-[#eafbf4] flex items-center justify-center">
                                   <FiCheck
                                       size={25}
                                       className="text-[#00a66a]"
                                   />
                               </div>
       
                               <div>
                                   <h2 className="text-[30px] font-bold text-[#1d2940]">
                                       1
                                   </h2>
       
                                   <p className="text-sm font-bold  text-[#8a9ab4]">
                                       IN PROGRESS
                                   </p>
                               </div>
       
                           </div>
                       </div>
       
       
       
                       <div className="bg-white border border-[#dfe5ef] rounded-2xl p-5 shadow-sm">
                           <div className="flex items-center gap-5">
       
                               <div className="w-14 h-14 rounded-2xl bg-[#fff0f2] flex   items-center justify-center">
                                   <FiClock
                                       size={25}
                                       className="text-[#f20d46]"
                                   />
                               </div>
       
                               <div>
                                   <h2 className="text-[30px] font-bold text-[#1d2940]">
                                       0
                                   </h2>
       
                                   <p className="text-sm font-bold tracking-wide text-[#8a9ab4]">
                                       TOTAL TICKETS
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
                                      RESOLVED/CLOSED 
                                   </p>
                               </div>
       
                           </div>
                       </div>
       
                   </div>
       
       
       
                   <div className="bg-white border border-[#dfe5ef] rounded-2xl p-5       shadow-sm    mb-8">
                       <div className="flex items-center justify-between gap-4">
                           <div className="flex items-center gap-4 flex-1">
       
                               <div className="relative max-w-[580px] w-full">
       
                                   <FiSearch
                                       size={21}
                                       className=" absolute left-5 top-1/2 -translate-y-1/2 text-[#8da0bc]"
                                   />
       
                                   <input type="text"
                                       placeholder="Search by Ticket ID,Customer, or Subject..."
                                       className=" w-full h-14 pl-14 pr-5 rounded-2xl border border-[#dfe5ef] outline-none text-[#34435d] placeholder:text-[#9aa8bb] focus:border [#5138ee]  "
                                   />
       
                               </div>
       
       
                             <span className='text-sm text-gray-500'>STATUS:</span>
                               <button
                                   className="h-12 px-5 min-w-[150px] flex items-center justify-between gap-5 bg-white border border-[#dfe5ef] rounded-2xl text-[#34435d] font-semibold"
                               >
                               
                                   <span>All Statuses</span>
       
                                   <FiChevronDown
                                       size={18}
                                       className="text-[#8292aa]"
                                   />
                               </button>
                             <span className='text-sm text-gray-500'>PRIORITY:</span>
                               <button
                                   className="h-12 px-5 min-w-[150px] flex items-center justify-between gap-5 bg-white border border-[#dfe5ef] rounded-2xl text-[#34435d] font-semibold"
                               >
                                
                                   <span>All Priority</span>
       
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
                           
                           <span>TICKET #</span>
                           <span>SUBJECT</span>
                           <span>CATEGORY</span>
                           <span>PRIORITY</span>
                           <span className="text-right">CUSTOMER</span>
       
                       </div>
       
       
       
                       <div className="grid grid-cols-[2.2fr_1.3fr_1.2fr_1.2fr_1.2fr] items-center  min-h- [95px] px-7 mb-10 mt-5 border-b border-[#e7ebf2]  min-h-[68px]">
       
       
                           <div className="flex items-center gap-4">
       
       
                               <div>
                                   <h6 className="text-[17px] font-bold text-[#296bde]">
                                       TKT-0008
                                   </h6>
                               </div>
       
                           </div>
       
       
       
                           <div>
                               <span className="inline-flex items-center px-4 py-1.5 text-sm">
                                   Unable to login to my account

                               </span>
                           </div>
       
       
       
                           <div>
                               <span className=" inline-flex items-center gap-2 px-4 py-1.5   text-sm">
                                  
                                  ACCOUNT_ISSUE
                               </span>
                           </div>
       
       
       
                           <div className="text-[16px] text-[#2774e8] bg-blue-200 rounded-full px-8">
                               MEDIUM
                           </div>
       
       
       
                          
                            <div className='ml-12'>
                               <span className=" inline-flex items-center gap-2 px-4  text-sm font-bold">
                                   
                                   sara
                               </span>
                               <span className='text-xs text-gray-500'>sara@example.com</span>
                           </div>
       
                       </div>
   
                       
   
                       
                   </div>
       
               </main>
  )
}
