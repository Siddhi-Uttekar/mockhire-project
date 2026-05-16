import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  console.log("Params received:", resolvedParams);
  const { id } = resolvedParams;
  const userId = request.headers.get("Authorization");

  if (!userId) {
    return new Response(JSON.stringify({ error: "User not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!prisma) {
    console.error("Prisma client is not initialized. Check DATABASE_URL env variable.");
    return new Response(
      JSON.stringify({
        success: false,
        message: "Database connection failed",
        error: "Prisma client is not initialized",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const interview = await prisma.interviews.findUnique({
      where: { id },
      include: {
        feedbacks: {
          include: {
            category_scores: true,
            detailed_feedbacks: {
              include: {
                question_feedbacks: true,
              },
            },
          },
        },
      },
    });

    if (!interview) {
      return new Response(JSON.stringify({ error: "Interview not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data: interview }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching interview:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch interview",
        error:
          process.env.NODE_ENV === "development"
            ? { message: errorMessage, stack: (error as Error).stack }
            : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
