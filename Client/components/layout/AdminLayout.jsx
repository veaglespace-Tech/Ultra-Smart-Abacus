import React from "react";
import { Header } from "../shared/Header";
import { Sidebar } from "../shared/Sidebar";

export const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#070b13] text-white flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar role="admin" />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-gradient-to-b from-slate-900/20 via-[#070b13] to-[#070b13]">
          {children}
        </main>
      </div>
    </div>
  );
};