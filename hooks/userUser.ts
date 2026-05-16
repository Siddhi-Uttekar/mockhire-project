import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

interface SocialLink {
  id?: string;
  type: string;
  url: string;
}

interface User {
  id: string;
  uid: string;
  email: string;
  name: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  tags?: string;
  bio?: string;
  location?: string;
  website?: string;
  calendar?: string;
  profilePicture?: string;
  resume?: string;
  pronouns?: string;
  role: "CANDIDATE" | "RECRUITER";
  companyName?: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
  jobTitle?: string;
  phoneNumber?: string;
  linkedinProfile?: string;
  isVerified: boolean;
  socialLinks?: SocialLink[];
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setUser: (user: User | null) => void;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    displayName?: string;
    role: "CANDIDATE" | "RECRUITER";
    companyName?: string;
    companyWebsite?: string;
    companySize?: string;
    industry?: string;
    jobTitle?: string;
    phoneNumber?: string;
    linkedinProfile?: string;
  }) => Promise<{ success: boolean; message: string }>;
  login: (
    email: string,
    password: string,
    role: "CANDIDATE" | "RECRUITER"
  ) => Promise<{ success: boolean; message: string; user: User | null }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      hasHydrated: false,

      setHasHydrated: (state) => {
        set({ hasHydrated: state });
      },

      setUser: (user) => set({ user }),

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await axios.post("/api/auth/register", userData);

          if (response.data.success) {
            set({
              user: response.data.user,
              isLoading: false,
              isAuthenticated: true,
            });
            localStorage.setItem("accessToken", response.data.accessToken);
            return { success: true, message: response.data.message };
          } else {
            set({ isLoading: false, isAuthenticated: false });
            return { success: false, message: response.data.message };
          }
        } catch (error: any) {
          set({ isLoading: false, isAuthenticated: false });
          return {
            success: false,
            message: error.response?.data?.message || "Registration failed",
          };
        }
      },

      login: async (
        email: string,
        password: string,
        role: "CANDIDATE" | "RECRUITER"
      ) => {
        set({ isLoading: true });
        try {
          const response = await axios.post("/api/auth/login", {
            email,
            password,
            role,
          });

          if (response.data.success) {
            set({
              user: response.data.user,
              isLoading: false,
              isAuthenticated: true,
            });
            localStorage.setItem("accessToken", response.data.accessToken);
            return { success: true, message: response.data.message, user: response.data.user };
          } else {
            set({ isLoading: false, isAuthenticated: false });
            return { success: false, message: response.data.message, user: null };
          }
        } catch (error: any) {
          set({ isLoading: false, isAuthenticated: false });
          return {
            success: false,
            message: error.response?.data?.message || "Login failed",
            user: null,
          };
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem("accessToken");
      },

      checkAuth: async () => {
        // Check both localStorage and cookies for access token
        let token = localStorage.getItem("accessToken");

        // If not in localStorage, check cookies
        if (!token && typeof document !== "undefined") {
          const cookies = document.cookie.split("; ");
          const accessTokenCookie = cookies.find((c) =>
            c.startsWith("accessToken=")
          );
          if (accessTokenCookie) {
            token = accessTokenCookie.split("=")[1];
          }
        }

        if (token) {
          set({ isLoading: true });
          try {
            const response = await axios.get("/api/auth/me", {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
              set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
              });
              // Sync token to localStorage if it was from cookie
              if (!localStorage.getItem("accessToken")) {
                localStorage.setItem("accessToken", token);
              }
            } else {
              set({ user: null, isAuthenticated: false, isLoading: false });
              localStorage.removeItem("accessToken");
            }
          } catch (error) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            localStorage.removeItem("accessToken");
          }
        } else {
          set({ isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
