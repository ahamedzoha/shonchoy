import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./baseQuery";

export const protectedApiSlice = createApi({
  reducerPath: "protectedApi",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}), // Endpoints will be injected from specific API files
  tagTypes: ["Income", "Expense", "User"],
});
