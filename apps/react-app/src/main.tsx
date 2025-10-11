import { StrictMode } from "react";

import { ThemeProvider } from "next-themes";

import { Toaster } from "@workspace/ui/components/sonner";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { ErrorBoundary } from "./components";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <App />
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
