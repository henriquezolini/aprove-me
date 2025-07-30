import { create } from "zustand";
import { devtools } from "zustand/middleware";

type GlobalState = {
  loading: boolean;
  authenticated: boolean;
  isMenuOpen: boolean;
  themeMode: "light" | "dark";
  isMobile: boolean;
  setLoading: (loading: boolean) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
};

const initialState = {
  loading: true,
  authenticated: false,
  isMenuOpen: true,
  themeMode: "light" as "light" | "dark",
  isMobile: false
};

const useGlobalState = create<GlobalState>()(
  devtools(
    (set) => ({
      ...initialState,
      setLoading: (loading) => set({ loading }, false, "setLoading"),
      setAuthenticated: (authenticated) => set({ authenticated }, false, "setAuthenticated"),
      setIsMenuOpen: (isMenuOpen) => set({ isMenuOpen }, false, "setIsMenuOpen")
    }),
    { name: "Global" }
  )
);

export default useGlobalState;
