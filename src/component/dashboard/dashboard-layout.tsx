"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./sidebar";
import Header from "./header";
import { useAuth } from "@/src/context/auth-context";
import { useWorkspace } from "@/src/context/workspace-context";
import CreateWorkspaceModal from "../workspace/create-workspace-modal";
import EmptyWorkspaceView from "../workspace/empty-workspace-view";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    hasWorkspaces,
    isLoading: isWorkspaceLoading,
    createModalOpen,
    setCreateModalOpen,
  } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  if (isAuthLoading || (isAuthenticated && isWorkspaceLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9f4]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f7f9f4]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-h-screen lg:pl-[270px]">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-[calc(100vh-76px)] p-4 sm:p-6 lg:p-8">
          {!hasWorkspaces ? <EmptyWorkspaceView /> : children}
        </main>
      </div>

      <CreateWorkspaceModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
