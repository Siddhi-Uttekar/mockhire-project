"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/hooks/userUser";
import FullScreenLoader from "@/components/FullScreenLoader";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checkAuth, isLoading, hasHydrated } = useUserStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage
    if (hasHydrated && !isInitialized) {
      // Verify the token is still valid
      checkAuth().finally(() => {
        setIsInitialized(true);
      });
    }
  }, [hasHydrated, isInitialized]);

  // Show loading screen until:
  // 1. Zustand has hydrated from localStorage
  // 2. We've checked if the token is still valid
  if (!hasHydrated || !isInitialized || isLoading) {
    return <FullScreenLoader isLoading={true} />;
  }

  return <>{children}</>;
}
