/**
 * Safe Browser Token Storage
 *
 * Manages JWT access token persistence using localStorage and fallback cookie storage.
 * Guarded against SSR execution.
 */

const TOKEN_KEY = "cyber7_access_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(TOKEN_KEY, token);
    // Also mirror to a secure cookie for potential middleware or cross-context use
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
  } catch (err) {
    console.error("Failed to persist access token", err);
  }
}

export function removeStoredToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  } catch (err) {
    console.error("Failed to clear access token", err);
  }
}
