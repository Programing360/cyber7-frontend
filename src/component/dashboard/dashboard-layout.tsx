"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-h-screen lg:pl-[270px]">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-[calc(100vh-76px)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
