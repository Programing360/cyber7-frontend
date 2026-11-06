/**
 * Centralized API Client for VexChat
 *
 * Provides a strongly typed, decoupled HTTP client built on native fetch.
 * Automatically injects JWT Bearer tokens via a configurable token getter abstraction.
 * Preserves backend error structures and handles empty responses and network failures safely.
 */

import type { ApiErrorIssue, ApiErrorResponse, ApiResponse } from "../types/api";

export type TokenGetter = () => string | null | undefined | Promise<string | null | undefined>;

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /**
   * Explicit token override. If omitted, the configured token getter is used.
   */
  token?: string | null;
  /**
   * If true, prevents attaching the Authorization header.
   */
  skipAuth?: boolean;
  /**
   * Query parameters to append to the URL.
   */
  params?: Record<string, string | number | boolean | undefined | null>;
  /**
   * Optional custom base URL override.
   */
  baseUrl?: string;
}

/**
 * Standard error class for all API-related failures.
 */
export class ApiClientError extends Error {
  public readonly status: number;
  public readonly errors?: ApiErrorIssue[] | Record<string, unknown>;
  public readonly isNetworkError: boolean;
  public readonly data?: unknown;

  constructor({
    message,
    status = 0,
    errors,
    isNetworkError = false,
    data,
  }: {
    message: string;
    status?: number;
    errors?: ApiErrorIssue[] | Record<string, unknown>;
    isNetworkError?: boolean;
    data?: unknown;
  }) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
    this.isNetworkError = isNetworkError;
    this.data = data;
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

class ApiClient {
  private tokenGetter: TokenGetter = () => null;
  private defaultBaseUrl: string;

  constructor() {
    const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    this.defaultBaseUrl = envUrl ? envUrl.replace(/\/+$/, "") : "http://localhost:5000/api";
  }

  /**
   * Register a dynamic token getter function (e.g. from an Auth Context or cookie store).
   * Decouples the API client from any specific storage mechanism.
   */
  public setTokenGetter(getter: TokenGetter): void {
    this.tokenGetter = getter;
  }

  /**
   * Get the current base URL.
   */
  public getBaseUrl(): string {
    return this.defaultBaseUrl;
  }

  /**
   * Set or override the default base URL.
   */
  public setBaseUrl(url: string): void {
    this.defaultBaseUrl = url.replace(/\/+$/, "");
  }

  /**
   * Build complete URL with search parameters.
   */
  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>,
    baseUrlOverride?: string,
  ): string {
    const base = (baseUrlOverride ?? this.defaultBaseUrl).replace(/\/+$/, "");
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const fullPath = `${base}${cleanEndpoint}`;
    const url =
      fullPath.startsWith("http://") || fullPath.startsWith("https://")
        ? new URL(fullPath)
        : typeof window !== "undefined"
          ? new URL(fullPath, window.location.origin)
          : new URL(fullPath, "http://localhost:3000");

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Core request execution method.
   */
  public async request<T = unknown>(
    endpoint: string,
    options: RequestOptions & { body?: unknown } = {},
  ): Promise<T> {
    const {
      token: explicitToken,
      skipAuth = false,
      params,
      baseUrl,
      headers: customHeaders,
      body,
      ...fetchOptions
    } = options;

    const url = this.buildUrl(endpoint, params, baseUrl);

    // Initialize headers
    const headers = new Headers(customHeaders);

    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    // Prepare JSON body if applicable
    let serializedBody: BodyInit | undefined;
    if (body !== undefined && body !== null) {
      if (
        typeof body === "string" ||
        body instanceof FormData ||
        body instanceof Blob ||
        body instanceof URLSearchParams
      ) {
        serializedBody = body;
      } else {
        serializedBody = JSON.stringify(body);
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }
      }
    }

    // Attach Bearer token if not explicitly skipped
    // Customer JWT Isolation Guard:
    // Customer access tokens must NEVER be attached to /admin/* or /api/admin/* endpoints.
    // Platform administration requires dedicated AdminSession authentication (Phase 02B.4/5).
    const isAdminEndpoint = /(?:^|\/)admin(?:\/|$)/i.test(endpoint);
    if (isAdminEndpoint) {
      headers.delete("Authorization");
    } else if (!skipAuth) {
      let token = explicitToken;
      if (token === undefined) {
        token = await this.tokenGetter();
      }

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...fetchOptions,
        headers,
        body: serializedBody,
      });
    } catch (networkError: unknown) {
      const message =
        networkError instanceof Error
          ? `Network error: ${networkError.message}`
          : "Network request failed. Please check your internet connection.";

      throw new ApiClientError({
        message,
        status: 0,
        isNetworkError: true,
      });
    }

    // Handle empty response contents (204 No Content, Content-Length: 0)
    if (response.status === 204) {
      return null as T;
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength === "0") {
      return null as T;
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    let responseData: unknown = null;
    try {
      const text = await response.text();
      if (text && text.trim().length > 0) {
        responseData = isJson ? JSON.parse(text) : text;
      }
    } catch {
      // In case response body cannot be parsed as JSON, fall back to null
      responseData = null;
    }

    // Handle non-2xx HTTP responses
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      let errorIssues: ApiErrorIssue[] | Record<string, unknown> | undefined;

      if (
        responseData &&
        typeof responseData === "object" &&
        "message" in responseData &&
        typeof (responseData as ApiErrorResponse).message === "string"
      ) {
        errorMessage = (responseData as ApiErrorResponse).message;
        errorIssues = (responseData as ApiErrorResponse).errors;
      }

      throw new ApiClientError({
        message: errorMessage,
        status: response.status,
        errors: errorIssues,
        data: responseData,
      });
    }

    return responseData as T;
  }

  // ─── Convenience Methods ───────────────────────────────────────────────────

  public get<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T = unknown, B = unknown>(
    endpoint: string,
    body?: B,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  public put<T = unknown, B = unknown>(
    endpoint: string,
    body?: B,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  public patch<T = unknown, B = unknown>(
    endpoint: string,
    body?: B,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  public delete<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

/**
 * Singleton API client instance
 */
export const apiClient = new ApiClient();

export default apiClient;
