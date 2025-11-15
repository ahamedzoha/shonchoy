import { protectedApiSlice } from "../api/protectedApi";

// Types
export interface CreateIncomeRequest {
  amount: number;
  source: string;
  frequency: "weekly" | "monthly" | "yearly" | "one-time";
  description?: string;
  date?: string;
}

export interface UpdateIncomeRequest {
  amount?: number;
  source?: string;
  frequency?: "weekly" | "monthly" | "yearly" | "one-time";
  description?: string;
  date?: string;
}

export interface IncomeResponse {
  id: string;
  userId: string;
  amount: number;
  source: string;
  frequency: "weekly" | "monthly" | "yearly" | "one-time";
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeListResponse {
  incomes: IncomeResponse[];
  total: number;
  page: number;
  limit: number;
}

export const incomeApi = protectedApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getIncomes: builder.query<
      IncomeListResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/v1/income",
        params: { page, limit },
      }),
      providesTags: ["Income"],
    }),
    getIncome: builder.query<IncomeResponse, string>({
      query: (id) => `/v1/income/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Income", id }],
    }),
    createIncome: builder.mutation<IncomeResponse, CreateIncomeRequest>({
      query: (income) => ({
        url: "/v1/income",
        method: "POST",
        body: income,
      }),
      invalidatesTags: ["Income"],
    }),
    updateIncome: builder.mutation<
      IncomeResponse,
      { id: string; data: UpdateIncomeRequest }
    >({
      query: ({ id, data }) => ({
        url: `/v1/income/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Income", id },
        "Income",
      ],
    }),
    deleteIncome: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/income/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Income"],
    }),
  }),
});

export const {
  useGetIncomesQuery,
  useGetIncomeQuery,
  useCreateIncomeMutation,
  useUpdateIncomeMutation,
  useDeleteIncomeMutation,
} = incomeApi;
