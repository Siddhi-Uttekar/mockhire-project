"use client";

import React, { useEffect, useState } from "react";
import withRecruiterAuth from "@/hooks/withRecruiterAuth";
import RecruiterNavbar from "@/components/RecruiterNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Clock,
  Briefcase,
  ChevronDown,
  X,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";

const STATUS_OPTIONS = [
  {
    value: "PENDING",
    label: "Pending",
    color: "bg-amber-500/15 text-amber-100",
  },
  {
    value: "REVIEWING",
    label: "Reviewing",
    color: "bg-sky-500/15 text-sky-100",
  },
  {
    value: "SHORTLISTED",
    label: "Shortlisted",
    color: "bg-amber-500/15 text-amber-100",
  },
  {
    value: "INTERVIEW_SCHEDULED",
    label: "Interview Scheduled",
    color: "bg-violet-500/15 text-violet-100",
  },
  {
    value: "INTERVIEWED",
    label: "Interviewed",
    color: "bg-indigo-500/15 text-indigo-100",
  },
  {
    value: "OFFERED",
    label: "Offer Extended",
    color: "bg-amber-500/15 text-slate-100",
  },
  { value: "HIRED", label: "Hired", color: "bg-amber-400 text-amber-950" },
  { value: "REJECTED", label: "Rejected", color: "bg-red-500/15 text-red-100" },
];

function RecruiterApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [filterJob, setFilterJob] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchApps();
    fetchJobs();
  }, []);

  const fetchApps = async () => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      const res = await fetch("/api/applications?role=recruiter", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (data?.success && data.applications) {
        setApps(data.applications);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchJobs = async () => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      const res = await fetch("/api/jobs?recruiter=true", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (data?.jobs) {
        setJobs(data.jobs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    setUpdating(appId);
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      const res = await fetch("/api/applications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: appId, status: newStatus }),
      });
      const data = await res.json();
      if (data?.success && data.application) {
        setApps((prev) =>
          prev.map((a) => (a.id === appId ? data.application : a)),
        );
        // Broadcast update to other tabs
        try {
          const bc = new BroadcastChannel("applications-updates");
          bc.postMessage({
            type: "status-update",
            id: appId,
            status: newStatus,
          });
          bc.close();
        } catch (e) {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusConfig = (status: string) => {
    return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get unique jobs for filter
  const uniqueJobs = jobs.map((job) => job.id);
  const jobsMap = new Map(jobs.map((job) => [job.id, job]));

  // Filter applications
  const filteredApps = apps.filter((app) => {
    if (filterJob && String(app.job?.id) !== filterJob) return false;
    if (filterStatus && app.status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name =
        `${app.fullName || ""} ${app.candidate?.name || ""}`.toLowerCase();
      const email = (app.email || app.candidate?.email || "").toLowerCase();
      if (!name.includes(query) && !email.includes(query)) return false;
    }
    return true;
  });

  // Group by job
  const grouped: Record<string, any[]> = {};
  filteredApps.forEach((a) => {
    const jobId = a.job?.id || "unknown";
    if (!grouped[jobId]) grouped[jobId] = [];
    grouped[jobId].push(a);
  });

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
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage candidate applications
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterJob}
                  onChange={(e) => setFilterJob(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background min-w-[180px]"
                >
                  <option value="">All Jobs</option>
                  {uniqueJobs.map((jobId) => (
                    <option key={jobId} value={jobId}>
                      {jobsMap.get(jobId)?.title || "Unknown Job"}
                    </option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background min-w-[150px]"
                >
                  <option value="">All Statuses</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {(filterJob || filterStatus || searchQuery) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFilterJob("");
                      setFilterStatus("");
                      setSearchQuery("");
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold">{apps.length}</p>
              <p className="text-sm text-gray-500">Total Applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-yellow-600">
                {apps.filter((a) => a.status === "PENDING").length}
              </p>
              <p className="text-sm text-gray-500">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-orange-300">
                {apps.filter((a) => a.status === "SHORTLISTED").length}
              </p>
              <p className="text-sm text-gray-500">Shortlisted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-purple-600">
                {
                  apps.filter((a) =>
                    ["INTERVIEW_SCHEDULED", "INTERVIEWED"].includes(a.status),
                  ).length
                }
              </p>
              <p className="text-sm text-gray-500">Interviewing</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        {Object.keys(grouped).length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {apps.length === 0
                  ? "No applications yet"
                  : "No matching applications"}
              </h2>
              <p className="text-gray-500">
                {apps.length === 0
                  ? "Applications will appear here when candidates apply to your jobs"
                  : "Try adjusting your filters"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([jobId, list]) => (
              <Card key={jobId}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 rounded-lg">
                        <Briefcase className="w-5 h-5 text-amber-200" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {list[0].job?.title || "Position Unavailable"}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {list.length} application
                          {list.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <Link href={`/recruiter/edit-job/${jobId}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Job
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {list.map((app: any) => {
                      const statusConfig = getStatusConfig(app.status);
                      return (
                        <div
                          key={app.id}
                          className="border border-border rounded-lg p-4 hover:border-amber-300 transition-colors bg-card"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-foreground font-semibold shrink-0">
                                {(app.fullName || app.candidate?.name || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-semibold">
                                  {app.fullName ||
                                    app.candidate?.name ||
                                    "Unknown"}
                                </h4>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {app.email || app.candidate?.email}
                                  </span>
                                  {app.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {app.phone}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Applied {formatDate(app.createdAt)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <select
                                value={app.status}
                                onChange={(e) =>
                                  updateStatus(app.id, e.target.value)
                                }
                                disabled={updating === app.id}
                                className={`px-3 py-1.5 border rounded-md text-sm font-medium ${statusConfig.color}`}
                              >
                                {STATUS_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>

                              <div className="flex items-center gap-2">
                                {app.resumeUrl && (
                                  <a
                                    href={app.resumeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-muted-foreground hover:text-amber-200 p-2"
                                    title="View Resume"
                                  >
                                    <FileText className="w-5 h-5" />
                                  </a>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedApp(app)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {selectedApp && (
          <DetailsModal
            app={selectedApp}
            onClose={() => setSelectedApp(null)}
          />
        )}
      </main>
    </div>
  );
}

function DetailsModal({ app, onClose }: { app: any; onClose: () => void }) {
  if (!app) return null;

  const statusConfig =
    STATUS_OPTIONS.find((s) => s.value === app.status) || STATUS_OPTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto m-4 border border-border">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Application Details</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center text-amber-200 text-xl font-bold">
                {(app.fullName || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {app.fullName || app.candidate?.name}
                </h2>
                <p className="text-gray-500">{app.job?.title}</p>
              </div>
            </div>
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-medium">{app.email || app.candidate?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <p className="font-medium">{app.phone || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Applied On</p>
              <p className="font-medium">
                {new Date(app.createdAt).toLocaleDateString()}
              </p>
            </div>
            {app.linkedin && (
              <div>
                <p className="text-sm text-gray-500 mb-1">LinkedIn</p>
                <a
                  href={app.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-200 hover:underline"
                >
                  View Profile
                </a>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          {app.coverLetter && (
            <div>
              <h4 className="font-semibold mb-2">Cover Letter</h4>
              <div className="bg-background p-4 rounded-lg border border-border">
                <p className="whitespace-pre-wrap text-foreground">
                  {app.coverLetter}
                </p>
              </div>
            </div>
          )}

          {/* Resume */}
          {app.resumeUrl && (
            <div>
              <h4 className="font-semibold mb-2">Resume</h4>
              <a
                href={app.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-amber-200 hover:underline"
              >
                <FileText className="w-4 h-4" />
                View Resume
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Notes */}
          {app.notes && (
            <div>
              <h4 className="font-semibold mb-2">Internal Notes</h4>
              <div className="bg-background p-4 rounded-lg border border-border">
                <p className="whitespace-pre-wrap text-foreground">{app.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-2">
          {app.candidate?.email && (
            <a href={`mailto:${app.candidate.email}`}>
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Email Candidate
              </Button>
            </a>
          )}
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

export default withRecruiterAuth(RecruiterApplicationsPage);
