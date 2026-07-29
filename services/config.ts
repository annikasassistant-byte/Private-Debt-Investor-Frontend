/** Backend API origin — override with NEXT_PUBLIC_API_URL */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

export const API_V1 = `${API_BASE_URL}/api/v1`;

export const AUTH_TOKEN_KEY = "depth-access-token";
export const REFRESH_TOKEN_KEY = "depth-refresh-token";
export const DEVICE_ID_KEY = "depth-device-id";

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
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

export function persistTokens(accessToken?: string | null, refreshToken?: string | null) {
  if (typeof window === "undefined") return;
  if (accessToken) localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  else if (refreshToken === null) localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
