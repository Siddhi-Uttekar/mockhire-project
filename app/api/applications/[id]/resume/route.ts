import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/session";

type ResumePayload = {
  fileName?: string;
  mimeType?: string;
  contentBase64?: string;
};

function parseStoredResumePayload(value: string | null): ResumePayload | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as ResumePayload;
    if (!parsed?.contentBase64) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    const application = await prisma.applications.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 },
      );
    }

    const canAccess =
      application.candidateId === user.id ||
      (user.role === "RECRUITER" && application.job.authorId === user.id);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const payload = parseStoredResumePayload(application.resumeUrl);

    if (!payload?.contentBase64) {
      return NextResponse.json(
        { success: false, message: "Resume not found" },
        { status: 404 },
      );
    }

    const fileBuffer = Buffer.from(payload.contentBase64, "base64");
    const fileName = payload.fileName || "resume.pdf";
    const mimeType = payload.mimeType || "application/pdf";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Resume download error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
