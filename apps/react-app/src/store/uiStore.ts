import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  theme: "light" | "dark";
  toggleSidebar: () => void;
  openModal: () => void;
  closeModal: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarOpen: true,
      modalOpen: false,
      theme: "light",
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      openModal: () => set({ modalOpen: true }),
      closeModal: () => set({ modalOpen: false }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "ui-store" }
  )
);

