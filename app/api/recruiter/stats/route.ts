import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Get job statistics
    const [
      totalJobs,
      publishedJobs,
      draftJobs,
      closedJobs,
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      recentApplications,
      recentJobs,
      applicationsByStatus,
    ] = await Promise.all([
      // Total jobs
      prisma.jobs.count({ where: { authorId: user.id } }),
      // Published jobs
      prisma.jobs.count({ where: { authorId: user.id, status: "PUBLISHED" } }),
      // Draft jobs
      prisma.jobs.count({ where: { authorId: user.id, status: "DRAFT" } }),
      // Closed jobs
      prisma.jobs.count({ where: { authorId: user.id, status: "CLOSED" } }),
      // Total applications for recruiter's jobs
      prisma.applications.count({
        where: { job: { authorId: user.id } },
      }),
      // Pending applications
      prisma.applications.count({
        where: { job: { authorId: user.id }, status: "PENDING" },
      }),
      // Shortlisted applications
      prisma.applications.count({
        where: { job: { authorId: user.id }, status: "SHORTLISTED" },
      }),
      // Recent applications (last 7 days)
      prisma.applications.findMany({
        where: {
          job: { authorId: user.id },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          job: {
            select: { id: true, title: true },
          },
          candidate: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      // Recent jobs
      prisma.jobs.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          applications: {
            select: { id: true },
          },
        },
      }),
      // Applications grouped by status
      prisma.applications.groupBy({
        by: ["status"],
        where: { job: { authorId: user.id } },
        _count: { status: true },
      }),
    ]);

    // Format application status counts
    const statusCounts: Record<string, number> = {};
    applicationsByStatus.forEach((item) => {
      statusCounts[item.status] = item._count.status;
    });

    // Calculate total views
    const totalViews = await prisma.jobs.aggregate({
      where: { authorId: user.id },
      _sum: { viewCount: true },
    });

    // Transform recentJobs to add _count
    const transformedRecentJobs = recentJobs.map((job) => ({
      ...job,
      _count: { applications: job.applications.length },
      applications: undefined,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        jobs: {
          total: totalJobs,
          published: publishedJobs,
          draft: draftJobs,
          closed: closedJobs,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          shortlisted: shortlistedApplications,
          byStatus: statusCounts,
        },
        views: totalViews._sum.viewCount || 0,
        recentApplications,
        recentJobs: transformedRecentJobs,
      },
    });
  } catch (error) {
    console.error("Recruiter stats error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
