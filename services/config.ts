/** Backend API origin — override with NEXT_PUBLIC_API_URL */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

export const API_V1 = `${API_BASE_URL}/api/v1`;

export const AUTH_TOKEN_KEY = "depth-access-token";
export const REFRESH_TOKEN_KEY = "depth-refresh-token";
export const DEVICE_ID_KEY = "depth-device-id";

/**
 * Access tokens are httpOnly cookies set by the API (credentials: "include").
 * Do not read JWTs from localStorage (BUG-006). Clear any legacy keys on access.
 */
export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  // Purge legacy XSS-exposed tokens
  localStorage.removeItem(AUTH_TOKEN_KEY);
  return null;
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  return null;
}

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

/** No-op for JWT persistence — cookies are authoritative. */
export function persistTokens(_accessToken?: string | null, _refreshToken?: string | null) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Safe post-login redirect: same-origin relative paths only (BUG-007).
 * Rejects protocol-relative URLs (`//evil.com`) and external absolute URLs.
 */
export function sanitizeRedirectPath(redirect: string | null | undefined, fallback = "/"): string {
  if (!redirect) return fallback;
  const value = redirect.trim();
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (value.includes("://")) return fallback;
  if (/[\x00-\x1f]/.test(value)) return fallback;
  return value;
}
