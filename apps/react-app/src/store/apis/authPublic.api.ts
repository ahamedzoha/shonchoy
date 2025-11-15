import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  VerifyEmailResponse,
} from "../../features/auth";
import { publicApiSlice } from "../api/publicApi";

export const authPublicApi = publicApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),
    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (data) => ({
        url: "/auth/refresh",
        method: "POST",
        body: data,
      }),
    }),
    initiateGoogleOAuth: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/google",
        method: "GET",
        responseHandler: "text",
      }),
    }),
    verifyEmail: builder.mutation<VerifyEmailResponse, string>({
      query: (token) => ({
        url: `/auth/verify-email?token=${token}`,
        method: "GET",
      }),
    }),
    resendVerificationEmail: builder.mutation<
      ResendVerificationResponse,
      ResendVerificationRequest
    >({
      query: (data) => ({
        url: "/auth/resend-verification",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useInitiateGoogleOAuthMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
} = authPublicApi;
