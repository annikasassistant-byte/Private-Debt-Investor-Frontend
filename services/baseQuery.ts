import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  API_V1,
  clearTokens,
  getOrCreateDeviceId,
  getStoredAccessToken,
  getStoredRefreshToken,
  persistTokens,
} from "@/services/config";
import type { ApiSuccess, AuthTokensPayload } from "@/services/types";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_V1,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = getStoredAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Accept", "application/json");
    headers.set("X-Device-Id", getOrCreateDeviceId());
    headers.set("X-Device-Name", "Depth Web Client");
    return headers;
  },
});

function requestUrl(args: string | FetchArgs): string {
  return typeof args === "string" ? args : args.url;
}

/** Shared RTK base query: httpOnly cookies + session/memory Bearer, cookie-first refresh. */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const url = requestUrl(args);

  // Never run refresh-on-401 for the refresh endpoint itself
  if (url.includes("/auth/refresh")) {
    return result;
  }

  if (result.error && result.error.status === 401) {
    const refreshToken = getStoredRefreshToken();
    const refreshResult = await rawBaseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
        body: {
          ...(refreshToken ? { refreshToken } : {}),
          deviceId: getOrCreateDeviceId(),
          deviceName: "Depth Web Client",
        },
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const payload = (refreshResult.data as ApiSuccess<Partial<AuthTokensPayload>>).data;
      if (payload?.accessToken) {
        persistTokens(payload.accessToken, payload.refreshToken ?? refreshToken ?? null);
      }
      result = await rawBaseQuery(args, api, extraOptions);
      return result;
    }

    clearTokens();
  }

  return result;
};

export { rawBaseQuery };
