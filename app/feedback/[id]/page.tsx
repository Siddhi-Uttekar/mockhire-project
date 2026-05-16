"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import InterviewSummary from "@/components/interview-feedback/InterviewSummary";
import ScorecardSection from "@/components/interview-feedback/ScorecardSection";
import QuestionFeedbackAccordion from "@/components/interview-feedback/QuestionFeedbackAccordion";
import FinalRecommendations from "@/components/interview-feedback/FinalRecommendations";
import FeedbackActions from "@/components/interview-feedback/FeedbackActions";
import { Badge } from "@/components/ui/badge";
import { useFeedback } from "@/hooks/useFeedback";
import { useRouter, useParams } from "next/navigation";
import FullScreenLoader from "@/components/FullScreenLoader";
import { flattenDataAndExportToCSV } from "@/utils/flattenDataAndExportToCSV";

const InterviewFeedbackPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      // This will be handled by the useFeedback hook, but as a fallback
      router.push("/");
    }
  }, [id, router]);

  const { isLoading, feedbackData, getScoreValue, scoreColor } =
    useFeedback(id);

  if (isLoading) {
    return (
      <FullScreenLoader isLoading={true} text="Loading interview feedback..." />
    );
  }
  if (!feedbackData || !feedbackData.success) {
    return (
      <div className="min-h-screen flex flex-col justify-center bg-background pt-16">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center bg-card rounded-lg shadow-xl p-8 max-w-md mx-auto border border-border">
            <h1 className="text-2xl font-bold mb-4 text-foreground">
              Feedback Not Found
            </h1>
            <p className="mb-6 text-muted-foreground">
              We couldn't find the interview feedback you're looking for.
            </p>
            <Link href="/jobs">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg">
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const interview = feedbackData;
  const feedback = interview.feedback;

  if (!feedback) {
    return (
      <div className="min-h-screen flex flex-col justify-center bg-background pt-16">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center bg-card rounded-lg shadow-xl p-8 max-w-md mx-auto border border-border">
            <h1 className="text-2xl font-bold mb-4 text-foreground">
              Feedback Not Ready
            </h1>
            <p className="mb-6 text-muted-foreground">
              The interview feedback is still being processed.
            </p>
            <Link href="/jobs">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg">
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Prisma schema uses snake_case relation names; UI components expect camelCase.
  const detailedFeedback =
    feedback.detailed_feedbacks ?? feedback.detailedFeedback ?? null;
  const categoryScoresRaw =
    feedback.category_scores ?? feedback.categoryScores ?? [];
  const categoryScores = Array.isArray(categoryScoresRaw)
    ? categoryScoresRaw
    : [];
  const questionFeedbacksRaw =
    detailedFeedback?.question_feedbacks ?? detailedFeedback?.questionFeedbacks;
  const questionFeedbacks = Array.isArray(questionFeedbacksRaw)
    ? questionFeedbacksRaw
    : [];

  // Helper function to convert semicolon-separated string to array
  const parseStringToArray = (data: string | null | undefined): string[] => {
    if (!data) return [];
    if (typeof data === "string") {
      return data
        .split(";")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
    return [];
  };

  const formattedFeedback = {
    interview_summary: {
      overall_impression:
        feedback.finalAssessment || detailedFeedback?.overallImpression,
      overall_rating: feedback.totalScore,
      strengths: feedback.strengths || detailedFeedback?.notableStrengths,
      technical_skills: {
        score: detailedFeedback?.technicalSkillsScore || 0,
        commentary: detailedFeedback?.technicalSkillsCommentary || "",
      },
      problem_solving: {
        score: detailedFeedback?.problemSolvingScore || 0,
        commentary: detailedFeedback?.problemSolvingCommentary || "",
      },
      communication: {
        score: detailedFeedback?.communicationScore || 0,
        commentary: detailedFeedback?.communicationCommentary || "",
      },
      confidence: {
        score: detailedFeedback?.confidenceScore || 0,
        commentary: detailedFeedback?.confidenceCommentary || "",
      },
      overall_analysis:
        detailedFeedback?.overallAnalysis || feedback.overallAnalysis || "",
      notable_strengths: parseStringToArray(
        detailedFeedback?.notableStrengths || feedback.strengths,
      ),
      areas_for_improvement: parseStringToArray(
        feedback.areasForImprovement || detailedFeedback?.areasForImprovement,
      ),
    },
    scorecard: categoryScores.map((cat: any) => ({
      name: cat.name,
      score: cat.score,
      comment: cat.comment,
    })),
    per_question_feedback: questionFeedbacks.map((qf: any) => ({
      question_id: qf.questionId,
      question: qf.question,
      candidate_answer: qf.candidateAnswer,
      candidate_answer_summary: qf.candidateAnswerSummary || "",
      actual_answer: qf.actualAnswer || "",
      expected_ideal_points: parseStringToArray(qf.expectedIdealPoints),
      recommendation: qf.recommendation,
      evaluation: {
        score: qf.evaluationScore,
        coverage: qf.evaluationCoverage,
        missed_points: parseStringToArray(qf.evaluationMissedPoints),
        depth: qf.evaluationDepth,
      },
    })),
    final_recommendations: {
      practice_focus_areas: parseStringToArray(
        detailedFeedback?.practiceFocusAreas,
      ),
      overall_impression: detailedFeedback?.overallImpression || "",
      final_tip: detailedFeedback?.finalTip || "",
    },
  };

  const jobInfo = {
    id: interview.jobId || "N/A",
    title: interview.role,
    level: interview.level,
    type: interview.type,
    company: interview.company || "Company",
    requirements: interview.techstack,
    location: interview.location || "N/A",
    description: interview.description || "N/A",
    responsibilities: interview.responsibilities || "N/A",
    qualifications: interview.qualifications || "N/A",
    salary: interview.salary || "N/A",
    postedAt: interview.postedAt || "N/A",
    posted: interview.posted || "N/A",
    logo: interview.logo || "",
    industry: interview.industry || "N/A",
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="mb-8">
          <Link
            href="/profile/feedback"
            className="text-amber-200 hover:underline flex items-center mb-4 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Feedbacks
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card rounded-lg shadow-sm p-6 border border-border">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Interview Feedback
              </h1>
              <p className="text-muted-foreground mt-2 font-medium">
                {interview.role || "Position"} - Interview #{id.substring(0, 8)}
              </p>
              <Badge className="bg-primary text-primary-foreground mt-3 shadow-sm">
                Completed
              </Badge>
            </div>
            <div>
              <Button
                onClick={() => {
                  setLoading(true);
                flattenDataAndExportToCSV({
                  job: jobInfo,
                  feedback: formattedFeedback,
                });
                setLoading(false);
              }}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg"
              variant="default"
            >
                {loading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Export as CSV"
                )}
              </Button>
            </div>
          </div>
        </div>

        <InterviewSummary
          summary={formattedFeedback.interview_summary}
          getScoreValue={getScoreValue}
          scoreColor={scoreColor}
        />

        <ScorecardSection
          scorecard={formattedFeedback.scorecard}
          getScoreValue={getScoreValue}
          scoreColor={scoreColor}
        />

        <QuestionFeedbackAccordion
          questions={formattedFeedback.per_question_feedback}
          scoreColor={scoreColor}
        />

        <FinalRecommendations
          recommendations={formattedFeedback.final_recommendations}
        />

        <FeedbackActions createdAt={feedback.createdAt} id={String(id)} />
      </div>
    </div>
  );
};

export default InterviewFeedbackPage;
