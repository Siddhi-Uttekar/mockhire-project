"use client";
import { useState, useEffect } from "react";
import { FeedbackData } from "@/types/feedback";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/hooks/userUser";
import axios from "axios";

async function getInterviewById(id: string, userId: string) {
  try {
    const response = await axios.get(`/api/interviews/${id}`, {
      headers: {
        Authorization: userId,
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching interview:", error);
    return { success: false, data: null };
  }
}

export const useFeedback = (id: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState<any | null>(null);
  const router = useRouter();
  const { user, hasHydrated, isAuthenticated } = useUserStore();

  useEffect(() => {
    async function getFeedback() {
      setIsLoading(true);
      try {
        const result = await getInterviewById(id || "", user?.id || "");
        if (!result.success) {
          setFeedbackData(null);
          toast.error("Couldn't load feedback. Please try again.");
          router.push("/profile/feedback");
          return;
        }

        const interview = result.data?.data;

        if (
          !interview ||
          !interview.feedbacks ||
          interview.feedbacks.length === 0
        ) {
          setFeedbackData(null);
          router.push("/profile/feedback");
          toast.info("Interview feedback is not ready yet");
          return;
        }

        setFeedbackData({
          success: true,
          id: interview.id,
          role: interview.role,
          level: interview.level,
          type: interview.type,
          techstack: interview.techstack,
          questions: interview.questions,
          finalized: interview.finalized,
          createdAt: interview.createdAt,
          updatedAt: interview.updatedAt,
          userId: interview.userId,
          feedback: interview.feedbacks[0],
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        setFeedbackData(null);
        toast.error("Failed to load feedback (server/database issue).");
        router.push("/profile/feedback");
      } finally {
        setIsLoading(false);
      }
    }

    if (!id) {
      setIsLoading(false);
      return;
    }

    // Wait for persisted auth state to hydrate before deciding what to do.
    if (!hasHydrated) return;

    if (!isAuthenticated || !user?.id) {
      setIsLoading(false);
      toast.info("Please log in to view interview feedback.");
      router.push("/login");
      return;
    }

    getFeedback();
  }, [hasHydrated, id, isAuthenticated, user?.id, router]);

  const getScoreValue = (score: number): number => {
    return (score / 10) * 100;
  };

  const scoreColor = (score: number): string => {
    if (score >= 8) return "bg-pink-950/50";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return {
    isLoading,
    feedbackData,
    getScoreValue,
    scoreColor,
  };
};
