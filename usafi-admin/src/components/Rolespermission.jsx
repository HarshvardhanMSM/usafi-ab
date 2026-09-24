import React from 'react'
import { FiRefreshCw,FiUsers,FiUserPlus,FiUserCheck,FiUserX, FiSearch,FiShield,FiPlus,FiCheck } from 'react-icons/fi'

export default function Rolespermission() {
     const roles = [
    {
      name: "Product Manager",
      permissions: 58,
      color: "text-[#5138ee]",
      bg: "bg-[#eef0ff]",
    },
    {
      name: "Inventory Manager",
      permissions: 17,
      color: "text-[#00a66a]",
      bg: "bg-[#eafbf4]",
    },
   
  ];
  return (
     <main className="min-h-screen bg-[#f7f9fc] px-8 py-8">


            <div className="flex items-start justify-between mb-8">

                <div>
                   
                    <h1 className="text-[30px] font-bold text-[#17233c]">
                        Roles & Permission
                    </h1>

                    <p className="mt-1 text-[16px] text-[#71809a]">
                        Manage role-based access control for your admin team. Define roles and assign granular permissions.
                    </p>
                </div>


                <div className="flex items-center gap-3 mt-4">

                    <button className=" h-10 px-6 flex items-center gap-3 bg-[#5138ee] rounded-2xl text-white font-semibold shadow-sm hover:bg-[#4630d5] transition">
                        <FiUserPlus size={16} />
                        Create Role
                    </button>

                </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">


                <div className="bg-white border border-[#dfe5ef] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-5">

                        <div className="w-14 h-14 rounded-2xl bg-[#eef0ff] flex items-center justify-center">
                            <FiShield
                                size={25}
                                className="text-[#5138ee]"
                            />
                        </div>

                        <div>
                            <h2 className="text-[30px] font-bold text-[#1d2940]">
                                1
                            </h2>

                            <p className="text-sm font-bold tracking-wide text-[#8a9ab4]">
                                TOTAL ROLES
                            </p>
                            <span className='text-sm text-[#8a9ab4]'>All defined role</span>
                        </div>

                    </div>
                </div>



                <div className="bg-white border border-[#dfe5ef] rounded-2xl p-5 shadow-sm">
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
                                ACTIVE ROLE
                            </p>
                            <span className='text-sm text-[#8a9ab4]'>In use by admin</span>
                        </div>

                    </div>
                </div>



                <div className="bg-white border border-[#dfe5ef] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-5">

                        <div className="w-14 h-14 rounded-2xl bg-[#fff0f2] flex items-center justify-center">
                            <FiUsers
                                size={25}
                                className="text-[#f20d46]"
                            />
                        </div>

                        <div>
                            <h2 className="text-[30px] font-bold text-[#1d2940]">
                                0
                            </h2>

                            <p className="text-sm font-bold tracking-wide text-[#8a9ab4]">
                                CUSTOM ROLE
                            </p>
                            <span className='text-sm text-[#8a9ab4]'>User defined role</span>
                        </div>

                    </div>
                </div>

            </div>
          


      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 h-[calc(100vh-180px)]">

        <div className="bg-white border border-[#dfe5ef] rounded-2xl shadow-sm flex flex-col  overflow-hidden">

         
          <div className="p-5 border-b border-[#e7ebf2]">

            <div className="flex items-center justify-between mb-5">

              <h1 className="text-[18px] font-bold text-[#26354e]">
                All Roles
              </h1>

              <span className="text-sm font-semibold text-[#8da0bc]">
                7 / 7 total
              </span>

            </div>

           
            <div className="relative">

              <FiSearch
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8da0bc]"
              />

              <input
                type="text"
                placeholder="Search roles..."
                className="w-full h-11 pl-11 pr-4 bg-[#f8fafc] border border-[#dfe5ef] rounded-xl outline-none text-sm text-[#34435d] placeholder:text-[#91a0b8] focus:border-[#5138ee]"
              />
            </div>

          </div>


         
          <div className="flex-1 overflow-y-auto p-3">

            {roles.map((role) => (
              <div
                key={role.name}
                className=" p-4 mb-2 rounded-xl cursor-pointer hover:bg-[#f8f9fd] transition"
              >

                <div className="flex items-start gap-4">

                 
                  <div
                    className={` w-12 h-12 rounded-xl ${role.bg} flex items-center justify-center shrink-0 `}
                  >
                    <FiShield
                      size={23}
                      className={role.color}
                    />
                  </div>


                  
                  <div className="flex-1">

                    <h3 className="text-[16px] font-bold text-[#26354e]">
                      {role.name}
                    </h3>

                    <p className="text-sm text-[#8da0bc] mt-1">
                      {role.permissions} permissions
                    </p>

                    <span
                      className="inline-flex mt-2 px-2.5 py-1 rounded-md bg-[#e9faf3] text-[#00a66a] text-[11px] font-bold"
                    >
                      CUSTOM
                    </span>

                  </div>

                </div>

              </div>
             ))
            }

          </div>

        </div>


       
        <div className="bg-white border border-dashed border-[#ccd6e4] rounded-2xl shadow-sm flex items-center justify-center">

          <div className="text-center max-w-[430px] px-6">

           
            <div
              className="w-20 h-20 rounded-2xl bg-[#f7f9fc] flex items-center justify-center mx-auto mb-7">
              <FiShield
                size={38}
                className="text-[#c8d3e2]"
              />
            </div>


           
            <h2 className="text-[20px] font-bold text-[#465873]">
              Select a role to manage permissions
            </h2>


           
            <p className="mt-3 text-[16px] leading-7 text-[#91a0b7]">
              Choose a role from the left panel to view and edit its
              permissions, or create a new role.
            </p>

          </div>

        </div>

      </div>

</main>
  )
}
