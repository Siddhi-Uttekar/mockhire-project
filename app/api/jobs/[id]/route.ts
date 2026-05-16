import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUserFromRequest(request);

    const jobRaw = await prisma.jobs.findUnique({
      where: { id: parseInt(id) },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            companyName: true,
            companyWebsite: true,
            industry: true,
            companySize: true,
          },
        },
        applications: {
          select: { id: true },
        },
      },
    });

    if (!jobRaw) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 },
      );
    }

    // If job is not published, only the author recruiter can view it
    if (jobRaw.status !== "PUBLISHED") {
      if (!user || user.role !== "RECRUITER" || jobRaw.authorId !== user.id) {
        return NextResponse.json(
          { success: false, message: "Job not found" },
          { status: 404 },
        );
      }
    }

    // Increment view count for published jobs (non-recruiter views)
    if (jobRaw.status === "PUBLISHED" && (!user || user.role !== "RECRUITER")) {
      await prisma.jobs.update({
        where: { id: parseInt(id) },
        data: { viewCount: { increment: 1 } },
      });
    }

    // Transform job to include skills as array and recruiter info
    const job = {
      ...jobRaw,
      skills: jobRaw.skills ? jobRaw.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      recruiter: jobRaw.User
        ? {
            id: jobRaw.User.id,
            name: jobRaw.User.name,
            companyName: jobRaw.User.companyName,
            companyWebsite: jobRaw.User.companyWebsite,
            industry: jobRaw.User.industry,
            companySize: jobRaw.User.companySize,
          }
        : null,
      _count: {
        applications: jobRaw.applications.length,
      },
      User: undefined,
      applications: undefined,
    };

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Job fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUserFromRequest(request);

    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const job = await prisma.jobs.findUnique({
      where: { id: parseInt(id) },
    });

    if (!job || job.authorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Job not found or unauthorized" },
        { status: 404 },
      );
    }

    await prisma.jobs.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Job deletion error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUserFromRequest(request);

    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const job = await prisma.jobs.findUnique({
      where: { id: parseInt(id) },
    });

    if (!job || job.authorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Job not found or unauthorized" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      location,
      aboutCompany,
      responsibilities,
      qualifications,
      benefits,
      status,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      salaryCurrency,
      skills,
      category,
      remote,
      applicationDeadline,
    } = body;

    // Convert skills array to string if needed
    const skillsString = skills !== undefined
      ? (Array.isArray(skills) ? skills.join(",") : skills)
      : undefined;

    const updatedJob = await prisma.jobs.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(location && { location }),
        ...(aboutCompany !== undefined && { aboutCompany }),
        ...(responsibilities !== undefined && { responsibilities }),
        ...(qualifications !== undefined && { qualifications }),
        ...(benefits !== undefined && { benefits }),
        ...(status && { status }),
        ...(jobType && { jobType }),
        ...(experienceLevel && { experienceLevel }),
        ...(salaryMin !== undefined && {
          salaryMin: salaryMin ? parseInt(String(salaryMin)) : null,
        }),
        ...(salaryMax !== undefined && {
          salaryMax: salaryMax ? parseInt(String(salaryMax)) : null,
        }),
        ...(salaryCurrency && { salaryCurrency }),
        ...(skillsString !== undefined && { skills: skillsString }),
        ...(category !== undefined && { category }),
        ...(remote !== undefined && { remote: Boolean(remote) }),
        ...(applicationDeadline !== undefined && {
          applicationDeadline: applicationDeadline
            ? new Date(applicationDeadline)
            : null,
        }),
      },
    });

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error("Job update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
