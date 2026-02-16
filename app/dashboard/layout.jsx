"use client";

import { useState } from "react";
import PrivateRoute from "@/components/private/PrivateRoute";
import Sidebar from "@/components/dashboard/shared/Sidebar";
import Topbar from "@/components/dashboard/shared/Topbar";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <PrivateRoute>
      <main className="h-screen flex overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main Content Area */}
        <section className="flex-1 flex flex-col">
          {/* Topbar */}
          <div>
            <Topbar toggleSidebar={toggleSidebar} />
          </div>

          {/* Dashboard Content */}
          <div className="min-h-screen overflow-y-scroll pb-20">{children}</div>
        </section>
      </main>
    </PrivateRoute>
  );
}
