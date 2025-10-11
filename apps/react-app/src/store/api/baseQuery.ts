import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { logOut, setCredentials } from "../slices/authSlice";
import { RootState } from "../store";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:9080", // APISIX gateway
  credentials: "include", // for httpOnly cookies
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  timestamp: string;
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle both 401 (Unauthorized) and 403 (Forbidden/Token Expired) errors
  if (
    result.error &&
    (result.error.status === 401 || result.error.status === 403)
  ) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    // Only try to refresh if we have a refresh token
    if (!refreshToken) {
      console.warn("No refresh token available, logging out");
      api.dispatch(logOut());
      return result;
    }

    console.log("Token expired, attempting to refresh...");

    // Try to get a new access token using refresh token
    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
        body: {
          refreshToken,
        },
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const response = refreshResult.data as RefreshResponse;

      // Verify response structure
      if (
        response.success &&
        response.data?.accessToken &&
        response.data?.refreshToken
      ) {
        console.log("Token refresh successful");

        // Store the new tokens
        api.dispatch(
          setCredentials({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          })
        );

        // Retry the original query with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        console.error("Invalid refresh response structure:", response);
        api.dispatch(logOut());
      }
    } else {
      // Refresh failed, log out user
      console.error("Token refresh failed:", refreshResult.error);
      api.dispatch(logOut());
    }
  }

  return result;
};
