"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/hooks/userUser";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const HeroSection: React.FC = () => {
  const { isAuthenticated } = useUserStore();
  const router = useRouter();
  return (
    <section className="bg-hero-gradient min-h-screen flex items-center justify-center section-padding pt-20">
      <div className="max-w-[900px] mx-auto px-4">
        <div className="flex flex-col items-center text-center pb-44 py-16">
          <div className="mb-6 text-xs px-3 py-1 flex items-center justify-center gap-1 bg-card text-amber-200 border border-amber-400/30 rounded-full shadow-sm">
            <span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 128 128"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M64 26C31.7271 47.0162 15.5202 101 64 101C112.48 101 96.2728 47.0162 64 26Z"
                  fill="#FF9601"
                />
                <path
                  d="M64.0001 96C38.5001 96 56.5001 64 64.0001 60C71.5 64 89.5001 96 64.0001 96Z"
                  fill="#FFC803"
                />
                <path
                  d="M64 96C49.5 96.5 45.3054 82.2617 49.5 74C52.4768 81.7736 65.919 88.6666 64 96Z"
                  fill="#FFC803"
                />
                <path
                  d="M69.1942 95.071C83.2743 91.5711 79.7736 78.7209 75.9297 68.4508C71.952 75.7088 65.3357 88.5461 69.1942 95.071Z"
                  fill="#FFC803"
                />
              </svg>
            </span>
            <p className="text-sm text-amber-100">
              Practice. Improve. Crack It.
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Rehearse the interview.
            <br />
            <span className="gradient-text">Walk in unshakeable.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            MockHire runs realistic, role-specific AI interviews and returns
            brutally honest, line-by-line feedback. Spot your tells. Sharpen
            your story. Land the offer.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error("Please login to continue");
                  router.push("/login");
                  return;
                }
                router.push("/interview/by-position");
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8"
            >
              Interview By Position
            </Button>

            <Button
              size="lg"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error("Please login to continue");
                  router.push("/login");
                  return;
                }
                router.push("/interview/by-resume");
              }}
              variant="outline"
              className="border-border text-foreground hover:bg-card font-medium px-8"
            >
              Interview By Resume
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
