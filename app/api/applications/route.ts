import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/session";

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;
const DEFAULT_RESUME_MIME_TYPE = "application/pdf";

function buildStoredResumePayload(fileName: string, mimeType: string, buffer: Buffer) {
  return JSON.stringify({
    fileName,
    mimeType,
    contentBase64: buffer.toString("base64"),
  });
}

function getResumeDownloadUrl(applicationId: string) {
  return `/api/applications/${applicationId}/resume`;
}

function isStoredResumePayload(value: string | null) {
  if (!value) {
    return false;
  }

  try {
    const parsed = JSON.parse(value) as { contentBase64?: string };
    return Boolean(parsed?.contentBase64);
  } catch {
    return false;
  }
}

function mapApplicationResumeUrl<T extends { id: string; resumeUrl: string | null }>(
  application: T,
) {
  if (!isStoredResumePayload(application.resumeUrl)) {
    return application;
  }

  return {
    ...application,
    resumeUrl: getResumeDownloadUrl(application.id),
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    // Candidates must be logged in to apply
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in to apply for jobs" },
        { status: 401 },
      );
    }

    if (user.role === "RECRUITER") {
      return NextResponse.json(
        { success: false, message: "Recruiters cannot apply for jobs" },
        { status: 403 },
      );
    }

    const contentType = request.headers.get("content-type") || "";

    let applicationData: any;
    let resumeUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();

      applicationData = {
        jobId: parseInt(form.get("jobId")?.toString() || "0"),
        fullName:
          form.get("fullName")?.toString() ||
          form.get("firstName")?.toString() +
            " " +
            form.get("lastName")?.toString(),
        email: form.get("email")?.toString() || user.email,
        phone: form.get("phone")?.toString() || null,
        coverLetter:
          form.get("coverLetter")?.toString() ||
          form.get("why")?.toString() ||
          null,
        linkedinUrl:
          form.get("linkedinUrl")?.toString() ||
          form.get("linkedin")?.toString() ||
          null,
        githubUrl:
          form.get("githubUrl")?.toString() ||
          form.get("github")?.toString() ||
          null,
        portfolioUrl: form.get("portfolioUrl")?.toString() || null,
        yearsOfExperience: form.get("yearsOfExperience")
          ? parseInt(form.get("yearsOfExperience")!.toString())
          : null,
        currentCompany:
          form.get("currentCompany")?.toString() ||
          form.get("currentEmployment")?.toString() ||
          null,
        currentTitle: form.get("currentTitle")?.toString() || null,
        expectedSalary: form.get("expectedSalary")
          ? parseInt(form.get("expectedSalary")!.toString())
          : null,
        noticePeriod: form.get("noticePeriod")?.toString() || null,
      };

      // Handle resume upload
      const resume = form.get("resume") as File | null;
      if (resume && resume instanceof Blob) {
        const arrayBuffer = await resume.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length > MAX_RESUME_SIZE_BYTES) {
          return NextResponse.json(
            {
              success: false,
              message: "Resume file is too large. Please upload a file under 5 MB.",
            },
            { status: 400 },
          );
        }

        const fileName = (resume as File).name || "resume.pdf";
        const mimeType =
          (resume as File).type?.trim() || DEFAULT_RESUME_MIME_TYPE;

        resumeUrl = buildStoredResumePayload(fileName, mimeType, buffer);
      }
    } else {
      applicationData = await request.json();
    }

    const { jobId, fullName, email, ...rest } = applicationData;

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "Job ID is required" },
        { status: 400 },
      );
    }

    // Check if job exists and is published
    const job = await prisma.jobs.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 },
      );
    }

    if (job.status !== "PUBLISHED") {
      return NextResponse.json(
        {
          success: false,
          message: "This job is no longer accepting applications",
        },
        { status: 400 },
      );
    }

    // Check if user already applied
    const existingApplication = await prisma.applications.findUnique({
      where: {
        jobId_candidateId: {
          jobId: jobId,
          candidateId: user.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: "You have already applied for this job" },
        { status: 409 },
      );
    }

    // Create application
    const application = await prisma.applications.create({
      data: {
        jobId: jobId,
        candidateId: user.id,
        fullName: fullName || user.name,
        email: email || user.email,
        resumeUrl,
        ...rest,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            User: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      application: mapApplicationResumeUrl(application),
    });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    if (user.role === "RECRUITER") {
      // Recruiters see applications for their jobs
      where.job = {
        authorId: user.id,
      };
      if (jobId) {
        where.jobId = parseInt(jobId);
      }
    } else {
      // Candidates see their own applications
      where.candidateId = user.id;
    }

    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.applications.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              jobType: true,
              status: true,
              User: {
                select: {
                  companyName: true,
                  companyWebsite: true,
                },
              },
            },
          },
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              linkedinProfile: true,
            },
          },
        },
      }),
      prisma.applications.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      applications: applications.map(mapApplicationResumeUrl),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Applications fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { id, status, recruiterNotes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 },
      );
    }

    // Verify the application belongs to a job owned by this recruiter
    const application = await prisma.applications.findUnique({
      where: { id },
      include: {
        job: true,
      },
    });

    if (!application || application.job.authorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Application not found or unauthorized" },
        { status: 404 },
      );
    }

    const updatedApplication = await prisma.applications.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(recruiterNotes !== undefined && { recruiterNotes }),
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      application: mapApplicationResumeUrl(updatedApplication),
    });
  } catch (error) {
    console.error("Application update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
