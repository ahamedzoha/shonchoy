import { Suspense, lazy } from "react";

import { RouteObject } from "react-router-dom";

import { PublicLayout } from "../components";
import { authPaths } from "./paths";

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const VerifyEmailPage = lazy(() => import("../pages/auth/VerifyEmailPage"));
const VerifyEmailPendingPage = lazy(
  () => import("../pages/auth/VerifyEmailPendingPage")
);

export const authRoutes: RouteObject[] = [
  {
    path: authPaths.default,
    element: <PublicLayout />,
    children: [
      {
        path: authPaths.login,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: authPaths.register,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <RegisterPage />
          </Suspense>
        ),
      },
      {
        path: authPaths.verifyEmail,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailPage />
          </Suspense>
        ),
      },
      {
        path: authPaths.verifyEmailPending,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailPendingPage />
          </Suspense>
        ),
      },
    ],
  },
];
