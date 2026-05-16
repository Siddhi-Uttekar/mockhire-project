import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    // In a real application, you'd want to check if the user is an admin here.
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const recruiterId = params.id;

    await prisma.user.update({
      where: {
        id: recruiterId,
      },
      data: {
        isVerified: true,
      },
    });

    return new NextResponse(null, { status: 204 }); // No content
  } catch (error) {
    console.error("Error approving recruiter:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
