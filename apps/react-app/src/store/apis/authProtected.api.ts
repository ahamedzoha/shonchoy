import type { User, UserProfileResponse } from "../../features/auth";
import { protectedApiSlice } from "../api/protectedApi";

export const authProtectedApi = protectedApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<User, void>({
      query: () => "/users/profile",
      providesTags: ["User"],
      transformResponse: (response: UserProfileResponse) => response.data,
    }),
    logout: builder.mutation<void, string>({
      query: (refreshToken) => ({
        url: "/auth/logout",
        method: "POST",
        body: { refreshToken },
      }),
    }),
  }),
});

export const { useGetProfileQuery, useLogoutMutation } = authProtectedApi;
