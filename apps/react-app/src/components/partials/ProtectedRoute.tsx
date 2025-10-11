import { Navigate, Outlet } from "react-router-dom";

import { useGetProfileQuery } from "../../store/apis";
import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";

// import { LoadingSpinner } from "@workspace/ui/components/loading-spinner";

const LoadingSpinner = () => <div>Loading...</div>;

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const { isLoading } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
};
