import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const publicApiSlice = createApi({
  reducerPath: "publicApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:9080",
    credentials: "include",
  }),
  endpoints: () => ({}), // Endpoints will be injected from specific API files
  tagTypes: ["Auth"],
});
