import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  API_V1,
  clearTokens,
  getOrCreateDeviceId,
} from "@/services/config";
import type {
  ApiSuccess,
  AuthTokensPayload,
  ForgotPasswordPayload,
  MessagePayload,
  ServerUser,
  VerifyOtpPayload,
} from "@/services/types";

const CSRF_COOKIE_NAME = "csrf_token";

function readBrowserCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const encoded = encodeURIComponent(name);
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq) === name || part.slice(0, eq) === encoded) {
      return decodeURIComponent(part.slice(eq + 1));
    }
  }
  return null;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_V1,
  credentials: "include",
  prepareHeaders: (headers) => {
    // Auth via httpOnly cookies. Double-submit CSRF when cookie is present.
    const csrf = readBrowserCookie(CSRF_COOKIE_NAME);
    if (csrf) headers.set("X-CSRF-Token", csrf);
    headers.set("Accept", "application/json");
    headers.set("X-Device-Id", getOrCreateDeviceId());
    headers.set("X-Device-Name", "Depth Web Client");
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshResult = await rawBaseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
        body: { deviceId: getOrCreateDeviceId() },
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Cookies refreshed by Set-Cookie; retry original request.
      result = await rawBaseQuery(args, api, extraOptions);
      return result;
    }
    clearTokens();
  }

  return result;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    register: builder.mutation<
      AuthTokensPayload,
      {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
      }
    >({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body: { ...body, deviceId: getOrCreateDeviceId(), deviceName: "Depth Web Client" },
      }),
      transformResponse: (response: ApiSuccess<AuthTokensPayload>) => response.data,
    }),

    login: builder.mutation<AuthTokensPayload, { email: string; password: string }>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body: { ...body, deviceId: getOrCreateDeviceId(), deviceName: "Depth Web Client" },
      }),
      transformResponse: (response: ApiSuccess<AuthTokensPayload>) => response.data,
      invalidatesTags: ["Profile"],
    }),

    logout: builder.mutation<MessagePayload, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
        body: {},
      }),
      transformResponse: (response: ApiSuccess<MessagePayload>) => response.data,
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          clearTokens();
        }
      },
    }),

    forgotPassword: builder.mutation<ForgotPasswordPayload, { email: string }>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
      transformResponse: (response: ApiSuccess<ForgotPasswordPayload>) => response.data,
    }),

    verifyOtp: builder.mutation<VerifyOtpPayload, { email: string; otp: string }>({
      query: (body) => ({ url: "/auth/verify-otp", method: "POST", body }),
      transformResponse: (response: ApiSuccess<VerifyOtpPayload>) => response.data,
    }),

    resetPassword: builder.mutation<
      MessagePayload,
      { password: string; resetToken?: string; token?: string; email?: string; otp?: string }
    >({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
      transformResponse: (response: ApiSuccess<MessagePayload>) => response.data,
    }),

    changePassword: builder.mutation<
      MessagePayload,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
      transformResponse: (response: ApiSuccess<MessagePayload>) => response.data,
    }),

    getProfile: builder.query<ServerUser, void>({
      query: () => "/users/me",
      transformResponse: (response: ApiSuccess<ServerUser>) => response.data,
      providesTags: ["Profile"],
    }),

    updateProfile: builder.mutation<
      ServerUser,
      { firstName?: string; lastName?: string; phone?: string | null }
    >({
      query: (body) => ({ url: "/users/me", method: "PATCH", body }),
      transformResponse: (response: ApiSuccess<ServerUser>) => response.data,
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
