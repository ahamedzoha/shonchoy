import { ReactNode } from "react";

import { Provider } from "react-redux";
import { Toaster } from "sonner";

import "../config/i18n";
import "../config/sentry";
// Initialize Sentry
import { store } from "../store/store";

// Initialize i18n and Sentry

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <Provider store={store}>
      {children}
      <Toaster />
    </Provider>
  );
}
