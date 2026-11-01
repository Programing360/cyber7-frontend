"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import apiClient, { ApiClientError } from "../lib/api-client";
import {
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from "../lib/token-storage";
import type {
  ApiResponse,
  AuthUser,
  CurrentUserResponseData,
  LoginInput,
  LoginResponseData,
  RegisterInput,
  RegisterResponseData,
} from "../types/api";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Connect the apiClient to the safe token storage getter
apiClient.setTokenGetter(getStoredToken);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize and verify authentication on app load
  const refreshUser = useCallback(async () => {
    const token = getStoredToken();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response =
        await apiClient.get<ApiResponse<CurrentUserResponseData>>("/auth/me");

      if (response && response.data?.user) {
        setUser(response.data.user);
      } else {
        removeStoredToken();
        setUser(null);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.status === 401) {
        // Token is expired or invalid
        removeStoredToken();
        setUser(null);
      } else {
        // Network or server issues: do not clear token immediately
        console.warn("Could not retrieve current user profile:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (input: LoginInput) => {
    const response = await apiClient.post<
      ApiResponse<LoginResponseData>,
      LoginInput
    >("/auth/login", input, { skipAuth: true });

    if (response?.data?.accessToken && response?.data?.user) {
      setStoredToken(response.data.accessToken);
      setUser(response.data.user);
    } else {
      throw new ApiClientError({
        message: "Invalid login response received from server",
        status: 500,
      });
    }
  };

  const register = async (input: RegisterInput) => {
    const response = await apiClient.post<
      ApiResponse<RegisterResponseData>,
      RegisterInput
    >("/auth/register", input, { skipAuth: true });

    if (!response?.data?.user) {
      throw new ApiClientError({
        message: "Invalid registration response received from server",
        status: 500,
      });
    }

    // Automatically authenticate the new user
    await login({
      email: input.email,
      password: input.password,
    });
  };

  const logout = useCallback(() => {
    removeStoredToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
