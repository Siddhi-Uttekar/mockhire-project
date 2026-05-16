"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "./userUser";

interface UseProtectedRouteOptions {
  redirectTo?: string;
  requiredRole?: "CANDIDATE" | "RECRUITER";
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { redirectTo = "/login", requiredRole } = options;
  const { user, isAuthenticated, isLoading, hasHydrated } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // Wait for hydration to complete
    if (!hasHydrated) return;

    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role if required
    if (requiredRole && user && user.role !== requiredRole) {
      router.push("/"); // Redirect to home if role doesn't match
    }
  }, [
    hasHydrated,
    isAuthenticated,
    isLoading,
    user,
    requiredRole,
    redirectTo,
    router,
  ]);

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || !hasHydrated,
  };
}
