import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Path aliases for cleaner imports
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@features": resolve(__dirname, "./src/features"),
      "@hooks": resolve(__dirname, "./src/common/hooks"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@config": resolve(__dirname, "./src/config"),
      "@locales": resolve(__dirname, "./src/locales"),
      "@store": resolve(__dirname, "./src/store"),
      "@routes": resolve(__dirname, "./src/routes"),
      "@types": resolve(__dirname, "./src/types"),
    },
  },

  // Build optimizations
  build: {
    // Manual chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            if (id.includes("react-router")) {
              return "router-vendor";
            }
            if (id.includes("@reduxjs") || id.includes("react-redux")) {
              return "redux-vendor";
            }
            if (id.includes("i18next")) {
              return "i18n-vendor";
            }
            if (id.includes("@sentry")) {
              return "sentry-vendor";
            }
            // Other vendor libraries
            return "vendor";
          }

          // Feature chunks
          if (id.includes("features/auth")) {
            return "auth-feature";
          }
          if (id.includes("features/dashboard")) {
            return "dashboard-feature";
          }
        },
      },
    },

    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,

    // Enable source maps for better debugging
    sourcemap: true,

    // Optimize CSS
    cssCodeSplit: true,
  },

  // Development server configuration
  server: {
    port: 3001,
    host: true,
  },

  // Preview server configuration
  preview: {
    port: 3001,
  },
});
