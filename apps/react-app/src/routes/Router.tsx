import { useEffect } from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
  useRoutes,
} from "react-router-dom";

import { useAuthCheck } from "../common/hooks/useAuthCheck.hook";
import { AppLoader } from "../components";
import { useGlobalLoadingSelector } from "../store/selectors/global.selector";
import { authRoutes } from "./auth.route";
import { dashboardRoutes } from "./dashboard.route";
import { authPaths, dashboardPaths } from "./paths";

export function AppRoutes() {
  const { isAuthenticated } = useAuthCheck();
  const isLoading = useGlobalLoadingSelector();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isLoginPage = window.location.pathname === authPaths.login;
    const isUnauthenticatedPage = /^\/(login|register|verify-email)/.test(
      window.location.pathname
    );

    if (isAuthenticated && isLoginPage) {
      navigate(dashboardPaths.dashboard, { replace: true });
    }
    if (!isAuthenticated && !isUnauthenticatedPage) {
      navigate(authPaths.login, {
        state: { from: location },
        replace: true,
      });
    }
  }, [isAuthenticated, location, navigate]);

  const routes = isAuthenticated ? [...dashboardRoutes] : [...authRoutes];

  const element = useRoutes([
    ...routes,
    // Catch all route
    {
      path: "*",
      element: <Navigate to={authPaths.login} replace />,
    },
  ]);

  return <AppLoader isLoading={isLoading} element={element} />;
}
