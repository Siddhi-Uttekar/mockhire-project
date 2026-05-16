import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const pendingRecruiters = await prisma.user.findMany({
      where: {
        role: "RECRUITER",
        verificationStatus: "PENDING_MANUAL_REVIEW",
      },
    });

    return NextResponse.json(pendingRecruiters);
  } catch (error) {
    console.error("Failed to fetch pending recruiters:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
