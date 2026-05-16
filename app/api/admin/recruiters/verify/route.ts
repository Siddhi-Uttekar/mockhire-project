import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const VerifyRecruiterSchema = z.object({
  userId: z.string(),
  status: z.enum(["VERIFIED", "REJECTED"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, status } = VerifyRecruiterSchema.parse(body);

    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: status,
      },
    });

    // TODO: Send notification email to the recruiter

    return NextResponse.json({ message: "Recruiter status updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
