import InterviewFeedbackGenerator from "@/lib/generate-feedback";
import { prisma } from "@/lib/prisma";

// In-memory lock to prevent duplicate concurrent requests for the same interview
const processingLocks = new Map<string, Promise<Response>>();

// Type for category score data
interface CategoryScoreData {
  id: string;
  feedbackId: string;
  name: string;
  score: number;
  comment: string;
}

// Helper to safely parse numbers
function safeParseFloat(value: any, defaultValue: number = 0): number {
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? defaultValue : parsed;
}

function safeParseInt(value: any, defaultValue: number = 0): number {
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Helper to safely truncate strings to prevent database errors
function truncateString(str: string | null | undefined, maxLength: number): string {
  if (!str) return "";
  return str.length > maxLength ? str.substring(0, maxLength) : str;
}

// Helper to safely parse array to string
function parseArrayToString(data: any, separator: string = "; "): string {
  if (Array.isArray(data)) {
    return data.filter(Boolean).join(separator);
  }
  if (typeof data === "string") {
    return data;
  }
  return "";
}

// Retry helper for database operations
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      // Don't retry on validation errors
      if (error instanceof Error && error.message.includes("Invalid")) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw lastError;
}

export async function POST(request: Request) {
  let requestBody: any;
  
  try {
    requestBody = await request.json();
  } catch (error) {
    return Response.json({
      success: false,
      message: "Invalid JSON in request body",
    }, { status: 400 });
  }

  const {
    transcript,
    job,
    userId,
    interviewId,
    interviewQs,
    userName,
    resumeData,
    useResumeFallback,
  } = requestBody;

  console.log("=== FEEDBACK GENERATION STARTED ===");
  console.log("User ID:", userId);
  console.log("Interview ID:", interviewId);
  console.log("Transcript length:", transcript?.length || 0);
  console.log("Interview questions count:", interviewQs?.length || 0);

  // Validate required fields
  if (!userId) {
    return Response.json({
      success: false,
      message: "User id is required",
    }, { status: 400 });
  }

  if (!interviewId) {
    return Response.json({
      success: false,
      message: "Interview id is required",
    }, { status: 400 });
  }

  // Check for duplicate concurrent requests
  const lockKey = `${userId}:${interviewId}`;
  if (processingLocks.has(lockKey)) {
    console.log(`⚠ Duplicate request detected for ${lockKey}, waiting for existing request...`);
    try {
      const existingResponse = await processingLocks.get(lockKey);
      // Clone the response since it may have been consumed
      return Response.json({
        success: true,
        interviewId: interviewId,
        message: "Feedback generation already in progress - returned existing result",
      });
    } catch (error) {
      // If the existing request failed, allow this one to proceed
      processingLocks.delete(lockKey);
    }
  }

  // Ensure Prisma client is available
  if (!prisma) {
    console.error("Prisma client is not initialized");
    return Response.json({
      success: false,
      message: "Database connection error",
    }, { status: 500 });
  }

  if (!useResumeFallback && (!transcript || transcript.length === 0 || !job)) {
    return Response.json({
      success: false,
      message: "Interview transcript and job data are required",
    }, { status: 400 });
  }

  // Create the processing promise and store it
  const processingPromise = processRequest();
  processingLocks.set(lockKey, processingPromise);

  try {
    return await processingPromise;
  } finally {
    // Clean up the lock after completion
    processingLocks.delete(lockKey);
  }

  async function processRequest(): Promise<Response> {
    try {
      console.log("Checking database connection...");
      
      const user = await withRetry(() => 
        prisma.user.findUnique({
          where: { id: userId },
        })
      );

      console.log("User found:", !!user);

      if (!user) {
        return Response.json({
          success: false,
          message: "User not found",
        }, { status: 404 });
      }

      // Check for existing interview and feedback
      const existingInterview = await withRetry(() => 
        prisma.interviews.findUnique({
          where: { id: interviewId },
          include: {
            feedbacks: {
              include: {
                detailed_feedbacks: {
                  include: {
                    question_feedbacks: true,
                  },
                },
                category_scores: true,
              },
            },
          },
        })
      );

      let interviewRecord: { id: string; feedbacks?: any[] };

      if (existingInterview) {
        console.log(`✓ Found existing interview: ${interviewId}`);
        interviewRecord = existingInterview;

        if (existingInterview.feedbacks && existingInterview.feedbacks.length > 0) {
          console.log("⚠ Interview already has feedback, returning existing");
          return Response.json({
            success: true,
            interviewId: existingInterview.id,
            message: "Feedback already exists for this interview",
            feedback: existingInterview.feedbacks[0],
          });
        }
      } else {
        console.log("Creating new interview record...");

        // Fallbacks if job doesn't exist to prevent crashes
        const safeJob = job || {};
        const techstackString = Array.isArray(safeJob.requirements)
          ? safeJob.requirements.join(", ")
          : String(safeJob.requirements || "General Tech Stack");

        const newInterview = await withRetry(() =>
          prisma.interviews.create({
            data: {
              id: interviewId,
              role: truncateString(safeJob.title, 255) || "Unknown Role",
              level: truncateString(safeJob.level, 100) || "Unknown Level",
              questions: JSON.stringify(interviewQs || []),
              techstack: truncateString(techstackString, 500),
              type: truncateString(safeJob.type, 100) || "General",
              userId: userId,
              finalized: false,
              updatedAt: new Date(),
            },
          })
        );
        interviewRecord = newInterview;
        console.log(`✓ Created interview: ${newInterview.id}`);
      }

      // Format transcript
      let formattedTranscript = "";

      if (useResumeFallback && resumeData) {
        formattedTranscript = `
Resume-Based Assessment for ${userName || "Candidate"}

CANDIDATE PROFILE:
- Skills: ${Array.isArray(resumeData.skills) ? resumeData.skills.join(", ") : resumeData.skills || "Not specified"}
- Experience: ${resumeData.experience || "Not specified"}
- Education: ${resumeData.education || "Not specified"}
- Projects: ${resumeData.projects || "Not specified"}
- Achievements: ${resumeData.achievements || "Not specified"}

NOTE: This is a resume-based assessment as the interview was too brief to gather sufficient conversation data.
The feedback below is based on the candidate's resume content and how well it aligns with the ${job?.level || "specified"} level position.
`;
      } else {
        if (!transcript || transcript.length === 0) {
          console.error("Empty transcript received");
          return Response.json({
            success: false,
            message: "No conversation data found. Please conduct a proper interview.",
          }, { status: 400 });
        }

        formattedTranscript = transcript
          .filter((sentence: any) => sentence && sentence.role && sentence.content)
          .map(
            (sentence: { role: string; content: string }) =>
              `- ${sentence.role}: ${sentence.content}\n`,
          )
          .join("");

        console.log(
          "Formatted transcript preview:",
          formattedTranscript.substring(0, 500),
        );
      }

      console.log("Generating feedback with AI...");

      const generator = new InterviewFeedbackGenerator(
        job || {},
        formattedTranscript,
        interviewQs || [],
        userName || "Candidate",
      );

      let result: any;
      try {
        result = await generator.generateCompleteFeedback();
      } catch (aiError) {
        console.error("AI feedback generation failed:", aiError);
        return Response.json({
          success: false,
          message: "Failed to generate feedback from AI. Please try again.",
          error: process.env.NODE_ENV === "development" 
            ? { message: (aiError as Error).message }
            : undefined,
        }, { status: 500 });
      }

      console.log("✓ AI feedback generated successfully");
      console.log("Generated feedback structure:", {
        has_summary: !!result.interview_summary,
        has_scorecard: !!result.scorecard,
        question_count: result.per_question_feedback?.length || 0,
        has_recommendations: !!result.final_recommendations,
      });

      // Validate LLM response
      if (!result || typeof result !== "object") {
        console.error("Invalid feedback response from LLM:", result);
        return Response.json({
          success: false,
          message: "Invalid feedback response from AI",
        }, { status: 500 });
      }

      // Extract data from the nested structure with safe defaults
      const interviewSummary = result.interview_summary || {};
      const scorecard = result.scorecard || {};
      const questionFeedbacks = Array.isArray(result.per_question_feedback) 
        ? result.per_question_feedback 
        : [];
      const finalRecommendations = result.final_recommendations || {};

      // Parse strengths and areas for improvement
      const notableStrengths = parseArrayToString(interviewSummary.notable_strengths) 
        || "Candidate showed general competence.";
      const areasForImprovement = parseArrayToString(interviewSummary.areas_for_improvement) 
        || "Nothing specific noted.";
      const practiceFocusAreas = parseArrayToString(finalRecommendations.practice_focus_areas) 
        || "Focus on building experience.";

      // Prepare all data before transaction
      const feedbackId = crypto.randomUUID();
      const detailedFeedbackId = crypto.randomUUID();

      const feedbackData = {
        id: feedbackId,
        interviewId: interviewRecord.id,
        userId: userId,
        totalScore: safeParseFloat(interviewSummary.overall_rating, 5),
        strengths: truncateString(notableStrengths, 5000),
        areasForImprovement: truncateString(areasForImprovement, 5000),
        finalAssessment: truncateString(
          finalRecommendations.overall_impression ||
          interviewSummary.overall_analysis ||
          "Average performance overall.",
          5000
        ),
        updatedAt: new Date(),
      };

      const categoryScoresData: CategoryScoreData[] = [];
      
      if (scorecard.technical_skills) {
        categoryScoresData.push({
          id: crypto.randomUUID(),
          feedbackId: feedbackId,
          name: "Technical Skills",
          score: safeParseFloat(scorecard.technical_skills.score, 5),
          comment: truncateString(scorecard.technical_skills.commentary || "No specific feedback.", 2000),
        });
      }

      if (scorecard.problem_solving) {
        categoryScoresData.push({
          id: crypto.randomUUID(),
          feedbackId: feedbackId,
          name: "Problem Solving",
          score: safeParseFloat(scorecard.problem_solving.score, 5),
          comment: truncateString(scorecard.problem_solving.commentary || "No specific feedback.", 2000),
        });
      }

      if (scorecard.communication) {
        categoryScoresData.push({
          id: crypto.randomUUID(),
          feedbackId: feedbackId,
          name: "Communication",
          score: safeParseFloat(scorecard.communication.score, 5),
          comment: truncateString(scorecard.communication.commentary || "No specific feedback.", 2000),
        });
      }

      if (scorecard.confidence) {
        categoryScoresData.push({
          id: crypto.randomUUID(),
          feedbackId: feedbackId,
          name: "Confidence",
          score: safeParseFloat(scorecard.confidence.score, 5),
          comment: truncateString(scorecard.confidence.commentary || "No specific feedback.", 2000),
        });
      }

      const detailedFeedbackData = {
        id: detailedFeedbackId,
        feedbackId: feedbackId,
        overallAnalysis: truncateString(
          interviewSummary.overall_analysis || "General analysis placeholder.",
          5000
        ),
        notableStrengths: truncateString(notableStrengths, 5000),
        areasForImprovement: truncateString(areasForImprovement, 5000),
        overallRating: safeParseFloat(interviewSummary.overall_rating, 5),
        technicalSkillsScore: safeParseInt(scorecard?.technical_skills?.score, 5),
        technicalSkillsCommentary: truncateString(
          scorecard?.technical_skills?.commentary || "No commentary.",
          2000
        ),
        problemSolvingScore: safeParseInt(scorecard?.problem_solving?.score, 5),
        problemSolvingCommentary: truncateString(
          scorecard?.problem_solving?.commentary || "No commentary.",
          2000
        ),
        communicationScore: safeParseInt(scorecard?.communication?.score, 5),
        communicationCommentary: truncateString(
          scorecard?.communication?.commentary || "No commentary.",
          2000
        ),
        confidenceScore: safeParseInt(scorecard?.confidence?.score, 5),
        confidenceCommentary: truncateString(
          scorecard?.confidence?.commentary || "No commentary.",
          2000
        ),
        practiceFocusAreas: truncateString(practiceFocusAreas, 2000),
        overallImpression: truncateString(
          finalRecommendations.overall_impression || "A standard performance.",
          2000
        ),
        finalTip: truncateString(finalRecommendations.final_tip || "Keep practicing.", 1000),
        updatedAt: new Date(),
      };

      // Prepare question feedback data
      const questionFeedbackData = questionFeedbacks
        .filter((qf: any) => qf && qf.question)
        .map((qf: any, index: number) => {
          const evaluation = qf.evaluation || {};
          const expectedPoints = parseArrayToString(qf.expected_ideal_points);
          const missedPoints = parseArrayToString(evaluation.missed_points);
          const candidateAnswer = qf.candidate_answer || "No answer recorded";

          console.log(
            `Question ${index + 1}: ${String(qf.question || "").substring(0, 50)}...`
          );
          console.log(
            `Answer preview: ${candidateAnswer.substring(0, 100)}...`
          );

          return {
            id: crypto.randomUUID(),
            detailedFeedbackId: detailedFeedbackId,
            questionId: safeParseInt(qf.question_id, index + 1),
            question: truncateString(qf.question, 2000),
            candidateAnswer: truncateString(candidateAnswer, 10000),
            candidateAnswerSummary: null,
            actualAnswer: truncateString(qf.actual_answer, 10000) || null,
            expectedIdealPoints: truncateString(expectedPoints || "N/A", 5000),
            recommendation: truncateString(
              qf.recommendation || "No specific recommendation.",
              2000
            ),
            evaluationScore: safeParseInt(evaluation.score, 5),
            evaluationCoverage: truncateString(evaluation.coverage || "Basic", 500),
            evaluationMissedPoints: truncateString(missedPoints || "None identified.", 2000),
            evaluationDepth: truncateString(evaluation.depth || "Satisfactory", 500),
            updatedAt: new Date(),
          };
        });

      console.log(`Processing ${questionFeedbackData.length} question feedbacks...`);

      // Execute database operations with smaller transactions and retry logic
      try {
        // Step 1: Create feedback record
        await withRetry(async () => {
          await prisma.feedbacks.create({
            data: feedbackData,
          });
          console.log("✓ Created feedback record");
        });

        // Step 2: Create category scores
        if (categoryScoresData.length > 0) {
          await withRetry(async () => {
            await prisma.category_scores.createMany({
              data: categoryScoresData,
            });
            console.log(`✓ Created ${categoryScoresData.length} category scores`);
          });
        }

        // Step 3: Create detailed feedback
        await withRetry(async () => {
          await prisma.detailed_feedbacks.create({
            data: detailedFeedbackData,
          });
          console.log("✓ Created detailed feedback");
        });

        // Step 4: Create question feedbacks (one at a time to avoid bulk insert issues)
        if (questionFeedbackData.length > 0) {
          for (let i = 0; i < questionFeedbackData.length; i++) {
            await withRetry(async () => {
              await prisma.question_feedbacks.create({
                data: questionFeedbackData[i],
              });
            });
          }
          console.log(`✓ Stored ${questionFeedbackData.length} question feedbacks`);
        }

        // Step 5: Mark interview as finalized
        await withRetry(async () => {
          await prisma.interviews.update({
            where: { id: interviewRecord.id },
            data: {
              finalized: true,
              updatedAt: new Date(),
            },
          });
          console.log("✓ Interview marked as finalized");
        });

      } catch (dbError) {
        console.error("Database operation failed:", dbError);
        
        // Attempt cleanup on failure
        try {
          await prisma.feedbacks.deleteMany({
            where: { id: feedbackId },
          });
          console.log("✓ Cleaned up partial feedback data");
        } catch (cleanupError) {
          console.warn("Cleanup failed (may be nothing to clean):", cleanupError);
        }

        return Response.json({
          success: false,
          message: "Failed to save feedback to database",
          error: process.env.NODE_ENV === "development"
            ? { message: (dbError as Error).message }
            : undefined,
        }, { status: 500 });
      }

      console.log("=== FEEDBACK GENERATION COMPLETED SUCCESSFULLY ===");

      return Response.json({
        success: true,
        interviewId: interviewRecord.id,
        feedback: result,
        message: "Feedback generated and saved successfully",
      });

    } catch (error) {
      console.error("Error generating/saving feedback:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      return Response.json(
        {
          success: false,
          message: "Failed to generate or save feedback",
          error:
            process.env.NODE_ENV === "development"
              ? { message: errorMessage, stack: (error as Error).stack }
              : { message: errorMessage },
        },
        { status: 500 },
      );
    }
  }
}

export async function GET() {
  return Response.json({ message: "All righty !!" });
}
