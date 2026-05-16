"use client";
import React, { useEffect, useState } from "react";
import withRecruiterAuth from "@/hooks/withRecruiterAuth";
import RecruiterNavbar from "@/components/RecruiterNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Eye,
  FileText,
  Plus,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface DashboardStats {
  jobs: {
    total: number;
    published: number;
    draft: number;
    closed: number;
  };
  applications: {
    total: number;
    pending: number;
    shortlisted: number;
    byStatus: Record<string, number>;
  };
  views: number;
  recentApplications: any[];
  recentJobs: any[];
}

const RecruiterHomePage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      if (!token) {
        setError("Please log in to view dashboard");
        setLoading(false);
        return;
      }
      
      const response = await fetch("/api/recruiter/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.message || "Failed to load dashboard");
      }
    } catch (err) {
      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      REVIEWING: "bg-blue-100 text-blue-800",
      SHORTLISTED: "bg-pink-950/20 text-orange-300",
      INTERVIEW_SCHEDULED: "bg-purple-100 text-purple-800",
      REJECTED: "bg-red-100 text-red-800",
      HIRED: "bg-pink-950/20 text-slate-100",
    };
    return colors[status] || "bg-muted text-foreground";
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <RecruiterNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-950/100"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <RecruiterNavbar />

      {/* Header */}
      <header className="bg-card border-b border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Manage your job postings and applications
              </p>
            </div>
            <Link href="/recruiter/post-job">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-950/20 border border-red-500/30 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-amber-400">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Total Jobs
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats?.jobs.total || 0}
                  </p>
                  <p className="text-sm text-amber-200 mt-1">
                    {stats?.jobs.published || 0} active
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-full">
                  <Briefcase className="w-6 h-6 text-amber-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-sky-400">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Total Applications
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats?.applications.total || 0}
                  </p>
                  <p className="text-sm text-sky-200 mt-1">
                    {stats?.applications.pending || 0} pending review
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-full">
                  <Users className="w-6 h-6 text-sky-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-violet-400">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Total Views
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats?.views || 0}
                  </p>
                  <p className="text-sm text-violet-200 mt-1">
                    Across all jobs
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-full">
                  <Eye className="w-6 h-6 text-violet-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-400">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Shortlisted
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats?.applications.shortlisted || 0}
                  </p>
                  <p className="text-sm text-orange-200 mt-1">
                    Ready for interview
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-orange-200" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/recruiter/post-job">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <Plus className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-semibold">Post New Job</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a new job listing
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/recruiter/view-jobs">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <Briefcase className="w-5 h-5 text-sky-200" />
                </div>
                <div>
                  <h3 className="font-semibold">Manage Jobs</h3>
                  <p className="text-sm text-muted-foreground">
                    View and edit your listings
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/recruiter/applications">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <FileText className="w-5 h-5 text-violet-200" />
                </div>
                <div>
                  <h3 className="font-semibold">Review Applications</h3>
                  <p className="text-sm text-muted-foreground">
                    Process candidate applications
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <Card>
              <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Applications</CardTitle>
              <Link
                href="/recruiter/applications"
                className="text-sm text-amber-200 hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {stats?.recentApplications &&
              stats.recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentApplications.map((app: any) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {app.candidate?.name || app.fullName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Applied for: {app.job?.title}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(app.createdAt)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(app.status)}>
                        {app.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p>No recent applications</p>
                  <p className="text-sm">
                    Applications will appear here when candidates apply
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card>
              <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Your Job Listings</CardTitle>
              <Link
                href="/recruiter/view-jobs"
                className="text-sm text-amber-200 hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {stats?.recentJobs && stats.recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentJobs.map((job: any) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.location}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {job.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {job._count?.applications || 0} applications
                          </span>
                        </div>
                      </div>
                      <Link href={`/recruiter/edit-job/${job.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p>No jobs posted yet</p>
                  <Link href="/recruiter/post-job">
                    <Button className="mt-2" size="sm">
                      Post Your First Job
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default withRecruiterAuth(RecruiterHomePage);
