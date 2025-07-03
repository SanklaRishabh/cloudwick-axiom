
import React from 'react';
import { Outlet } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <DashboardHeader />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
