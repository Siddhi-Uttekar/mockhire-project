export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const candidateFeedbackSchema = z.object({
  overallExperience: z.number(),
  nps: z.number(),
  bestPart: z.string().optional(),
  worstPart: z.string().optional(),
  platformUsability: z.number(),
  clarityOfInstructions: z.number(),
  technicalIssues: z.enum(["yes", "no"]),
  technicalIssuesDescription: z.string().optional(),
  fairness: z.number(),
  relevance: z.number(),
  opportunityToDemonstrateSkills: z.enum(["yes", "no"]),
  inclusivity: z.string().optional(),
  feedbackHelpfulness: z.number(),
  feedbackConstructiveness: z.number(),
  feedbackTimeliness: z.number(),
  mostUsefulFeedback: z.string().optional(),
  perceptionChange: z.string().optional(),
  perceptionChangeDescription: z.string().optional(),
  interviewId: z.string(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const parsed = candidateFeedbackSchema.parse(json);
    const data = {
      overallExperience: parsed.overallExperience,
      nps: parsed.nps,
      bestPart: parsed.bestPart,
      worstPart: parsed.worstPart,
      platformUsability: parsed.platformUsability,
      clarityOfInstructions: parsed.clarityOfInstructions,
      technicalIssues: parsed.technicalIssues === "yes",
      technicalIssuesDescription: parsed.technicalIssuesDescription,
      fairness: parsed.fairness,
      relevance: parsed.relevance,
      opportunityToDemonstrateSkills:
        parsed.opportunityToDemonstrateSkills === "yes",
      inclusivity: parsed.inclusivity,
      feedbackHelpfulness: parsed.feedbackHelpfulness,
      feedbackConstructiveness: parsed.feedbackConstructiveness,
      feedbackTimeliness: parsed.feedbackTimeliness,
      mostUsefulFeedback: parsed.mostUsefulFeedback,
      perceptionChange: parsed.perceptionChange ?? "",
      perceptionChangeDescription: parsed.perceptionChangeDescription,
    };

    await prisma.candidate_feedbacks.create({
      data: {
        id: crypto.randomUUID(),
        ...data,
        userId: user.id,
      },
    });

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }
    console.error(error);
    return new NextResponse(null, { status: 500 });
  }
}
