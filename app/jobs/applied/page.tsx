"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Clock,
  Building,
  FileText,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
} from "lucide-react";

type Application = {
  id: string;
  jobId: string;
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  job?: {
    id: string;
    title: string;
    location: string;
    jobType?: string;
    recruiter?: {
      companyName?: string;
    };
  };
};

const STATUS_CONFIG: Record<
  string,
  { color: string; icon: React.ReactNode; label: string }
> = {
  PENDING: {
    color: "bg-amber-500/15 text-amber-100 border-amber-400/30",
    icon: <Clock className="w-3 h-3" />,
    label: "Pending Review",
  },
  REVIEWING: {
    color: "bg-sky-500/15 text-sky-100 border-sky-400/30",
    icon: <Eye className="w-3 h-3" />,
    label: "Under Review",
  },
  SHORTLISTED: {
    color: "bg-amber-500/15 text-amber-100 border-amber-400/30",
    icon: <CheckCircle className="w-3 h-3" />,
    label: "Shortlisted",
  },
  INTERVIEW_SCHEDULED: {
    color: "bg-violet-500/15 text-violet-100 border-violet-400/30",
    icon: <Calendar className="w-3 h-3" />,
    label: "Interview Scheduled",
  },
  INTERVIEWED: {
    color: "bg-indigo-500/15 text-indigo-100 border-indigo-400/30",
    icon: <CheckCircle className="w-3 h-3" />,
    label: "Interviewed",
  },
  OFFERED: {
    color: "bg-amber-500/15 text-slate-100 border-amber-400/30",
    icon: <CheckCircle className="w-3 h-3" />,
    label: "Offer Extended",
  },
  HIRED: {
    color: "bg-amber-400 text-amber-950 border-amber-300",
    icon: <CheckCircle className="w-3 h-3" />,
    label: "Hired",
  },
  REJECTED: {
    color: "bg-red-500/15 text-red-100 border-red-400/30",
    icon: <XCircle className="w-3 h-3" />,
    label: "Not Selected",
  },
  WITHDRAWN: {
    color: "bg-muted text-foreground border-border",
    icon: <XCircle className="w-3 h-3" />,
    label: "Withdrawn",
  },
};

export default function AppliedJobsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApps() {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (!token) {
          setError("Please log in to view your applications");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data?.success && data.applications) {
          setApps(data.applications);
        } else {
          setError(data.message || "Failed to load applications");
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load applications");
      } finally {
        setLoading(false);
      }
    }
    fetchApps();

    // Listen for status updates from recruiters
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("applications-updates");
      bc.onmessage = (ev) => {
        const msg = ev.data;
        if (msg?.type === "status-update") {
          setApps((prev) =>
            prev.map((a) =>
              a.id === msg.id ? { ...a, status: msg.status } : a,
            ),
          );
        }
      };
    } catch (e) {
      // BroadcastChannel not supported
    }

    return () => {
      try {
        bc?.close();
      } catch (e) {}
    };
  }, []);

  const getStatusConfig = (status: string) => {
    return (
      STATUS_CONFIG[status] || {
        color: "bg-muted text-foreground border-border",
        icon: <AlertCircle className="w-3 h-3" />,
        label: status,
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-950/100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-16">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-200 mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">{error}</h1>
          <Link href="/login">
            <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Group applications by status
  const activeApps = apps.filter(
    (a) => !["REJECTED", "WITHDRAWN", "HIRED"].includes(a.status),
  );
  const closedApps = apps.filter((a) =>
    ["REJECTED", "WITHDRAWN", "HIRED"].includes(a.status),
  );

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header */}
      <div className="bg-card border-b border-border py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Track the status of your job applications
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {apps.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No applications yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Start applying to jobs to track your applications here
              </p>
              <Link href="/jobs">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Browse Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-foreground">
                    {apps.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Applied</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-sky-200">
                    {apps.filter((a) => a.status === "REVIEWING").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-amber-200">
                    {
                      apps.filter(
                        (a) =>
                          a.status === "SHORTLISTED" ||
                          a.status === "INTERVIEW_SCHEDULED",
                      ).length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-sky-200">
                    {
                      apps.filter(
                        (a) => a.status === "HIRED" || a.status === "OFFERED",
                      ).length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Offers</p>
                </CardContent>
              </Card>
            </div>

            {/* Active Applications */}
            {activeApps.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-foreground">
                  Active Applications ({activeApps.length})
                </h2>
                <div className="space-y-4">
                  {activeApps.map((app) => {
                    const statusConfig = getStatusConfig(app.status);
                    return (
                      <Card
                        key={app.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-4">
                                <div className="bg-muted w-12 h-12 rounded-lg flex items-center justify-center text-amber-100 font-bold shrink-0">
                                  {(
                                    app.job?.recruiter?.companyName ||
                                    app.job?.title ||
                                    "?"
                                  )
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link
                                    href={`/jobs/${app.jobId}`}
                                    className="hover:text-amber-200"
                                  >
                                    <h3 className="font-semibold text-lg truncate">
                                      {app.job?.title || "Position Unavailable"}
                                    </h3>
                                  </Link>
                                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1">
                                      <Building className="w-4 h-4" />
                                      {app.job?.recruiter?.companyName ||
                                        "Company"}
                                    </span>
                                    {app.job?.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {app.job.location}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Applied {formatDate(app.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <Badge
                                className={`${statusConfig.color} flex items-center gap-1 border`}
                              >
                                {statusConfig.icon}
                                {statusConfig.label}
                              </Badge>

                              <div className="flex items-center gap-2">
                                {app.resumeUrl && (
                                  <a
                                    href={app.resumeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-muted-foreground hover:text-amber-200"
                                    title="View Resume"
                                  >
                                    <FileText className="w-5 h-5" />
                                  </a>
                                )}
                                <Link href={`/jobs/${app.jobId}`}>
                                  <Button variant="outline" size="sm">
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    View Job
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Closed Applications */}
            {closedApps.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
                  Past Applications ({closedApps.length})
                </h2>
                <div className="space-y-4 opacity-75">
                  {closedApps.map((app) => {
                    const statusConfig = getStatusConfig(app.status);
                    return (
                      <Card key={app.id} className="bg-background border border-border">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-4">
                                <div className="bg-muted w-12 h-12 rounded-lg flex items-center justify-center text-foreground font-bold shrink-0">
                                  {(
                                    app.job?.recruiter?.companyName ||
                                    app.job?.title ||
                                    "?"
                                  )
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-lg truncate text-foreground">
                                    {app.job?.title || "Position Unavailable"}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1">
                                      <Building className="w-4 h-4" />
                                      {app.job?.recruiter?.companyName ||
                                        "Company"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Applied {formatDate(app.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Badge
                              className={`${statusConfig.color} flex items-center gap-1 border`}
                            >
                              {statusConfig.icon}
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
