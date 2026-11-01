"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import apiClient, { ApiClientError } from "../lib/api-client";
import {
  getStoredWorkspaceId,
  setStoredWorkspaceId,
  removeStoredWorkspaceId,
} from "../lib/workspace-storage";
import type {
  ApiResponse,
  CreatedWorkspaceData,
  CreateWorkspaceInput,
  WorkspaceAccessCheckData,
  WorkspaceItem,
  WorkspacesListResponseData,
} from "../types/api";

interface WorkspaceContextType {
  workspaces: WorkspaceItem[];
  activeWorkspace: WorkspaceItem | null;
  isLoading: boolean;
  createModalOpen: boolean;
  setCreateModalOpen: (open: boolean) => void;
  switchWorkspace: (workspaceId: string) => Promise<boolean>;
  createWorkspace: (name: string) => Promise<WorkspaceItem>;
  refreshWorkspaces: () => Promise<void>;
  hasWorkspaces: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceItem | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Verify access for a given workspace with backend
  const verifyAccess = async (workspaceId: string): Promise<boolean> => {
    try {
      const response = await apiClient.get<
        ApiResponse<WorkspaceAccessCheckData>
      >(`/workspaces/${workspaceId}/access-check`);
      return !!response?.data?.workspace;
    } catch {
      return false;
    }
  };

  // Fetch workspaces and determine the verified active workspace
  const refreshWorkspaces = useCallback(async () => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response =
        await apiClient.get<ApiResponse<WorkspacesListResponseData>>(
          "/workspaces/me",
        );

      const list = response?.data?.workspaces ?? [];
      setWorkspaces(list);

      if (list.length === 0) {
        setActiveWorkspace(null);
        removeStoredWorkspaceId();
        setIsLoading(false);
        return;
      }

      // Check stored workspace ID
      const storedId = getStoredWorkspaceId();
      let chosenWorkspace: WorkspaceItem | null = null;

      if (storedId) {
        const found = list.find((ws) => ws.id === storedId);
        if (found) {
          const hasAccess = await verifyAccess(found.id);
          if (hasAccess) {
            chosenWorkspace = found;
          }
        }
      }

      // Fall back to first available workspace if stored ID was invalid or missing
      if (!chosenWorkspace && list.length > 0) {
        for (const candidate of list) {
          const hasAccess = await verifyAccess(candidate.id);
          if (hasAccess) {
            chosenWorkspace = candidate;
            break;
          }
        }
      }

      if (chosenWorkspace) {
        setActiveWorkspace(chosenWorkspace);
        setStoredWorkspaceId(chosenWorkspace.id);
      } else {
        setActiveWorkspace(null);
        removeStoredWorkspaceId();
      }
    } catch (err: unknown) {
      console.error("Failed to fetch user workspaces:", err);
      setWorkspaces([]);
      setActiveWorkspace(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthLoading) return;

    let cancelled = false;

    const loadWorkspaces = async () => {
      if (cancelled) return;

      await refreshWorkspaces();
    };

    void loadWorkspaces();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, refreshWorkspaces]);

  const switchWorkspace = async (workspaceId: string): Promise<boolean> => {
    const target = workspaces.find((ws) => ws.id === workspaceId);

    if (!target) {
      throw new ApiClientError({
        message: "You are not a member of this workspace.",
        status: 403,
      });
    }

    const hasAccess = await verifyAccess(workspaceId);

    if (!hasAccess) {
      throw new ApiClientError({
        message: "Workspace access verification failed.",
        status: 403,
      });
    }

    setActiveWorkspace(target);
    setStoredWorkspaceId(target.id);
    return true;
  };

  const createWorkspace = async (name: string): Promise<WorkspaceItem> => {
    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      throw new ApiClientError({
        message: "Workspace name must be at least 2 characters.",
        status: 400,
      });
    }

    if (cleanName.length > 100) {
      throw new ApiClientError({
        message: "Workspace name cannot exceed 100 characters.",
        status: 400,
      });
    }

    const response = await apiClient.post<
      ApiResponse<CreatedWorkspaceData>,
      CreateWorkspaceInput
    >("/workspaces", { name: cleanName });

    const created = response?.data?.workspace;

    if (!created?.id) {
      throw new ApiClientError({
        message: "Failed to create workspace on server.",
        status: 500,
      });
    }

    const newWorkspaceItem: WorkspaceItem = {
      id: created.id,
      name: created.name,
      slug: created.slug,
      ownerId: created.ownerId,
      status: created.status || "ACTIVE",
      role: (created.role as WorkspaceItem["role"]) || "OWNER",
      timezone: "Asia/Dhaka",
      currency: "BDT",
    };

    setWorkspaces((prev) => [newWorkspaceItem, ...prev]);
    setActiveWorkspace(newWorkspaceItem);
    setStoredWorkspaceId(newWorkspaceItem.id);
    setCreateModalOpen(false);

    return newWorkspaceItem;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        isLoading,
        createModalOpen,
        setCreateModalOpen,
        switchWorkspace,
        createWorkspace,
        refreshWorkspaces,
        hasWorkspaces: workspaces.length > 0,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }

  return context;
}
