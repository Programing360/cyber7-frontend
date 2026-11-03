/**
 * Safe Browser Active Workspace Storage
 *
 * Persists selected workspace ID in localStorage with SSR guards.
 * Note: Stored IDs are never trusted blindly; they are validated via
 * the backend /workspaces/:workspaceId/access-check endpoint before use.
 */

const WORKSPACE_KEY = "vexchat_active_workspace_id";
const LEGACY_WORKSPACE_KEY = "cyber7_active_workspace_id";

export function getStoredWorkspaceId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(WORKSPACE_KEY) || localStorage.getItem(LEGACY_WORKSPACE_KEY);
  } catch {
    return null;
  }
}

export function setStoredWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(WORKSPACE_KEY, workspaceId);
  } catch (err) {
    console.error("Failed to persist workspace ID", err);
  }
}

export function removeStoredWorkspaceId(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(WORKSPACE_KEY);
    localStorage.removeItem(LEGACY_WORKSPACE_KEY);
  } catch (err) {
    console.error("Failed to clear workspace ID", err);
  }
}
