import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const feedbackSchema = z.object({
  overallExperience: z.string().transform(Number),
  nps: z.string().transform(Number),
  bestPart: z.string().optional(),
  worstPart: z.string().optional(),
  platformUsability: z.string().transform(Number),
  clarityOfInstructions: z.string().transform(Number),
  technicalIssues: z.enum(["yes", "no"]).transform((val) => val === "yes"),
  technicalIssuesDescription: z.string().optional(),
  fairness: z.string().transform(Number),
  relevance: z.string().transform(Number),
  opportunityToDemonstrateSkills: z
    .enum(["yes", "no"])
    .transform((val) => val === "yes"),
  inclusivity: z.string().optional(),
  feedbackHelpfulness: z.string().transform(Number),
  feedbackConstructiveness: z.string().transform(Number),
  feedbackTimeliness: z.string().transform(Number),
  mostUsefulFeedback: z.string().optional(),
  perceptionChange: z.string(),
  perceptionChangeDescription: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const json = await req.json();
    const data = feedbackSchema.parse(json);

    await prisma.candidateFeedback.create({
      data: {
        ...data,
        userId: user?.id,
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
