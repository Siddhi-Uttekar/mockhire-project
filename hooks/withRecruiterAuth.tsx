
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/hooks/userUser";
import FullScreenLoader from "@/components/FullScreenLoader";

const withRecruiterAuth = (WrappedComponent: React.ComponentType) => {
  const Wrapper = (props: any) => {
    const { isAuthenticated, user, isLoading, hasHydrated } = useUserStore();
    const router = useRouter();

    useEffect(() => {
      if (hasHydrated && !isLoading && (!isAuthenticated || user?.role !== "RECRUITER")) {
        router.push("/login");
      }
    }, [isAuthenticated, user, isLoading, hasHydrated, router]);

    if (isLoading || !hasHydrated) {
      return <FullScreenLoader />;
    }

    if (isAuthenticated && user?.role === "RECRUITER") {
      return <WrappedComponent {...props} />;
    }

    return <FullScreenLoader />;
  };

  return Wrapper;
};

export default withRecruiterAuth;
