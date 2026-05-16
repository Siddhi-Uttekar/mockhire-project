import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    const interviews = await prisma.interviews.findMany({
      where: {
        userId: userId,
        finalized: true,
      },
      include: {
        feedbacks: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      { success: true, data: interviews },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    // Don't disconnect a shared PrismaClient on each request.
  }
}

export async function POST(req: Request) {
  const { id, userId } = await req.json();

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing id" },
      { status: 400 }
    );
  }
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    console.log("Fetching interview with id:", id, "for userId:", userId);
    const interview = await prisma.interviews.findFirst({
      where: {
        id: id,
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            email: true,
          },
        },
        feedbacks: {
          include: {
            categoryScores: true,
            detailedFeedback: {
              include: {
                questionFeedbacks: true,
              },
            },
          },
        },
      },
    });
    console.log("Fetched interview:", interview);
    if (!interview) {
      return NextResponse.json(
        { success: false, error: "Interview not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: interview },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching interview:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    // Don't disconnect a shared PrismaClient on each request.
  }
}
