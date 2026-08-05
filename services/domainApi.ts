import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  Investor,
  Investment,
  Loan,
  Payment,
  Report,
  Contract,
  TimelineEvent,
} from "@/types";
import type { ApiSuccess } from "@/services/types";
import { baseQueryWithReauth } from "@/services/baseQuery";

type ListResult<T> = { data: T[]; meta?: unknown };

function unwrapList<T>(response: ApiSuccess<T[]> | ApiSuccess<ListResult<T>>): T[] {
  const data = response.data as any;
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

const PORTFOLIO_TAGS = [
  "Investments",
  "Payments",
  "Dashboard",
  "Timeline",
  "Investors",
  "Loans",
] as const;

export const domainApi = createApi({
  reducerPath: "domainApi",
  baseQuery: baseQueryWithReauth,
  refetchOnMountOrArgChange: true,
  refetchOnFocus: true,
  keepUnusedDataFor: 15,
  tagTypes: [
    "Investors",
    "Investments",
    "Loans",
    "Payments",
    "Reports",
    "Contracts",
    "Timeline",
    "Dashboard",
  ],
  endpoints: (builder) => ({
    getAdminStats: builder.query<Record<string, number>, void>({
      query: () => "/dashboard/admin",
      transformResponse: (r: ApiSuccess<Record<string, number>>) => r.data,
      providesTags: ["Dashboard"],
    }),
    getInvestorDashboard: builder.query<
      {
        investment: Investment | null;
        investments?: Investment[];
        payments: Payment[];
        timeline: TimelineEvent[];
        stats?: {
          investmentAmount?: number;
          outstandingBalance?: number;
          principalRepaid?: number;
          interestEarned?: number;
          nextPaymentDate?: string | null;
          nextPaymentAmount?: number;
          maturityDate?: string | null;
          status?: string | null;
          repaymentCount?: number;
          overdueCount?: number;
          upcomingPaymentCount?: number;
          returnedAmount?: number;
          investmentCount?: number;
        } | null;
      },
      void
    >({
      query: () => "/dashboard/investor",
      transformResponse: (r: ApiSuccess<any>) => r.data,
      providesTags: ["Dashboard", "Investments", "Payments", "Timeline"],
    }),

    getInvestors: builder.query<Investor[], { search?: string } | void>({
      query: (params) => ({
        url: "/investors",
        params: { limit: 100, ...(params || {}) },
      }),
      transformResponse: (r: ApiSuccess<Investor[]>) => unwrapList(r),
      providesTags: ["Investors"],
    }),
    createInvestor: builder.mutation<
      Investor,
      {
        name: string;
        email: string;
        password: string;
        phone?: string;
        company?: string;
      }
    >({
      query: (body) => ({ url: "/investors", method: "POST", body }),
      transformResponse: (r: ApiSuccess<Investor>) => r.data,
      invalidatesTags: ["Investors", "Dashboard"],
    }),
    updateInvestor: builder.mutation<Investor, { id: string; body: Partial<Investor> }>({
      query: ({ id, body }) => ({ url: `/investors/${id}`, method: "PATCH", body }),
      transformResponse: (r: ApiSuccess<Investor>) => r.data,
      invalidatesTags: ["Investors", "Dashboard"],
    }),
    deleteInvestor: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/investors/${id}`, method: "DELETE" }),
      transformResponse: (r: ApiSuccess<{ success: boolean }>) => r.data,
      invalidatesTags: ["Investors", "Dashboard"],
    }),

    getInvestments: builder.query<Investment[], void>({
      query: () => ({ url: "/investments", params: { limit: 100 } }),
      transformResponse: (r: ApiSuccess<Investment[]>) => unwrapList(r),
      providesTags: ["Investments"],
    }),
    createInvestment: builder.mutation<Investment, Record<string, unknown>>({
      query: (body) => ({ url: "/investments", method: "POST", body }),
      transformResponse: (r: ApiSuccess<Investment>) => r.data,
      invalidatesTags: [...PORTFOLIO_TAGS],
    }),
    updateInvestment: builder.mutation<Investment, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/investments/${id}`, method: "PATCH", body }),
      transformResponse: (r: ApiSuccess<Investment>) => r.data,
      invalidatesTags: [...PORTFOLIO_TAGS],
    }),
    deleteInvestment: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/investments/${id}`, method: "DELETE" }),
      transformResponse: (r: ApiSuccess<{ success: boolean }>) => r.data,
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const removeInvestment = dispatch(
          domainApi.util.updateQueryData("getInvestments", undefined, (draft) => {
            const idx = draft.findIndex((inv) => inv.id === id);
            if (idx >= 0) draft.splice(idx, 1);
          })
        );
        const removePayments = dispatch(
          domainApi.util.updateQueryData("getPayments", undefined, (draft) => {
            for (let i = draft.length - 1; i >= 0; i -= 1) {
              if (draft[i].investmentId === id) draft.splice(i, 1);
            }
          })
        );
        const removeTimeline = dispatch(
          domainApi.util.updateQueryData("getTimeline", undefined, (draft) => {
            for (let i = draft.length - 1; i >= 0; i -= 1) {
              if (draft[i].investmentId === id) draft.splice(i, 1);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          removeInvestment.undo();
          removePayments.undo();
          removeTimeline.undo();
        }
      },
      invalidatesTags: [...PORTFOLIO_TAGS],
    }),
    regenerateSchedule: builder.mutation<{ data?: Payment[] }, string>({
      query: (id) => ({ url: `/investments/${id}/regenerate-schedule`, method: "POST" }),
      invalidatesTags: [...PORTFOLIO_TAGS],
    }),
    earlyRepayment: builder.mutation<
      Investment,
      { id: string; body: { amount: number; interestPortion?: number; notes?: string } }
    >({
      query: ({ id, body }) => ({
        url: `/investments/${id}/early-repayment`,
        method: "POST",
        body,
      }),
      transformResponse: (r: ApiSuccess<Investment>) => r.data,
      invalidatesTags: [...PORTFOLIO_TAGS],
    }),

    getLoans: builder.query<Loan[], void>({
      query: () => ({ url: "/loans", params: { limit: 100 } }),
      transformResponse: (r: ApiSuccess<Loan[]>) => unwrapList(r),
      providesTags: ["Loans"],
    }),
    createLoan: builder.mutation<Loan, Record<string, unknown>>({
      query: (body) => ({ url: "/loans", method: "POST", body }),
      transformResponse: (r: ApiSuccess<Loan>) => r.data,
      invalidatesTags: ["Loans", "Timeline", "Dashboard", "Investments"],
    }),
    updateLoan: builder.mutation<Loan, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/loans/${id}`, method: "PATCH", body }),
      transformResponse: (r: ApiSuccess<Loan>) => r.data,
      invalidatesTags: ["Loans", "Dashboard"],
    }),
    deleteLoan: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/loans/${id}`, method: "DELETE" }),
      invalidatesTags: ["Loans", "Timeline", "Dashboard"],
    }),

    getPayments: builder.query<Payment[], { investmentId?: string } | void>({
      query: (params) => ({
        url: "/payments",
        params: { limit: 500, ...(params || {}) },
      }),
      transformResponse: (r: ApiSuccess<Payment[]>) => unwrapList(r),
      providesTags: ["Payments"],
    }),
    getInvestmentPayments: builder.query<Payment[], string>({
      query: (id) => `/investments/${id}/payments`,
      transformResponse: (r: ApiSuccess<Payment[]>) => (Array.isArray(r.data) ? r.data : []),
      providesTags: ["Payments"],
    }),
    markPaymentPaid: builder.mutation<Payment, { id: string; body?: Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `/payments/${id}/mark-paid`,
        method: "POST",
        body: body || {},
      }),
      transformResponse: (r: ApiSuccess<Payment>) => r.data,
      invalidatesTags: [...PORTFOLIO_TAGS],
    }),
    cancelPayment: builder.mutation<Payment, { id: string; body?: Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `/payments/${id}/cancel`,
        method: "POST",
        body: body || {},
      }),
      transformResponse: (r: ApiSuccess<Payment>) => r.data,
      invalidatesTags: [...PORTFOLIO_TAGS],
    }),

    getReports: builder.query<Report[], void>({
      query: () => ({ url: "/reports", params: { limit: 100 } }),
      transformResponse: (r: ApiSuccess<Report[]>) => unwrapList(r),
      providesTags: ["Reports"],
    }),
    createReport: builder.mutation<Report, FormData>({
      query: (body) => ({ url: "/reports", method: "POST", body }),
      transformResponse: (r: ApiSuccess<Report>) => r.data,
      invalidatesTags: ["Reports"],
    }),
    updateReport: builder.mutation<Report, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/reports/${id}`, method: "PATCH", body }),
      transformResponse: (r: ApiSuccess<Report>) => r.data,
      invalidatesTags: ["Reports"],
    }),
    deleteReport: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/reports/${id}`, method: "DELETE" }),
      invalidatesTags: ["Reports"],
    }),

    getContracts: builder.query<Contract[], void>({
      query: () => ({ url: "/contracts", params: { limit: 100 } }),
      transformResponse: (r: ApiSuccess<Contract[]>) => unwrapList(r),
      providesTags: ["Contracts"],
    }),
    createContract: builder.mutation<Contract, FormData>({
      query: (body) => ({ url: "/contracts", method: "POST", body }),
      transformResponse: (r: ApiSuccess<Contract>) => r.data,
      invalidatesTags: ["Contracts"],
    }),
    updateContract: builder.mutation<Contract, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/contracts/${id}`, method: "PATCH", body }),
      transformResponse: (r: ApiSuccess<Contract>) => r.data,
      invalidatesTags: ["Contracts"],
    }),
    deleteContract: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/contracts/${id}`, method: "DELETE" }),
      invalidatesTags: ["Contracts"],
    }),

    getTimeline: builder.query<TimelineEvent[], void>({
      query: () => ({ url: "/timeline", params: { limit: 500, sort: "date" } }),
      transformResponse: (r: ApiSuccess<TimelineEvent[]>) => unwrapList(r),
      providesTags: ["Timeline"],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetInvestorDashboardQuery,
  useGetInvestorsQuery,
  useCreateInvestorMutation,
  useUpdateInvestorMutation,
  useDeleteInvestorMutation,
  useGetInvestmentsQuery,
  useCreateInvestmentMutation,
  useUpdateInvestmentMutation,
  useDeleteInvestmentMutation,
  useRegenerateScheduleMutation,
  useEarlyRepaymentMutation,
  useGetLoansQuery,
  useCreateLoanMutation,
  useUpdateLoanMutation,
  useDeleteLoanMutation,
  useGetPaymentsQuery,
  useGetInvestmentPaymentsQuery,
  useMarkPaymentPaidMutation,
  useCancelPaymentMutation,
  useGetReportsQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
  useDeleteReportMutation,
  useGetContractsQuery,
  useCreateContractMutation,
  useUpdateContractMutation,
  useDeleteContractMutation,
  useGetTimelineQuery,
} = domainApi;
