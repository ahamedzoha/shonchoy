import { Suspense, lazy } from "react";

import { RouteObject } from "react-router-dom";

import { DashboardLayout, ProtectedRoute } from "../components";
import { dashboardPaths } from "./paths";

const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));

export const dashboardRoutes: RouteObject[] = [
  {
    path: dashboardPaths.default,
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: dashboardPaths.dashboard,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <DashboardPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
];
