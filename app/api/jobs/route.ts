import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
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
      // New fields
      status = "PUBLISHED",
      jobType = "FULL_TIME",
      experienceLevel = "MID_LEVEL",
      salaryMin,
      salaryMax,
      salaryCurrency = "USD",
      skills,
      category,
      remote = false,
      applicationDeadline,
    } = body;

    if (!title || !description || !location) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, description, and location are required",
        },
        { status: 400 },
      );
    }

    // Convert skills array to comma-separated string for storage
    const skillsString = Array.isArray(skills) ? skills.join(",") : skills || null;

    const job = await prisma.jobs.create({
      data: {
        title,
        description,
        location,
        aboutCompany: aboutCompany || "",
        responsibilities: responsibilities || "",
        qualifications: qualifications || "",
        benefits: benefits || "",
        authorId: user.id,
        status,
        jobType,
        experienceLevel,
        salaryMin: salaryMin ? parseInt(String(salaryMin)) : null,
        salaryMax: salaryMax ? parseInt(String(salaryMax)) : null,
        salaryCurrency,
        skills: skillsString,
        category: category || null,
        remote: Boolean(remote),
        applicationDeadline: applicationDeadline
          ? new Date(applicationDeadline)
          : null,
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const { searchParams } = new URL(request.url);

    // Query parameters for filtering
    const search = searchParams.get("search");
    const jobType = searchParams.get("jobType");
    const experienceLevel = searchParams.get("experienceLevel");
    const location = searchParams.get("location");
    const remote = searchParams.get("remote");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause
    const where: any = {};

    // If recruiter is authenticated, return only their job postings
    if (user && user.role === "RECRUITER") {
      where.authorId = user.id;
      // Allow recruiter to filter by status
      if (status) {
        where.status = status;
      }
    } else {
      // Public/candidate view: return only published jobs
      where.status = "PUBLISHED";
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { skills: { contains: search, mode: "insensitive" } },
      ];
    }

    // Additional filters
    if (jobType) where.jobType = jobType;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (remote === "true") where.remote = true;
    if (category) where.category = category;

    const [jobsRaw, total] = await Promise.all([
      prisma.jobs.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          User: {
            select: {
              id: true,
              name: true,
              companyName: true,
              companyWebsite: true,
            },
          },
          applications: {
            select: { id: true },
          },
        },
      }),
      prisma.jobs.count({ where }),
    ]);

    // Transform jobs to include skills as array and recruiter info
    const jobs = jobsRaw.map((job) => ({
      ...job,
      skills: job.skills ? job.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      recruiter: job.User
        ? {
            id: job.User.id,
            name: job.User.name,
            companyName: job.User.companyName,
          }
        : null,
      _count: {
        applications: job.applications.length,
      },
      User: undefined, // Remove raw User field
      applications: undefined, // Remove raw applications array
    }));

    return NextResponse.json({
      success: true,
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Job fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
