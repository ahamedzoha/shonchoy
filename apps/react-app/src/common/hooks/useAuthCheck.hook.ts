import { useSelector } from "react-redux";

import type { RootState } from "../../store/store";

export function useAuthCheck() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  return {
    isAuthenticated,
  };
}
