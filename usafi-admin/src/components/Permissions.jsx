import React from 'react'
import { FiRefreshCw, FiUserPlus, FiUsers, FiUserCheck, FiUserX, FiSearch, FiChevronDown } from 'react-icons/fi'

export default function Permissions() {
    return (
        <main className="min-h-screen bg-[#f7f9fc] px-8 py-8">


            <div className="flex items-start justify-between mb-8">

                <div>

                    <h1 className="text-[30px] font-bold text-[#17233c]">
                        PERMISSIONS
                    </h1>

                    <p className="mt-1 text-[16px] text-[#71809a]">
                        Manage permission slugs across all modules
                    </p>
                </div>


                <div className="flex items-center gap-3 mt-10">


                    <button className=" h-10 px-6 flex items-center gap-3 bg-[#5138ee] rounded-2xl text-white font-semibold shadow-sm hover:bg-[#4630d5] transition">
                        <FiUserPlus size={20} />
                        Create Permission
                    </button>

                </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">


                <div className="bg-white border border-[#dfe5ef] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-5">

                        <div className="w-14 h-14 rounded-2xl bg-[#eef0ff] flex items-center justify-center">
                            <FiUsers
                                size={25}
                                className="text-[#5138ee]"
                            />
                        </div>

                        <div>
                            <h2 className="text-[30px] font-bold text-[#1d2940]">
                                1
                            </h2>

                            <p className="text-sm font-bold tracking-wide text-[#8a9ab4]">
                                TOTAL PERMISSIONS
                            </p>
                        </div>

                    </div>
                </div>



                <div className="bg-white border border-[#dfe5ef] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-5">

                        <div className="w-14 h-14 rounded-2xl bg-[#eafbf4] flex items-center justify-center">
                            <FiUserCheck
                                size={25}
                                className="text-[#00a66a]"
                            />
                        </div>

                        <div>
                            <h2 className="text-[30px] font-bold text-[#1d2940]">
                                1
                            </h2>

                            <p className="text-sm font-bold  text-[#8a9ab4]">
                                TOTAL MODULE
                            </p>
                        </div>

                    </div>
                </div>

            </div>


            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">

                    <div className="relative max-w-[800px]  w-full">

                        <FiSearch
                            size={21}
                            className=" absolute left-5 top-1/2 -translate-y-1/2 text-[#8da0bc]"
                        />

                        <input type="text"
                            placeholder="Search by name ,Slug, or module"
                            className=" w-full h-14 pl-14 pr-5 rounded-2xl border border-[#dfe5ef] outline-none text-[#34435d] placeholder:text-[#9aa8bb] focus: ring  "
                        />

                    </div>

                </div>
            </div>
           
            <div className="bg-white border border-[#dfe5ef] rounded-2xl overflow-hidden   shadow-sm mt-5">

               
                <div className="h-[60px] px-6 flex items-center bg-[#f8fafc] border-b border-[#e7ebf2]">
                    <h2 className="text-[18px] font-bold tracking-wide text-[#34435d]">
                        ADDRESS
                    </h2>

                    <span className="ml-3 w-8 h-8 rounded-full bg-[#e8edf5] flex items-center justify-center text-sm font-semibold text-[#53647d]">
                        4
                    </span>
                </div>


               
                <div className="min-h-[78px] px-6 flex items-center justify-between border-b border-[#edf0f5]">

                    <div>
                        <h3 className="text-[14px] font-bold text-[#26354e]">
                            Create Address
                        </h3>

                        <p className="text-sm text-[#8da0bc] mt-1">
                            address.create
                        </p>
                    </div>

                    <div className="flex items-center gap-3">

                        <span className="px-4 py-1.5 rounded-full bg-[#eef0ff] text-[#5138ee] text-xs font-bold">
                            address
                        </span>

                        <button className="text-sm font-semibold text-[#8da0bc] hover:text-[#5138ee]">
                            Edit
                        </button>

                        <button className="text-sm font-semibold text-red-500 hover:text-red-600">
                            Delete
                        </button>

                    </div>

                </div>


                
                <div className="min-h-[78px] px-6 flex items-center justify-between border-b border-[#edf0f5]">

                    <div>
                        <h3 className="text-[14px] font-bold text-[#26354e]">
                            Delete Address
                        </h3>

                        <p className="text-sm text-[#8da0bc] mt-1">
                            address.delete
                        </p>
                    </div>

                    <div className="flex items-center gap-5">

                        <span className="px-4 py-1.5 rounded-full bg-[#eef0ff] text-[#5138ee] text-xs font-bold">
                            address
                        </span>

                        <button className="text-sm font-semibold text-[#8da0bc] hover:text-[#5138ee]">
                            Edit
                        </button>

                        <button className="text-sm font-semibold text-red-500 hover:text-red-600">
                            Delete
                        </button>

                    </div>

                </div>


               
                <div className="min-h-[78px] px-6 flex items-center justify-between border-b border-[#edf0f5]">

                    <div>
                        <h3 className="text-[14px] font-bold text-[#26354e]">
                            Update Address
                        </h3>

                        <p className="text-sm text-[#8da0bc] mt-1">
                            address.update
                        </p>
                    </div>

                    <div className="flex items-center gap-5">

                        <span className="px-4 py-1.5 rounded-full bg-[#eef0ff] text-[#5138ee] text-xs font-bold">
                            address
                        </span>

                        <button className="text-sm font-semibold text-[#8da0bc] hover:text-[#5138ee]">
                            Edit
                        </button>

                        <button className="text-sm font-semibold text-red-500 hover:text-red-600">
                            Delete
                        </button>

                    </div>

                </div>


               
                <div className="min-h-[78px] px-6 flex items-center justify-between">

                    <div>
                        <h3 className="text-[14px] font-bold text-[#26354e]">
                            View Address
                        </h3>

                        <p className="text-sm text-[#8da0bc] mt-1">
                            address.view
                        </p>
                    </div>

                    <div className="flex items-center gap-5">

                        <span className="px-4 py-1.5 rounded-full bg-[#eef0ff] text-[#5138ee] text-xs font-bold">
                            address
                        </span>

                        <button className="text-sm font-semibold text-[#8da0bc] hover:text-[#5138ee]">
                            Edit
                        </button>

                        <button className="text-sm font-semibold text-red-500 hover:text-red-600">
                            Delete
                        </button>

                    </div>

                </div>

            </div>
        </main>
    )
}
