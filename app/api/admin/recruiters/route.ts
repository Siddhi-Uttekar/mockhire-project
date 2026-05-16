import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    // In a real application, you'd want to check if the user is an admin here.
    // For now, we'll assume the user is authorized.
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const pendingRecruiters = await prisma.user.findMany({
      where: {
        role: "RECRUITER",
        isVerified: false,
      },
    });

    return NextResponse.json(pendingRecruiters);
  } catch (error) {
    console.error("Error fetching pending recruiters:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
