import {
  useGetProfileQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} from "../../../store/apis";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logOut, setCredentials } from "../../../store/slices/authSlice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const { data: profile, isLoading: isLoadingProfile } = useGetProfileQuery(
    undefined,
    {
      skip: !isAuthenticated,
    }
  );

  const handleLogin = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      const result = await login(credentials).unwrap();
      dispatch(
        setCredentials({
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        })
      );
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const handleRegister = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const result = await register(userData).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logOut());
    }
  };

  return {
    // State
    user: profile || user,
    isAuthenticated,
    isLoadingProfile,

    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,

    // Loading states
    isLoggingIn,
    isRegistering,
    isLoggingOut,
  };
}
