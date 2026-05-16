"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/hooks/userUser";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const CTASection: React.FC = () => {
  const { isAuthenticated } = useUserStore();
  const router = useRouter();
  return (
    <section className="py-20 bg-hero-gradient">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center rounded-3xl border border-border bg-card px-6 py-12 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Your next interview is on the calendar.{" "}
            <span className="gradient-text">Be ready.</span>
          </h2>
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
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
              className="border-border text-foreground hover:bg-background px-8"
            >
              Interview By Resume
            </Button>
          </div>
          <p className="mt-6 text-muted-foreground">
            No credit card required. Try now.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
