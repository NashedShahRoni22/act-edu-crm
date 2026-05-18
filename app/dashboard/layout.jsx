"use client";

import { useState } from "react";
import PrivateRoute from "@/components/private/PrivateRoute";
import Sidebar from "@/components/dashboard/shared/Sidebar";
import Topbar from "@/components/dashboard/shared/Topbar";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <PrivateRoute>
      {/*
        Root: full viewport, horizontal flex.
        Sidebar sits here as a flex child — no fixed positioning.
        The content area (topbar + page) fills the rest.
      */}
      <main className="h-screen flex overflow-hidden bg-gray-50">

        {/* ── Sidebar (icon rail + collapsible panel) ────────────── */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* ── Content column ─────────────────────────────────────── */}
        <section className="flex-1 flex flex-col min-h-0 min-w-0">

          {/* Topbar — natural flow, shrinks to h-16 */}
          <div className="shrink-0">
            <Topbar toggleSidebar={() => setSidebarOpen((v) => !v)} />
          </div>

          {/* Scrollable page content */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="pb-16">{children}</div>
          </div>

        </section>
      </main>
    </PrivateRoute>
  );
}